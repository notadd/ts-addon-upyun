```
type Mutation{

    #删除指定文件，从数据库与磁盘一并删除
    deleteFile(bucketName:String,name:String,type:String):DeleteFileData

}
```
```
#删除文件返回数据
type DeleteFileData{

    #错误码
    code:Int

    #错误信息
    message:String

}
```