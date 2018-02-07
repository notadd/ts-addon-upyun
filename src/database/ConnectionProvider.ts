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
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '123456',
            database: "upyun",
            synchronize:true,
            dropSchema:true,
            charset:'UTF8',
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