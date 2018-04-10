import { Audio } from './audio.entity';
import { AudioConfig } from './audio.config.entity';
import { Document } from './document.entity';
import { File } from './file.entity';
import { Image } from './image.entity';
import { ImageConfig } from './image.config.entity';
import { Video } from './video.entity';
import { VideoConfig } from './video.config.entity';
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
