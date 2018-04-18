```
type Query{

    #获取指定文件的url，可以传递图片后处理参数，以访问临时处理后的图片
    one(bucketName:String,name:String,type:String,imagePostProcessInfo:ImagePostProcessInfo):OneData

}
```
```
#return data
type OneData{

    #错误码
    code:Int

    #错误信息
    message:String

    #访问图片的url
    url:String

}
```