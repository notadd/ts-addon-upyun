import { Entity, Column, PrimaryColumn, Index, OneToOne, JoinColumn, OneToMany ,PrimaryGeneratedColumn} from 'typeorm';
import { Bucket } from './Bucket'
/* 音频配置实体类 */
@Entity({
    name: 'audio_config'
})
export class AudioConfig{

  //主键，需要设置插入，1默认为公有空间配置，2默认为私有空间配置
  @PrimaryGeneratedColumn()
  id: number;

  //保存格式，raw、mp3、aac
  @Column({
    name: 'format',
    type: 'enum',
    enum: ['raw', 'mp3', 'aac'],
    nullable: true
  })
  format: string;

  @OneToOne(type => Bucket,bucket=>bucket.audio_config)
  bucket: Bucket;
}