import { Entity,Column, PrimaryGeneratedColumn ,Index} from 'typeorm';
import { File } from './File'
/* 图片实体类，目前暂定，视频实体再说
   所有图片，不管私有空间、公有空间都在一张表里
   同一个空间下不能有相同的图片(目前认为一个空间一个目录)
   即bucket与save_key要符合唯一性约束
*/
@Entity({
  name:'image'
})
@Index('directoryId_name',['name','directoryId'],{unique:true})
export class Image extends File {
  
  @Column({
    name:'width',
    type:'int',
    nullable:true
  })
  width: number;

  @Column({
    name:'height',
    type:'int',
    nullable:true
  })
  height: number;

  @Column({
    name:'frames',
    type:'int',
    nullable:true
  })
  frames: number;
}