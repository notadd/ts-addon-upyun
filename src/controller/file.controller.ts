
import { Body, Controller, Headers, HttpException, Inject, Post, Request, Response, UseFilters } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as  path from "path";
import { Repository } from "typeorm";
import { UpyunExceptionFilter } from "../exception/upyun.exception.filter";
import { Bucket } from "../model/bucket.entity";
import { File } from "../model/file.entity";
import { Image } from "../model/image.entity";
import { FileService } from "../service/file.service";
import { AuthUtil } from "../util/auth.util";
import { KindUtil } from "../util/kind.util";
import { RestfulUtil } from "../util/restful.util";

/*文件控制器、异步回调通知
*/
@Controller("upyun/file")
@UseFilters(new UpyunExceptionFilter())
export class FileController {

    constructor(
        @Inject(AuthUtil) private readonly authUtil: AuthUtil,
        @Inject(KindUtil) private readonly kindUtil: KindUtil,
        @Inject(RestfulUtil) private readonly restfulUtil: RestfulUtil,
        @Inject(FileService) private readonly fileService: FileService,
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
        @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    }

    /* 异步回调通知接口，接受两种请求，默认所有文件都会进行预处理，所有每个上传请求会接收到两个回调请求，一个是原图的，一个是预处理结果
       application/x-www-form-urlencoded：即原图的上传回调，包含了原图的保存信息，其中没有空间名，需要从ext-param中获取空间名，原图文件名并未在数据库中保存，直接删除即可
       application/json：                 异步预处理上传回调 ，根据文件名更新数据库
    */
    @Post("notify")
    async asyncNotify(@Body() body, @Request() req, @Headers() headers, @Response() res): Promise<any> {
        const contentType = headers[ "content-type" ];
        const contentMd5 = headers[ "content-md5" ];
        const auth = headers.authorization;
        const date = headers.date;
        // 接收到默认MIME类型，说明是上传回调
        if (contentType === "application/x-www-form-urlencoded") {
            const code = +body.code;
            // 上传不成功时，要返回200,提示云存储不再发送回调请求
            if (code !== 200) {
                throw new HttpException("上传失败,返回200告诉又拍云不要再发送回调信息", 200);
            }
            // 解析出原图文件名
            const name = path.parse(body.url).name;
            // 文件扩展名，不包含.
            const type = path.parse(body.url).ext.substr(1);
            const kind = this.kindUtil.getKind(type);
            // 从扩展参数中获取空间名
            const bucketName = body[ "ext-param" ];
            // 查找指定空间
            const bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName });
            if (!bucket) {
                throw new HttpException("空间不存在，说明是内部错误,返回200告诉又拍云不要再发送回调信息", 200);
            }
            // 验签获取结果
            const pass = await this.authUtil.notifyVerify(auth, bucket, "POST", "/upyun/file/notify", date, contentMd5, body);
            // 验签不成功，要返回400,提示云存储继续发送回调请求
            if (!pass) {
                throw new HttpException("验签失败,返回400告诉又拍云继续发送回调信息", 400);
            }
            if (kind === "image") {
                const image = new Image();
                image.name = name;
                image.type = type;
                await this.restfulUtil.deleteFile(bucket, image);
            } else {
                // 暂不支持
            }
        }
        // 如果请求MIME为json类型，说吗为异步预处理回调信息，只有图片保存格式不是原图时采用这种方式
        else if (contentType === "application/json") {
            const code = body.status_code;
            // 预处理不成功时，要返回200,提示云存储不再发送回调请求
            if (code !== 200) {
                throw new HttpException("预处理失败,返回200告诉又拍云不要再发送回调信息", 200);
            }
            // 响应体中空间名
            const bucketName = body.bucket_name;
            // 解析出文件名，根据它查找数据库保存文件
            const name = path.parse(body.imginfo.path).name;
            // 文件扩展名，不包含.，不是原图时为webp
            const type = path.parse(body.imginfo.path).ext.substr(1);
            const kind = this.kindUtil.getKind(type);
            // 查找指定空间
            const bucket: Bucket = await this.bucketRepository.findOne({ name: bucketName });
            // 验签获取结果
            const pass = await this.authUtil.taskNotifyVerify(auth, bucket, "POST", "/upyun/file/notify", date, contentMd5, body);
            // 验签不成功，要返回400,提示云存储继续发送回调请求
            if (!pass) {
                throw new HttpException("验签失败,返回400告诉又拍云继续发送回调信息", 400);
            }
            await this.fileService.postSaveTask(bucket, name, body, kind);
        }
        res.sendStatus(200);
        res.end();
        return;
    }
}
