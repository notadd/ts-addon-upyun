
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractFile } from "./abstract.file";
import { Bucket } from "./bucket.entity";

@Entity({
    name: "image"
})
export class Image extends AbstractFile {

    @Column({
        name: "width",
        type: "integer",
        undefinedable: true
    })
    width: number;

    @Column({
        name: "height",
        type: "integer",
        undefinedable: true
    })
    height: number;

    @Column({
        name: "frames",
        type: "integer",
        undefinedable: true
    })
    frames: number;

    @Column({ undefinedable: true })
    bucketId: number;

    @ManyToOne(type => Bucket, bucket => bucket.images, {
        cascadeInsert: false,
        cascadeRemove: false,
        cascadeUpdate: false,
        undefinedable: false,
        lazy: false
    })
    @JoinColumn()
    bucket: Bucket;
}
