
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Audio } from "./audio.entity";
import { AudioConfig } from "./audio.config.entity";
import { Document } from "./document.entity";
import { File } from "./file.entity";
import { Image } from "./image.entity";
import { ImageConfig } from "./image.config.entity";
import { Video } from "./video.entity";
import { VideoConfig } from "./video.config.entity";

/* 后台配置实体类 */
@Entity({
    name: "bucket"
})
export class Bucket {

    // 主键，需要设置插入，1默认为公有空间配置，2默认为私有空间配置
    @PrimaryColumn({
        name: "id",
        type: "integer"
    })
    id: number;

    // 公有还是私有空间，值为public、private
    @Column({
        name: "publicOrPrivate",
        type: "varchar",
        length: 20,
        undefinedable: false,
        unique: true
    })
    publicOrPrivate: string;

    // 空间名
    @Column({
        name: "name",
        type: "varchar",
        length: 50,
        undefinedable: false,
        unique: true
    })
    name: string;

    // 操作员名
    @Column({
        name: "operator",
        type: "varchar",
        length: 50,
        undefinedable: false
    })
    operator: string;

    // 操作员密码的md5
    @Column({
        name: "password",
        type: "varchar",
        length: 50,
        undefinedable: false
    })
    password: string;

    // 此空间下所有文件都存储于这个目录里,与虚拟目录无关
    @Column({
        name: "directory",
        type: "varchar",
        length: 20,
        undefinedable: false
    })
    directory: string;

    // 请求过期时间，单位秒
    @Column({
        name: "requestExpire",
        type: "integer",
        undefinedable: false
    })
    requestExpire: number;

    // 基本url
    @Column({
        name: "baseUrl",
        type: "varchar",
        length: 50,
        undefinedable: false,
        unique: true
    })
    baseUrl: string;

    // token密钥
    @Column({
        name: "tokenSecretKey",
        type: "varchar",
        length: 250,
        undefinedable: true
    })
    tokenSecretKey: string;

    // token过期时间，单位秒
    @Column({
        name: "tokenExpire",
        type: "integer",
        undefinedable: true
    })
    tokenExpire: number;

    /*
    这里lazy:false的意思不是每个Bucket查询出来的时候就会包含imageConfig
    它的意思只是在于获取的属性是否是Promise，而要查询出来的Bucket包含imageConfig，必须使用find({relation:xxxx})
    */
    @OneToOne(type => ImageConfig, imageConfig => imageConfig.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        lazy: false
    })
    imageConfig: ImageConfig;

    @OneToOne(type => AudioConfig, audioConfig => audioConfig.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        lazy: false
    })
    audioConfig: AudioConfig;

    @OneToOne(type => VideoConfig, videoConfig => videoConfig.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        lazy: false
    })
    videoConfig: VideoConfig;

    @OneToMany(type => File, file => file.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true
    })
    files: Promise<Array<File>>;

    @OneToMany(type => Image, image => image.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true
    })
    images: Promise<Array<Image>>;

    @OneToMany(type => Audio, audio => audio.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true
    })
    audios: Promise<Array<Audio>>;

    @OneToMany(type => Video, video => video.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true
    })
    videos: Promise<Array<Video>>;

    @OneToMany(type => Document, document => document.bucket, {
        cascadeInsert: true,
        cascadeUpdate: true,
        lazy: true
    })
    documents: Promise<Array<Document>>;
}
