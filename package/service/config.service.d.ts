import { Repository } from "typeorm";
import { AudioFormatConfig } from "../interface/config/audio.format.config";
import { BucketConfig } from "../interface/config/bucket.config";
import { EnableImageWatermarkConfig } from "../interface/config/enable.image.watermark.config";
import { ImageFormatConfig } from "../interface/config/image.format.config";
import { VideoFormatConfig } from "../interface/config/video.format.config";
import { AudioConfig } from "../model/audio.config.entity";
import { Bucket } from "../model/bucket.entity";
import { Image } from "../model/image.entity";
import { ImageConfig } from "../model/image.config.entity";
import { VideoConfig } from "../model/video.config.entity";
import { FileUtil } from "../util/file.util";
import { RestfulUtil } from "../util/restful.util";
export declare class ConfigService {
    private readonly fileUtil;
    private readonly restfulUtil;
    private readonly imageRepository;
    private readonly bucketRepository;
    private readonly imageConfigRepository;
    private readonly audioConfigRepository;
    private readonly videoConfigRepository;
    constructor(fileUtil: FileUtil, restfulUtil: RestfulUtil, imageRepository: Repository<Image>, bucketRepository: Repository<Bucket>, imageConfigRepository: Repository<ImageConfig>, audioConfigRepository: Repository<AudioConfig>, videoConfigRepository: Repository<VideoConfig>);
    saveBucketConfig(body: BucketConfig): Promise<Bucket>;
    saveImageFormatConfig(body: ImageFormatConfig): Promise<any>;
    saveEnableImageWatermarkConfig(body: EnableImageWatermarkConfig): Promise<void>;
    saveImageWatermarkConfig(file: any, obj: any): Promise<void>;
    saveAudioFormatConfig(body: AudioFormatConfig): Promise<void>;
    saveVideoFormatConfig(body: VideoFormatConfig): Promise<void>;
}
