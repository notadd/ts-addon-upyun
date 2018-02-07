import { ImageConfig } from '../model/ImageConfig';
import { AudioConfig } from '../model/AudioConfig';
import { VideoConfig } from '../model/VideoConfig';
import { Connection, Repository } from 'typeorm';
import { Document } from '../model/Document';
import { Bucket } from '../model/Bucket';
import { Audio } from '../model/Audio';
import { Video } from '../model/Video';
import { Image } from '../model/Image';
import { File } from '../model/File';

const entityMap: Map<string, Function> = new Map()
entityMap.set('UpyunModule.BucketRepository', Bucket)
entityMap.set('UpyunModule.ImageConfigRepository', ImageConfig)
entityMap.set('UpyunModule.AudioConfigRepository', AudioConfig)
entityMap.set('UpyunModule.VideoConfigRepository', VideoConfig)
entityMap.set('UpyunModule.DocumentRepository', Document)
entityMap.set('UpyunModule.AudioRepository', Audio)
entityMap.set('UpyunModule.VideoRepository', Video)
entityMap.set('UpyunModule.ImageRepository', Image)
entityMap.set('UpyunModule.FileRepository', File)

class RepositoryProvider {
    provide: string
    useFactory: (connection: Connection) => Repository<any>
    inject: string[]
}

export let RepositorysProvider: Array<RepositoryProvider> = []

entityMap.forEach((entity, token, map) => {
    RepositorysProvider.push({
        provide: token,
        useFactory: (connection: Connection) => {
            return connection.getRepository(entity)
        },
        inject: ['UpyunModule.Connection']
    })
})


