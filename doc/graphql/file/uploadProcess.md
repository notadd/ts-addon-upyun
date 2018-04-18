```
type Mutation{

    #文件的上传预处理，前端发起上传之前，向后端获取上传使用的method、url、表单字段等
    uploadProcess(bucketName:String,md5:String,contentName:String,contentSecret:String,tags:[String],imagePreProcessInfo:ImagePreProcessInfo):UploadProcessData

}
```
```
#上传请求表单字段
type UploadProcessForm{

    #上传参数的base64编码
    policy:String

    #签名
    authorization:String

}
```
```
#上传预处理返回数据
type  UploadProcessData{

    #错误码
    code:Int

    #错误信息
    message:String

    #上传请求url
    url:String

    #上传请求方法
    method:String

    #访问上传后文件的基本url，即又拍云cdn域名
    baseUrl:String

    #上传请求表单字段
    form:UploadProcessForm

}
```