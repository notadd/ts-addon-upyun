
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractFile } from "./abstract.file";
import { Bucket } from "./bucket.entity";

@Entity({
    name: "file"
})
export class File extends AbstractFile {

    @Column({ undefinedable: true })
    bucketId: number;

    @ManyToOne(type => Bucket, bucket => bucket.files, {
        cascadeInsert: false,
        cascadeUpdate: false,
        cascadeRemove: false,
        undefinedable: false,
        lazy: false
    })
    @JoinColumn()
    bucket: Bucket;
}