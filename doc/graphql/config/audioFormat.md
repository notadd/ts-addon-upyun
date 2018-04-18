```
type Mutation{

    #配置音频文件的存储格式
    audioFormat(format:AudioFormat):ConfigData

}
```
```
#音频文件存储格式枚举
enum AudioFormat {

    #保持原有上传格式
    raw

    #mp3
    mp3

    #aac
    aac
    
}
```
