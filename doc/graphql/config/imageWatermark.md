```
type Mutation{

    #配置水印图片，参数为水印图片名称、base64编码、水印方位(九宫格)、透明度、xy方向偏移、短边缩放百分比
    imageWatermark(name:String,base64:String,gravity:Gravity,opacity:Int,x:Int,y:Int,ws:Int):ConfigData
}
```
```
#水印方位枚举
enum Gravity {

    #西北
    northwest

    #北
    north

    #东北
    northeast

    #西
    west

    #中心
    center

    #东
    east

    #西南
    southwest

    #南
    south

    #东南
    southeast

}
```
