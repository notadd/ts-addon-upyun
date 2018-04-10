
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class AbstractFile {

    @PrimaryGeneratedColumn({
        name: "id",
        type: "integer"
    })
    id: number;

    @Column({
        name: "raw_name",
        type: "varchar",
        length: 50,
        nullable: false
    })
    rawName: string;

    @Column({
        name: "name",
        type: "varchar",
        length: 50,
        nullable: false,
        unique: true
    })
    name: string;

    @Column({
        name: "tags",
        type: "simple-array",
        nullable: true,
    })
    tags: Array<string>;

    @Column({
        name: "md5",
        type: "varchar",
        length: 50,
        nullable: false
    })
    md5: string;

    @Column({
        name: "type",
        type: "varchar",
        length: 20,
        // File可以没有扩展名
        nullable: true
    })
    type: string;

    @Column({
        name: "size",
        type: "integer",
        nullable: true
    })
    size: number;

    // 访问密钥
    @Column({
        name: "content_secret",
        type: "varchar",
        length: "50",
        nullable: true
    })
    contentSecret: string;

    @Column({
        name: "status",
        type: "varchar",
        nullable: false
    })
    status: string;

    @CreateDateColumn({
        name: "create_date",
        type: "date"
    })
    createDate: Date;

    @UpdateDateColumn({
        name: "update_date",
        type: "date"
    })
    updateDate: Date;
}
