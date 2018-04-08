import { Audio } from './Audio.entity';
import { AudioConfig } from './AudioConfig.entity';
import { Document } from './Document.entity';
import { File } from './File.entity';
import { Image } from './Image.entity';
import { ImageConfig } from './ImageConfig.entity';
import { Video } from './Video.entity';
import { VideoConfig } from './VideoConfig.entity';
export declare class Bucket {
    id: number;
    public_or_private: string;
    name: string;
    operator: string;
    password: string;
    directory: string;
    request_expire: number;
    base_url: string;
    token_secret_key: string;
    token_expire: number;
    image_config: ImageConfig;
    audio_config: AudioConfig;
    video_config: VideoConfig;
    files: Promise<File[]>;
    images: Promise<Image[]>;
    audios: Promise<Audio[]>;
    videos: Promise<Video[]>;
    documents: Promise<Document[]>;
}
