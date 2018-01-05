import { Entity,Column, PrimaryGeneratedColumn } from 'typeorm';
/* 图片实体类，目前暂定，视频实体再说
   所有图片，不管私有空间、公有空间都在一张表里
   同一个空间下不能有相同的图片(目前认为一个空间一个目录)
   即bucket与save_key要符合唯一性约束
*/
@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  //图片保存的空间名
  @Column({ length: 50 })
  bucket: string;

  //图片名,即上传文件名
  @Column({ length: 50 })
  name: string;

  //图片保存的键，包含目录、文件名、扩展名
  @Column({ length: 50 })
  save_key: string;

  //宽度、高度
  @Column('int')
  width: number;

  @Column('int')
  height: number;

  //图片类型
  @Column({ length: 20 })
  type: string;

  //帧数
  @Column('int')
  frames: number;

  //图片大小
  @Column('int')
  size: number;

  //访问密钥
  @Column({ length: 50 })
  content_secret: string;

  //文件状态，pre表示为预保存，还未得到回调通知验证上传成功，post代表后保存，即上传已经成功
  @Column({ length: 20 })
  status: string;


  //预留关联字段
  @Column('int')
  user_id:number;

}