import { ImageConfig } from '../model/ImageConfig';
import { AudioConfig } from '../model/AudioConfig';
import { VideoConfig } from '../model/VideoConfig';
import { Document } from '../model/Document';
import { createConnection } from 'typeorm';
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio';
import { Video } from '../model/Video';
import { Image } from '../model/Image';
import { File } from '../model/File';
export const ConnectionProvider = {
    provide:'UpyunModule.Connection',
    useFactory:async ()=>{
        return await createConnection({
            name:'upyun',
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: "upyun",
            synchronize:true,
            dropSchema:true,
            entities: [
                ImageConfig,
                AudioConfig,
                VideoConfig,
                Bucket,
                Document,
                Audio,
                Video,
                File,
                Image
            ]
        })
    }
}