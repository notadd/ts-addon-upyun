export declare class KindUtil {
    constructor();
    getKind(type: string): "file" | "image" | "audio" | "document" | "video";
    isImage(type: string): string;
}
