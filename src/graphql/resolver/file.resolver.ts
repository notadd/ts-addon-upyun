
import { HttpException, Inject, UseInterceptors } from "@nestjs/common";
import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { IncomingMessage } from "http";
import { Repository } from "typeorm";
import { ExceptionInterceptor } from "../../interceptor/exception.interceptor";
import { Data } from "../../interface/data";
import { AllBody } from "../../interface/file/all.body";
import { AllData } from "../../interface/file/all.data";
import { DownloadProcessData } from "../../interface/file/download.process.data";
import { FileLocationBody } from "../../interface/file/file.location.body";
import { OneBody } from "../../interface/file/one.body";
import { OneData } from "../../interface/file/one.data";
import { Policy } from "../../interface/file/policy";
import { UploadProcessBody } from "../../interface/file/upload.process.body";
import { UploadProcessData } from "../../interface/file/upload.process.data";
import { Audio } from "../../model/audio.entity";
import { Bucket } from "../../model/bucket.entity";
import { Document } from "../../model/document.entity";
import { File } from "../../model/file.entity";
import { Image } from "../../model/image.entity";
import { Video } from "../../model/video.entity";
import { ConfigService } from "../../service/config.service";
import { FileService } from "../../service/file.service";
import { AuthUtil } from "../../util/auth.util";
import { KindUtil } from "../../util/kind.util";
import { RestfulUtil } from "../../util/restful.util";

@Resolver("File")
@UseInterceptors(ExceptionInterceptor)
export class FileResolver {

    constructor(
        @Inject(AuthUtil) private readonly authUtil: AuthUtil,
        @Inject(KindUtil) private readonly kindUtil: KindUtil,
        @Inject(RestfulUtil) private readonly restfulUtil: RestfulUtil,
        @Inject(FileService) private readonly fileService: FileService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
        @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    }

    @Query("downloadProcess")
    async downloadProcess(req: IncomingMessage, body: FileLocationBody): Promise<DownloadProcessData> {
        const data: DownloadProcessData = {
            code: 200,
            message: "下载预处理成功",
            method: "get",
            headers: {
                authorization: "",
                date: ""
            },
            url: "https://v0.api.upyun.com"
        };
        const { bucketName, name, type } = body;
        if (!bucketName || !name) {
            throw new HttpException("缺少参数", 400);
        }
        const bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName });
        if (!bucket) {
            throw new HttpException("指定空间" + bucketName + "不存在", 401);
        }
        const status = "post";
        let file: File | Audio | Video | Image | Document;
        if (this.kindUtil.isImage(type)) {
            file = await this.imageRepository.findOne({ name, type, bucketId: bucket.id });
        } else {
            // 其他类型暂不支持
        }
        if (!file) {
            throw new HttpException("指定文件" + name + "不存在", 404);
        }
        data.url += "/" + bucket.name + "/" + bucket.directory + "/" + file.name + "." + file.type;
        data.headers.date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
        data.headers.authorization = await this.authUtil.getHeaderAuth(bucket, "GET", data.url.replace("https://v0.api.upyun.com", ""), data.headers.date, "");
        return data;
    }

    @Mutation("uploadProcess")
    async uploadProcess(req: Request, body: UploadProcessBody): Promise<UploadProcessData> {
        const data: UploadProcessData = {
            code: 200,
            message: "上传预处理成功",
            url: "https://v0.api.upyun.com",
            method: "post",
            baseUrl: "",
            form: {
                policy: "",
                authorization: ""
            }
        };
        const { bucketName, md5, contentName } = body;
        if (!bucketName || !md5 || !contentName) {
            throw new HttpException("缺少参数", 400);
        }
        if (md5.length !== 32) {
            throw new HttpException("md5参数不正确", 400);
        }
        // 查询空间配置，关联查询图片、音频、视频配置，处理文件需要这些信息
        const bucket: Bucket = await this.bucketRepository.createQueryBuilder("bucket")
            .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
            .leftJoinAndSelect("bucket.audioConfig", "audioConfig")
            .leftJoinAndSelect("bucket.videoConfig", "videoConfig")
            .where("bucket.name = :name", { name: bucketName })
            .getOne();
        if (!bucket) {
            throw new HttpException("指定空间" + bucketName + "不存在", 401);
        }
        data.baseUrl = bucket.baseUrl;
        // 预保存图片,获取保存的图片，图片名为预处理图片名，会设置到policy的apps中去
        const image = await this.fileService.preSaveFile(bucket, body);
        // 上传policy字段
        const policy: Policy = {
            // 空间名
            "bucket": "",
            // 文件保存路径，包括目录、文件名、扩展名
            "save-key": "",
            // 请求过期事件
            "expiration": undefined,
            "date": "",
            "content-md5": md5,
            // 异步回调通知路径，图片异步预处理回调也是这个接口
            "notify-url": req.protocol + "://" + req.get("host") + "/upyun/file/notify",
            // 图片生存期限默认为180天
            "x-upyun-meta-ttl": 180,
            // 扩展参数，包含了空间名
            "ext-param": ""
        };
        // 获取后台配置，创建上传参数，返回文件种类、以及文件所属目录
        await this.fileService.makePolicy(data, policy, bucket, body, image);
        return data;
    }

    /* 获取单个文件url方法 ，从后台获取
      @Param bucketName：空间名
      @Param name：       文件名，不包括扩展名
      @Param type:        文件类型
      @Param imagePostProcessInfo 文件后处理信息，获取url做图的字符串
      @Return data.code：状态码，200为成功，其他为错误
              data.message：响应信息
              data.url：访问文件的全部url，包括域名、目录、文件名、扩展名、token、文件密钥、处理字符串
   */
    @Query("one")
    async getFile(req: IncomingMessage, body: OneBody): Promise<OneData> {
        // 验证参数存在
        const { bucketName, name, type } = body;
        if (!bucketName || !name || !type) {
            throw new HttpException("缺少参数", 400);
        }
        const bucket: Bucket = await this.bucketRepository.createQueryBuilder("bucket")
            .leftJoinAndSelect("bucket.imageConfig", "imageConfig")
            .leftJoinAndSelect("bucket.audioConfig", "audioConfig")
            .leftJoinAndSelect("bucket.videoConfig", "videoConfig")
            .where("bucket.name = :name", { name: bucketName })
            .getOne();
        if (!bucket) {
            throw new HttpException("指定空间" + bucketName + "不存在", 401);
        }
        // 根据种类获取不同url
        const kind = this.kindUtil.getKind(type);
        let file: File | Audio | Video | Image | Document;
        // 处理图片类型
        if (kind === "image") {
            file = await this.imageRepository.findOne({ name, bucketId: bucket.id });
            if (!file) {
                throw new HttpException("指定图片不存在", 404);
            }
        } else {
            // 暂不支持
        }
        // 所有文件调用统一的拼接Url方法
        const url = await this.fileService.makeUrl(bucket, file, body, kind);
        return { code: 200, message: "获取指定文件访问url成功", url };
    }

    /* 获取指定空间下文件，从后台数据库中获取
       @Param bucketName：文件所属空间
       @Return data.code： 状态码，200为成功，其他为错误
              data.message：响应信息
              data.baseUrl：访问文件的基本url
              data.files    分页后的文件信息数组，里面添加了访问文件url信息，url不包含域名，包含了文件密钥、token
              data.imges：   图片信息数组
              data.audios:  音频信息数组
              data.videos:  视频信息数组
              data.documents: 文档信息数组
    */
    @Query("all")
    async files(req: IncomingMessage, body: AllBody): Promise<AllData> {
        const data: AllData = {
            code: 200,
            message: "获取指定空间下所有文件成功",
            baseUrl: "",
            files: [],
            images: [],
            audios: [],
            videos: [],
            documents: []
        };
        const { bucketName } = body;
        if (!bucketName) {
            throw new HttpException("缺少参数", 400);
        }
        const bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName });
        if (!bucket) {
            throw new HttpException("空间" + bucketName + "不存在", 401);
        }
        data.baseUrl = bucket.baseUrl;
        await this.fileService.getAll(data, bucket);
        return data;
    }

    /* 文件删除接口
       当客户端需要删除某个文件时使用，
       @Param bucketName：文件所属空间名
       @Param type：       文件扩展名，即文件类型
       @Param name：       文件名
       @Return data.code：状态码，200为成功，其他为错误
               data.message：响应信息
    */
    @Mutation("deleteFile")
    async deleteFile(req: IncomingMessage, body: FileLocationBody): Promise<Data> {
        const { bucketName, type, name } = body;
        if (!bucketName || !name || !type) {
            throw new HttpException("缺少参数", 400);
        }
        const bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName });
        if (!bucket) {
            throw new HttpException("空间" + bucketName + "不存在", 401);
        }
        const kind = this.kindUtil.getKind(type);
        if (kind === "image") {
            const image: Image = await this.imageRepository.findOne({ name, bucketId: bucket.id });
            if (!image) {
                throw new HttpException("文件md5=" + name + "不存在", 404);
            }
            await this.restfulUtil.deleteFile(bucket, image);
            await this.imageRepository.delete({ name, bucketId: bucket.id });
        }
        return { code: 200, message: "删除文件成功" };
    }
}
