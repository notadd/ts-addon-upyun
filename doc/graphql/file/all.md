```
type Query{

    #获取指定空间下所有种类文件，包括图片、视频、音频、文档、普通文件
    all(bucketName:String):AllData

}
```
```
#普通文件类型
type File{

    #id
    id:Int

    #原名
    rawName:String

    #存储文件名
    name:String

    #文件标签
    tags:[String]

    #文件类型，即存储的文件扩展名
    type:String

    #文件大小
    size:Int

    #密钥
    contentSecret:String

    #创建日期
    createDate:String

    #更新日期
    updateDate:String

    #访问的相对url
    url:String
}
```
```
#图片信息
type Image{

    #id
    id:Int

    #图片原名
    rawName:String

    #图片存储名
    name:String

    #图片标签
    tags:[String]

    #图片类型，即存储的扩展名
    type:String

    #图片大小
    size:Int

    #创建日期
    createDate:String

    #更新日期
    updateDate:String

    #图片宽度
    width:Int

    #图片高度
    height:Int

    #访问图片相对url
    url:String

}
```
```
#音频信息
type Audio{

    #id
    id:Int

    #音频原名
    rawName:String

    #存储名
    name:String

    #文件标签
    tags:[String]

    #文件md5，为最终存储文件的md5
    md5:String

    #文件类型，即存储扩展名
    type:String

    #文件大小
    size:Int

    #创建日期
    createDate:String

    #更新日期
    updateDate:String

    #文件访问相对url
    url:String

}
```
```
#视频信息
type Video{

    #id
    id:Int
    
    #文件原名
    rawName:String

    #文件存储名称
    name:String

    #文件标签
    tags:[String]

    #文件类型，即存储扩展名
    type:String

    #文件大小
    size:Int

    #创建日期
    createDate:String

    #更新日期
    updateDate:String

    #访问相对url
    url:String

}
```
```
#文档信息
type Document{

    #id
    id:Int

    #文件原名
    rawName:String

    #文件存储名
    name:String

    #文件标签
    tags:[String]

    #文件类型，文件扩展名
    type:String

    #文件大小
    size:Int

    #文件创建日期
    createDate:String

    #文件更新日期
    updateDate:String

    #相对访问url
    url:String

}
```
```
#空间下文件的返回数据
type AllData{

    #错误码
    code:Int

    #错误信息
    message:String

    #基本url
    baseUrl:String

    #普通文件信息数组
    files:[File]

    #图片信息数组
    images:[Image]

    #音频信息数组
    audios:[Audio]

    #视频信息数组
    videos:[Video]

    #文档信息数组
    documents:[Document]
    
}
```