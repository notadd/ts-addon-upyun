```
type Mutation{

    #配置图片保存格式
    imageFormat(format:ImageFormat!):ConfigData

}
```
```
#图片保存格式枚举
enum ImageFormat {

    #保存为上传格式
    raw

    #webp
    webp_damage

    #无损webp
    webp_undamage
    
}
```
