/// <reference types="express" />
import { Request } from "express";
import { Repository } from "typeorm";
import { AudioFormatConfig } from "../interface/config/audio.format.config";
import { BucketConfig } from "../interface/config/bucket.config";
import { EnableImageWatermarkConfig } from "../interface/config/enable.image.watermark.config";
import { ImageFormatConfig } from "../interface/config/image.format.config";
import { ImageWatermarkConfig } from "../interface/config/image.watermark.config";
import { VideoFormatConfig } from "../interface/config/video.format.config";
import { Data } from "../interface/data";
import { Bucket } from "../model/bucket.entity";
import { ConfigService } from "../service/config.service";
import { FileUtil } from "../util/file.util";
import { KindUtil } from "../util/kind.util";
import { RestfulUtil } from "../util/restful.util";
export declare class ConfigResolver {
    private readonly fileUtil;
    private readonly kindUtil;
    private readonly restfulUtil;
    private readonly configService;
    private readonly bucketRepository;
    private readonly gravity;
    constructor(fileUtil: FileUtil, kindUtil: KindUtil, restfulUtil: RestfulUtil, configService: ConfigService, bucketRepository: Repository<Bucket>);
    bucket(req: Request, body: BucketConfig): Promise<Data>;
    imageFormat(req: Request, body: ImageFormatConfig): Promise<Data>;
    enableImageWatermark(req: Request, body: EnableImageWatermarkConfig): Promise<Data>;
    imageWatermarkConfig(req: Request, body: ImageWatermarkConfig): Promise<Data>;
    audioFormat(req: Request, body: AudioFormatConfig): Promise<Data>;
    videoFormat(req: Request, body: VideoFormatConfig): Promise<Data>;
    buckets(): Promise<Data & {
        buckets: Array<Bucket>;
    }>;
}
