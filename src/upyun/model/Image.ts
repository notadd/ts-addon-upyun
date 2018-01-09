import { Entity, Column, PrimaryGeneratedColumn, Index, OneToOne, JoinColumn, ManyToOne ,CreateDateColumn,UpdateDateColumn} from 'typeorm';
import { Bucket } from './Bucket'
/* 图片实体类，目前暂定，视频实体再说
   所有图片，不管私有空间、公有空间都在一张表里
   同一个空间下不能有相同的图片(目前认为一个空间一个目录)
   即bucket与save_key要符合唯一性约束
*/
@Entity({
  name: 'image'
})
export class Image {

  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int'
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
    nullable: false
  })
  name: string;

  @Column({
    name: 'md5',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false
  })
  md5: string;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 20,
    nullable: false
  })
  type: string;

  @Column({
    name: 'size',
    type: 'int',
    nullable: true
  })
  size: number;

  //访问密钥
  @Column({
    name: 'content_secret',
    type: 'varchar',
    length: '50',
    nullable: true
  })
  content_secret: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pre', 'post'],
    nullable: false
  })
  status: string;

  @CreateDateColumn({
    name: 'create_date',
    type: 'date'
  })
  create_date: Date;

  @UpdateDateColumn({
    name: 'update_date',
    type: 'date'
  })
  update_date: Date;

  @Column({
    name: 'width',
    type: 'int',
    nullable: true
  })
  width: number;

  @Column({
    name: 'height',
    type: 'int',
    nullable: true
  })
  height: number;

  @Column({
    name: 'frames',
    type: 'int',
    nullable: true
  })
  frames: number;

  @ManyToOne(type => Bucket, bucket => bucket.images, {
    cascadeInsert: false,
    cascadeRemove: false,
    cascadeUpdate:false,
    nullable: false,
    eager: true
  })
  @JoinColumn()
  bucket: Bucket
}