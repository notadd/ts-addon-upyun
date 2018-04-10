/// <reference types="node" />
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';
import { AudioFormatConfig } from '../../interface/config/audio.format.config';
import { BucketConfig } from '../../interface/config/bucket.config';
import { EnableImageWatermarkConfig } from '../../interface/config/enable.image.watermark.config';
import { ImageFormatConfig } from '../../interface/config/image.format.config';
import { ImageWatermarkConfig } from '../../interface/config/image.watermark.config';
import { VideoFormatConfig } from '../../interface/config/video.format.config';
import { Data } from '../../interface/data';
import { Bucket } from '../../model/bucket.entity';
import { ConfigService } from '../../service/config.service';
import { FileUtil } from '../../util/file.util';
import { KindUtil } from '../../util/kind.util';
import { RestfulUtil } from '../../util/restful.util';
export declare class ConfigResolver {
    private readonly fileUtil;
    private readonly kindUtil;
    private readonly restfulUtil;
    private readonly configService;
    private readonly bucketRepository;
    private readonly gravity;
    constructor(fileUtil: FileUtil, kindUtil: KindUtil, restfulUtil: RestfulUtil, configService: ConfigService, bucketRepository: Repository<Bucket>);
    bucket(req: IncomingMessage, body: BucketConfig): Promise<Data>;
    imageFormat(req: IncomingMessage, body: ImageFormatConfig): Promise<Data>;
    enableImageWatermark(req: IncomingMessage, body: EnableImageWatermarkConfig): Promise<Data>;
    imageWatermarkConfig(req: IncomingMessage, body: ImageWatermarkConfig): Promise<Data>;
    audioFormat(req: IncomingMessage, body: AudioFormatConfig): Promise<Data>;
    videoFormat(req: IncomingMessage, body: VideoFormatConfig): Promise<Data>;
    buckets(): Promise<Data & {
        buckets: Bucket[];
    }>;
}
