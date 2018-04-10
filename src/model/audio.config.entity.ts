
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Bucket } from "./bucket.entity";

/* 音频配置实体类 */
@Entity({
    name: "audioConfig"
})
export class AudioConfig {

    // 主键，需要设置插入，1默认为公有空间配置，2默认为私有空间配置
    @PrimaryColumn({
        name: "id",
        type: "integer"
    })
    id: number;

    // 保存格式，raw、mp3、aac
    @Column({
        name: "format",
        type: "varchar",
        undefinedable: true
    })
    format: string;

    @OneToOne(type => Bucket, bucket => bucket.audioConfig)
    @JoinColumn()
    bucket: Bucket;
}
