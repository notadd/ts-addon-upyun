import { Entity,Column, PrimaryGeneratedColumn ,Index ,ManyToOne,JoinColumn} from 'typeorm';
import { Directory } from './Directory'

@Index('md5_directory',['md5','directoryId'],{unique:true})
export abstract class File{
    
    @PrimaryGeneratedColumn({
        name:'id',
        type:'int'
    })
    id: number;
  
    @Column({ 
        name:'bucket_name',
        type:'varchar',
        length: 50,
        nullable:false
    })
    bucket_name: string;
  
    @Column({ 
        name:'name',
        type:'varchar',
        length: 50,
        nullable:false
    })
    name: string;
  
    @Column({ 
        name:'md5',
        type:'varchar',
        length: 50,
        nullable:false 
    })
    md5: string;
  
    @Column({ 
        name:'type',
        type:'varchar',
        length: 20,
        nullable:false
    })
    type: string;
  
    @Column({
        name:'size',
        type:'int',
        nullable:false
    })
    size: number;
  
    //访问密钥
    @Column({
        name:'content_secret',
        type:'varchar',
        length:'50',
        nullable:true
    })
    content_secret: string;
  
    @Column({
        name:'status',
        type:'enum',
        enum:['pre','post'],
        nullable:false
    })
    status: string;
  
    @Column({nullable: false })
    dirctoryId: number;

    @ManyToOne(type=>Directory,directory=>directory.images,{
        cascadeInsert:true,
        cascadeRemove:true,
        nullable:false,
        eager:true
      })
    @JoinColumn()
    directory:Directory
}