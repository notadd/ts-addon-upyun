export declare class KindUtil {
    constructor();
    getKind(type: string): "image" | "file" | "audio" | "document" | "video";
    isImage(type: string): string;
}
