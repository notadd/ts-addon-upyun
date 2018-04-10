import { AbstractFile } from './abstract.file';
import { Bucket } from './bucket.entity';
export declare class Video extends AbstractFile {
    bucketId: number;
    bucket: Bucket;
}
