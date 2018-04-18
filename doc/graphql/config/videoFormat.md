```
type Mutation{

    #配置视频保存格式
    videoFormat(format:VideoFormat,resolution:VideoResolution):ConfigData

}
```
```
#视频保存格式枚举
enum VideoFormat {

    #保存为上传格式
    raw

    vp9

    h264

    h265

}
```
```
#视频保存分辨率枚举
enum VideoResolution {

    #保存为上传分辨率
    raw

    #1080p
    p1080

    #720p
    p720

    #480p
    p480
    
}
```