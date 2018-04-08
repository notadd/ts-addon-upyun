import { Repository } from 'typeorm';
import { AudioFormatConfig } from '../interface/config/AudioFormatConfig';
import { BucketConfig } from '../interface/config/BucketConfig';
import { EnableImageWatermarkConfig } from '../interface/config/EnableImageWatermarkConfig';
import { ImageFormatConfig } from '../interface/config/ImageFormatConfig';
import { VideoFormatConfig } from '../interface/config/VideoFormatConfig';
import { AudioConfig } from '../model/AudioConfig.entity';
import { Bucket } from '../model/Bucket.entity';
import { Image } from '../model/Image.entity';
import { ImageConfig } from '../model/ImageConfig.entity';
import { VideoConfig } from '../model/VideoConfig.entity';
import { FileUtil } from '../util/FileUtil';
import { RestfulUtil } from '../util/RestfulUtil';
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
