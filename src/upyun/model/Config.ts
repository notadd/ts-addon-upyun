import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
/* 后台配置实体类 */
@Entity()
export class Config {

  //主键，需要设置插入，1默认为公有空间配置，2默认为私有空间配置
  @PrimaryColumn()
  id: number;

  //公有还是私有空间，值为public、private
  @Column({ length: 20 })
  public_or_private: string;

  //空间名
  @Column({ length: 50 })
  @Index({ unique:true })
  bucket: string;

  //操作员名
  @Column({ length: 50 })
  operator: string;

  //操作员密码的md5
  @Column({ length: 50 })
  password: string;

  //请求过期时间，单位秒
  @Column('int')
  request_expire: number;

  //基本url
  @Column({ length: 50 })
  @Index({ unique:true })
  base_url: string;

  //目录
  @Column({ length: 50 })
  directory: string;

  //token密钥
  @Column({ length: 250 })
  token_secret_key: string;

  //token过期时间，单位秒
  @Column('int')
  token_expire: number;

  //保存格式，raw、webp_damage、webp_undamage
  @Column({ length: 50 })
  format: string;

  //是否启用水印，true、false
  @Column({length:20})
  watermark_enable:string

  //水印图片保存的save_key，每个空间图片加水印使用自己空间下的水印图片，所以水印图片要保存两次
  @Column({ length: 50 })
  watermark_save_key: string;

  //水印位置，九宫格
  @Column({ length: 20 })
  watermark_gravity: string;
  
  //水印横轴偏移
  @Column('int')
  watermark_x: number;

  //水印纵轴偏移
  @Column('int')
  watermark_y: number;

  //水印透明度
  @Column('int')
  watermark_opacity: number;

  //水印与图片短边自适应比例
  @Column('int')
  watermark_ws: number;

}