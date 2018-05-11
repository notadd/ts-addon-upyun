
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class AbstractFile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 50,
        nullable: false
    })
    rawName: string;

    @Column({
        length: 50,
        nullable: false,
        unique: true
    })
    name: string;

    @Column({
        nullable: true,
        type: "simple-array"
    })
    tags: Array<string>;

    @Column({
        length: 50,
        nullable: false
    })
    md5: string;

    @Column({
        length: 20,
        // File可以没有扩展名
        nullable: true
    })
    type: string;

    @Column({
        nullable: true
    })
    size: number;

    // 访问密钥
    @Column({
        length: "50",
        nullable: true
    })
    contentSecret: string;

    @Column({
        nullable: false
    })
    status: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}
