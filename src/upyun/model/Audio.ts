import { Entity,Column,PrimaryGeneratedColumn,Index,ManyToOne,JoinColumn,OneToOne,CreateDateColumn,UpdateDateColumn} from 'typeorm';
import { Bucket } from './Bucket'

@Entity({
    name:'audio'
})
export class Audio{
    
    @PrimaryGeneratedColumn({
        name:'id',
        type:'int'
    })
    id: number;
  
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
        unique:true,
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
  

    @CreateDateColumn({
        name:'create_date',
        type:'date'
    })
    create_date:Date;

    @UpdateDateColumn({
        name:'update_date',
        type:'date'
    })
    update_date:Date;

    @ManyToOne(type=>Bucket,bucket=>bucket.audios,{
        cascadeInsert:false,
        cascadeUpdate:false,
        cascadeRemove:false,
        nullable:false,
        eager:true
      })
    @JoinColumn()
    bucket:Bucket;
}