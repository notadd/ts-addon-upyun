import { AudioConfig } from "./audio.config.entity";
import { Audio } from "./audio.entity";
import { Document } from "./document.entity";
import { File } from "./file.entity";
import { ImageConfig } from "./image.config.entity";
import { Image } from "./image.entity";
import { VideoConfig } from "./video.config.entity";
import { Video } from "./video.entity";
export declare class Bucket {
    id: number;
    publicOrPrivate: string;
    name: string;
    operator: string;
    password: string;
    directory: string;
    requestExpire: number;
    baseUrl: string;
    tokenSecretKey: string;
    tokenExpire: number;
    imageConfig: ImageConfig;
    audioConfig: AudioConfig;
    videoConfig: VideoConfig;
    files: Array<File>;
    images: Array<Image>;
    audios: Array<Audio>;
    videos: Array<Video>;
    documents: Array<Document>;
}
