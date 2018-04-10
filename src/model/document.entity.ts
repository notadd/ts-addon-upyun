
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractFile } from "./abstract.file";
import { Bucket } from "./bucket.entity";

@Entity({
    name: "document"
})
export class Document extends AbstractFile {

    @Column({ undefinedable: true })
    bucketId: number;

    @ManyToOne(type => Bucket, bucket => bucket.documents, {
        cascadeInsert: false,
        cascadeUpdate: false,
        cascadeRemove: false,
        undefinedable: false,
        lazy: false
    })
    @JoinColumn()
    bucket: Bucket;
}
