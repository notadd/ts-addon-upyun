import { Entity, Column, PrimaryColumn, Index ,OneToOne, JoinColumn} from 'typeorm';
import { Directory } from './Directory'
/* 后台配置实体类 */
@Entity({
  name:'bucket'
})
export class Bucket {

  //主键，需要设置插入，1默认为公有空间配置，2默认为私有空间配置
  @PrimaryColumn({
    name:'id',
    type:'int',
    nullable:false
  })
  id: number;

  //公有还是私有空间，值为public、private
  @Column({ 
    name:'public_or_private',
    type:'varchar',
    length: 20,
    nullable:false,
    unique:true
  })
  public_or_private: string;

  //空间名
  @Column({ 
    name:'name',
    type:'varchar',
    length: 50,
    nullable:false,
    unique:true
   })
  name: string;

  //操作员名
  @Column({ 
    name:'operator',
    type:'varchar',
    length: 50,
    nullable:false
  })
  operator: string;

  //操作员密码的md5
  @Column({ 
    name:'password',
    type:'varchar',
    length: 50,
    nullable:false 
  })
  password: string;

  //请求过期时间，单位秒
  @Column({
    name:'request_expire',
    type:'int',
    nullable:false
  })
  request_expire: number;

  //基本url
  @Column({ 
    name:'base_url',
    type:'varchar',
    length: 50,
    nullable:false,
    unique:true
  })
  base_url: string;

  //token密钥
  @Column({ 
    name:'token_secret_key',
    type:'varchar',
    length: 250,
    nullable:true
  })
  token_secret_key: string;

  //token过期时间，单位秒
  @Column({
    name:'token_expire',
    type:'int',
    nullable:true
  })
  token_expire: number;

  //保存格式，raw、webp_damage、webp_undamage
  @Column({
    name:'format',
    type:'enum',
    enum:['raw','webp_damage','webp_undamage'],
    nullable:true
  })
  format: string;

  //是否启用水印，true、false
  @Column({
    name:'watermark_enable',
    type:'tinyint',
    nullable:true
  })
  watermark_enable:number

  //水印图片保存的save_key，每个空间图片加水印使用自己空间下的水印图片，所以水印图片要保存两次
  @Column({
    name:'watermark_save_key',
    type:'varchar',
    length: 50,
    nullable:true
  })
  watermark_save_key: string;

  //水印位置，九宫格
  @Column({ 
    name:'watermark_gravity',
    type:'enum',
    enum:['northwest','north','northeast','west','center','east','southwest','south','southeast'],
    nullable:true
  })
  watermark_gravity:string;
  
  //水印横轴偏移
  @Column({
    name:'watermark_x',
    type:'int',
    nullable:true
  })
  watermark_x: number;

  //水印纵轴偏移
  @Column({
    name:'watermark_y',
    type:'int',
    nullable:true
  })
  watermark_y: number;

  //水印透明度
  @Column({
    name:'watermark_opacity',
    type:'int',
    nullable:true
  })
  watermark_opacity: number;

  //水印与图片短边自适应比例
  @Column({
    name:'watermark_ws',
    type:'int',
    nullable:true
  })
  watermark_ws: number;

  @OneToOne(type=>Directory,{
    cascadeInsert:true,
    cascadeRemove:true,
    nullable:false,
    eager:true
  })
  @JoinColumn()
  root:Directory

}