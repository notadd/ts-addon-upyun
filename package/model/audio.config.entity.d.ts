import { Bucket } from "./bucket.entity";
export declare class AudioConfig {
    id: number;
    format: string;
    bucketId: number;
    bucket: Bucket;
}
