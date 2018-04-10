
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Bucket } from "./bucket.entity";

/* 图片配置实体类 */
@Entity({
    name: "imageConfig"
})
export class ImageConfig {

    // 主键，需要设置插入，1默认为公有空间配置，2默认为私有空间配置
    @PrimaryColumn({
        name: "id",
        type: "integer"
    })
    id: number;

    // 保存格式，raw、webp_damage、webp_undamage
    @Column({
        name: "format",
        type: "varchar",
        undefinedable: true
    })
    format: string;

    // 是否启用水印，true、false
    @Column({
        name: "watermarkEnable",
        type: "smallint",
        undefinedable: true
    })
    watermarkEnable: number;

    // 水印图片保存的save_key，每个空间图片加水印使用自己空间下的水印图片，所以水印图片要保存两次
    @Column({
        name: "watermarkSaveKey",
        type: "varchar",
        length: 80,
        undefinedable: true
    })
    watermarkSaveKey: string;

    // 水印位置，九宫格
    @Column({
        name: "watermarkGravity",
        type: "varchar",
        undefinedable: true
    })
    watermarkGravity: string;

    // 水印横轴偏移
    @Column({
        name: "watermarkX",
        type: "integer",
        undefinedable: true
    })
    watermarkX: number;

    // 水印纵轴偏移
    @Column({
        name: "watermarkY",
        type: "integer",
        undefinedable: true
    })
    watermarkY: number;

    // 水印透明度
    @Column({
        name: "watermarkOpacity",
        type: "integer",
        undefinedable: true
    })
    watermarkOpacity: number;

    // 水印与图片短边自适应比例
    @Column({
        name: "watermarkWs",
        type: "integer",
        undefinedable: true
    })
    watermarkWs: number;

    @OneToOne(type => Bucket, bucket => bucket.imageConfig)
    @JoinColumn()
    bucket: Bucket;
}
