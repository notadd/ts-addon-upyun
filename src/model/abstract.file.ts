
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class AbstractFile {

    @PrimaryGeneratedColumn({
        name: "id",
        type: "integer"
    })
    id: number;

    @Column({
        name: "rawName",
        type: "varchar",
        length: 50,
        undefinedable: false
    })
    rawName: string;

    @Column({
        name: "name",
        type: "varchar",
        length: 50,
        undefinedable: false,
        unique: true
    })
    name: string;

    @Column({
        name: "tags",
        type: "simple-array",
        undefinedable: true,
    })
    tags: Array<string>;

    @Column({
        name: "md5",
        type: "varchar",
        length: 50,
        undefinedable: false
    })
    md5: string;

    @Column({
        name: "type",
        type: "varchar",
        length: 20,
        // File可以没有扩展名
        undefinedable: true
    })
    type: string;

    @Column({
        name: "size",
        type: "integer",
        undefinedable: true
    })
    size: number;

    // 访问密钥
    @Column({
        name: "contentSecret",
        type: "varchar",
        length: "50",
        undefinedable: true
    })
    contentSecret: string;

    @Column({
        name: "status",
        type: "varchar",
        undefinedable: false
    })
    status: string;

    @CreateDateColumn({
        name: "createDate",
        type: "date"
    })
    createDate: Date;

    @UpdateDateColumn({
        name: "updateDate",
        type: "date"
    })
    updateDate: Date;
}
