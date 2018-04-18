```
type Mutation{

    #全局配置，是否启用图片水印，启用之后，图片默认都会加水印，可以被预处理、后处理参数覆盖
    enableImageWatermark(enable:Boolean!):ConfigData

}
```