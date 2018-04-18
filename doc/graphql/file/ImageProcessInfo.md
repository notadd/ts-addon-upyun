```
#缩放参数
input ResizeData{

    #等比缩放百分比
    scale:Int

    #宽度缩放百分比
    wscale:Int

    #高度缩放百分比
    hscale:Int

    #指定宽度
    width:Int

    #指定高度
    height:Int

    #指定像素
    pixel:Int

}
```
```
#缩放模式枚举
enum ResizeMode{

    #等比缩放
    scale

    #只缩放宽度
    wscale

    #只缩放高度
    hscale

    #指定宽高缩放
    both

    #指定宽度等比缩放
    fw

    #指定高度等比缩放
    fh

    #指定像素等比缩放
    fp

    #指定宽高最大值等比缩放
    fwfh

    #指定宽高最小值等比缩放
    fwfh2

}
```
```
#缩放信息
input Resize{

    #缩放模式
    mode:ResizeMode

    #缩放参数
    data:ResizeData

}
```
```
#裁剪信息
input Tailor{

    #是否在缩放之前裁剪
    isBefore:Boolean

    #裁剪图片宽度
    width:Int

    #裁剪图片高度
    height:Int

    #对右边水平偏移
    x:Int

    #对底边的垂直偏移
    y:Int

    #裁剪图片方位
    gravity:Gravity

}
```
```
#模糊信息
input Blur{

    #模糊半径
    redius:Int

    #模糊标准差
    sigma:Int

}
```
```
#图片预处理信息，即上传之后对图片做的处理，最后保存处理后结果
input ImagePreProcessInfo{

    #缩放信息
    resize:Resize

    #裁剪信息
    tailor:Tailor

    #是否添加水印，可以覆盖全局配置
    watermark:Boolean

    #旋转角度
    rotate:Int

}
```
```
#图片后处理信息，即获取图片url时，根据它生成查询字符串，访问图片时根据查询字符串对图片做处理，将临时处理得到的图片传给前端
input ImagePostProcessInfo{

    #缩放信息
    resize:Resize

    #裁剪信息
    tailor:Tailor

    #是否添加水印
    watermark:Boolean

    #旋转角度
    rotate:Int

    #模糊信息
    blur:Blur

    #是否锐化
    sharpen:Boolean

    #输出格式
    format:String

    #当输出格式为webp时，是否为无损压缩
    lossless:Boolean

    #图片质量
    quality:Int

    #是否渐进显示
    progressive:Boolean

    #是否去除元信息
    strip:Boolean

}
```