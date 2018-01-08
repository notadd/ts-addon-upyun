import { Entity,Column, PrimaryGeneratedColumn ,Index,OneToMany, ManyToOne,JoinColumn} from 'typeorm';
import { Image } from './Image'
import { Bucket } from './Bucket'
/* 图片实体类，目前暂定，视频实体再说
   所有图片，不管私有空间、公有空间都在一张表里
   同一个空间下不能有相同的图片(目前认为一个空间一个目录)
   即bucket与save_key要符合唯一性约束
*/
@Entity({
    name:'directory'
})
export class Directory{

  @PrimaryGeneratedColumn({
      name:'id'
  })
  id: number;

  @Column({
      name:'bucket_name',
      type:'varchar',
      length:'50',
      nullable:false
  })
  bucket_name:string

  @Column({
      name:'level',
      type:'int',
      nullable:false
  })
  level:number;

  @Column({
      name:'name',
      type:'varchar',
      nullable:false
  })
  name:string

  @OneToMany(type=>Directory,directory=>directory.parent,{
      cascadeInsert:true,
      cascadeUpdate:true,
      eager:true
  })
  children:Directory[]

  @Column({nullable:true})
  directoryId:number

  @ManyToOne(type=>Directory,directory=>directory.children,{
    cascadeRemove:true,
    nullable:true,
    eager:true
  })
  @JoinColumn()
  parent:Directory

  @OneToMany(type=>Image,image=>image.directory,{
    cascadeInsert:true,
    cascadeUpdate:true,
    eager:true
  })
  images:Image[]
}