import { AbstractFile } from './abstract.file';
import { Bucket } from './bucket.entity';
export declare class Audio extends AbstractFile {
    bucketId: number;
    bucket: Bucket;
}
