import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractFile } from './AbstractFile'
import { Bucket } from './Bucket.entity'

@Entity({
    name: 'audio'
})
export class Audio extends AbstractFile {

    @Column({ nullable: true })
    bucketId: number

    @ManyToOne(type => Bucket, bucket => bucket.audios, {
        cascadeInsert: false,
        cascadeUpdate: false,
        cascadeRemove: false,
        nullable: false,
        lazy: false
    })
    @JoinColumn()
    bucket: Bucket;
}
