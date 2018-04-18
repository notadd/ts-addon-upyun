```
type Query{

    #下载预处理，前端发起下载文件请求之前，需要从后端获取下载请求的url、method、头信息，再向又拍云发起下载请求
    downloadProcess(bucketName:String,name:String,type:String):DownloadProcessData

}
```
```
#下载预处理返回数据
type DownloadProcessData{

    #错误码
    code:Int

    #错误信息
    message:String

    #下载请求的方法
    method:String

    #下载请求url
    url:String

    #下载请求的headers
    headers:DownloadHeaders

}
```
```
#下载请求headers类型
type DownloadHeaders{

    #身份验证字段
    authorization:String

    #日期字段，与身份验证字段中被编码信息对应
    date:String

}
```