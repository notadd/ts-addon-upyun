import { AbstractFile } from "./abstract.file";
import { Bucket } from "./bucket.entity";
export declare class Document extends AbstractFile {
    bucketId: number;
    bucket: Bucket;
}
