import { Bucket } from "./bucket.entity";
export declare class ImageConfig {
    id: number;
    format: string;
    watermarkEnable: number;
    watermarkSaveKey: string;
    watermarkGravity: string;
    watermarkX: number;
    watermarkY: number;
    watermarkOpacity: number;
    watermarkWs: number;
    bucket: Bucket;
}
