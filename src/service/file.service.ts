
import { Injectable, HttpException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UploadProcessBody } from "../interface/file/upload.process.body";
import { Audio } from "../model/audio.entity";
import { Bucket } from "../model/bucket.entity";
import { Document } from "../model/document.entity";
import { File } from "../model/file.entity";
import { Image } from "../model/image.entity";
import { Video } from "../model/video.entity";
import { AuthUtil } from "../util/auth.util";
import { KindUtil } from "../util/kind.util";
import { ProcessStringUtil } from "../util/process.string.util";
import { RestfulUtil } from "../util/restful.util";

/* 图片服务组件，包含了上传时创建policy对象、预保存图片
   回调通知时，后保存、后删除
   查找图片、创建访问图片的url等功能
*/
@Injectable()
export class FileService {

    constructor(
        @Inject(AuthUtil) private readonly authUtil: AuthUtil,
        @Inject(KindUtil) private readonly kindUtil: KindUtil,
        @Inject(RestfulUtil) private readonly restfulUtil: RestfulUtil,
        @Inject(ProcessStringUtil) private readonly processStringUtil: ProcessStringUtil,
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
        @InjectRepository(Audio) private readonly audioRepository: Repository<Audio>,
        @InjectRepository(Video) private readonly videoRepository: Repository<Video>,
        @InjectRepository(Bucket) private readonly bucketRepository: Repository<Bucket>) {
    }

    async makePolicy(data: any, policy: any, bucket: Bucket, body: UploadProcessBody, file: File | Image | Video | Audio | Document): Promise<void> {
        const { md5, contentSecret, contentName } = body;
        // 设置各种上传参数
        if (contentSecret) {
            policy["content-secret"] = contentSecret;
        }
        policy.bucket = bucket.name;
        policy["ext-param"] += bucket.name;
        data.url += `/${bucket.name}`;
        // 文件类型以文件扩展名确定，如果不存在扩展名为file
        const type: string = file && file.type || "";
        const kind = type ? this.kindUtil.getKind(type) : "file";
        // 这里原图的save_key不保存它，在回调中直接删除
        policy["save-key"] += `/${bucket.directory}/${md5}_${+new Date()}.${type}`;
        policy.expiration = Math.floor((+new Date()) / 1000) + bucket.requestExpire;
        policy.date = new Date(+new Date() + bucket.requestExpire * 1000).toUTCString();
        // 根据配置，设置预处理参数，只有一个预处理任务
        if (kind === "image") {
            const obj = {
                "name": "thumb",
                "x-gmkerl-thumb": "",
                "save_as": "",
                "notify_url": policy["notify-url"]
            };
            const format = bucket.imageConfig.format || "raw";
            // 原图不处理
            if (format === "raw") {
                // 保存为原图，为了防止没有预处理字符串时不进行预处理任务，加上了/scale/100
                obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/scale/100";
                // 这里将预处理的文件名设置为刚才保存的文件名，在回调中根据文件名来更新它，保存为原图时，
                obj.save_as = `/${bucket.directory}/${file.name}.${file.type}`;
                // apps字段应为json字符串
                policy.apps = [obj];
            } else if (format === "webp_damage") {
                // 保存为有损webp
                obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/format/webp/strip/true";
                obj.save_as = `/${bucket.directory}/${file.name}.webp`;
                // apps字段应为json字符串
                policy.apps = [obj];
            } else if (format === "webp_undamage") {
                // 保存为无损webp
                obj["x-gmkerl-thumb"] = this.processStringUtil.makeImageProcessString(bucket, body.imagePreProcessInfo) + "/format/webp/lossless/true/strip/true";
                obj.save_as = `/${bucket.directory}/${file.name}.webp`;
                policy.apps = [obj];
            } else {
                throw new Error("格式配置不正确，应该不能发生");
            }
        } else {
            // 暂时不支持
        }
        // 设置表单policy字段
        data.form.policy = Buffer.from(JSON.stringify(policy)).toString("base64");
        // 生成签名，上传签名需要policy参数
        const method = data.method;
        data.form.authorization = await this.authUtil.getBodyAuth(bucket, method, policy);
        return;
    }

    async preSaveFile(bucket: Bucket, body: UploadProcessBody): Promise<File | Image | Video | Audio | Document> {
        const { md5, contentName, contentSecret, tags } = body;
        const type = contentName.substr(contentName.lastIndexOf(".") + 1).toLowerCase();
        const kind = this.kindUtil.getKind(type);
        if (kind === "image") {
            // 创建图片
            const image = new Image();
            image.rawName = contentName;
            // 这个文件名会设置到预处理参数apps的save_as中去，而不是上传参数的save_key中，那个文件名不保存，在回调中直接删除
            image.name = `${md5}_${+new Date()}`;
            image.md5 = md5;
            image.tags = tags;
            image.type = type;
            image.status = "pre";
            image.contentSecret = contentSecret || undefined;
            image.bucket = bucket;
            try {
                await this.imageRepository.save(image);
            } catch (err) {
                throw new HttpException("图片预保存失败", 403);
            }
            return image;
        } else {
            const file = new File();
            file.type = type;
            return file;
        }
    }

    /* 预处理回调通知验签成功，且响应码为200时，后保存图片 */
    async postSaveTask(bucket: Bucket, name: string, body: any, kind: string): Promise<void> {
        if (kind === "image") {
            const image: Image = await this.imageRepository.findOne({ name, bucketId: bucket.id, status: "pre" });
            // 预保存图片不存在时，正常返回，服务器错误
            if (!image) {
                return;
            }
            image.width = body.imginfo.width,
                image.height = body.imginfo.height,
                image.type = body.imginfo.type.toLowerCase(),
                image.frames = body.imginfo.frames,
                image.status = "post";
            // 从云存储获取预处理文件的md5与处理后大小
            const { fileSize, fileMd5 } = await this.restfulUtil.getFileInfo(bucket, image);
            image.size = fileSize;
            image.md5 = fileMd5;
            try {
                await this.imageRepository.save(image);
            } catch (err) {
                throw new HttpException("更新预保存图片失败", 403);
            }
        } else {
            throw new Error("kind不正确");
        }
        return;
    }

    // 创建url
    async makeUrl(bucket: Bucket, file: File | Image | Video | Audio | Document, body: any, kind: string): Promise<string> {
        let url = `/${bucket.directory}/${file.name}.${file.type}!`;
        if (file.contentSecret) {
            url += file.contentSecret;
        }
        if (kind === "image") {
            // 拼接处理字符串，使用请求体参数
            url += this.processStringUtil.makeImageProcessString(bucket, body.imagePostProcessInfo);
        }
        // 如果是私有空间需要拼接token查询字符串
        if (bucket.publicOrPrivate === "private") {
            url += "?_upt=" + await this.authUtil.getToken(bucket, url);
        }
        url = bucket.baseUrl.concat(url);
        return url;
    }

    async getAll(data: any, bucketName: string) {
        const bucket: Bucket | undefined = await this.bucketRepository.createQueryBuilder("bucket")
            .where({ name: bucketName })
            .leftJoinAndSelect("bucket.files", "files")
            .leftJoinAndSelect("bucket.images", "image")
            .leftJoinAndSelect("bucket.audios", "audio")
            .leftJoinAndSelect("bucket.videos", "video")
            .leftJoinAndSelect("bucket.documents", "document")
            .getOne();
        if (!bucket) {
            throw new HttpException(`空间name=${bucketName}不存在`, 401);
        }
        data.baseUrl = bucket.baseUrl;
        data.files = bucket.files;
        data.images = bucket.images;
        data.audios = bucket.audios;
        data.videos = bucket.videos;
        data.documents = bucket.documents;
        const addUrl = value => {
            value.url = `/${bucket.directory}/${value.name}.${value.type}`;
            if (value.contentSecret) {
                value.url += `!${value.contentSecret}`;
            }
            if (bucket.publicOrPrivate === "private") {
                value.url += "?_upt=" + this.authUtil.getToken(bucket, value.url);
            }
        };
        data.files.forEach(addUrl);
        data.images.forEach(addUrl);
        data.audios.forEach(addUrl);
        data.videos.forEach(addUrl);
        data.documents.forEach(addUrl);
    }
}
