
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractFile } from "./abstract.file";
import { Bucket } from "./bucket.entity";

@Entity({
    name: "audio"
})
export class Audio extends AbstractFile {

    @Column({ undefinedable: true })
    bucketId: number;

    @ManyToOne(type => Bucket, bucket => bucket.audios, {
        cascadeInsert: false,
        cascadeUpdate: false,
        cascadeRemove: false,
        undefinedable: false,
        lazy: false
    })
    @JoinColumn()
    bucket: Bucket;
}
