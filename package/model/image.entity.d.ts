import { AbstractFile } from './abstract.file';
import { Bucket } from './bucket.entity';
export declare class Image extends AbstractFile {
    width: number;
    height: number;
    frames: number;
    bucketId: number;
    bucket: Bucket;
}
