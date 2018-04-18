```
type Query{

    #获取当前所有空间信息
    buckets:BucketsData

}
```
```
#空间信息类型
type Bucket{

    #id
    id:Int

    #标识为公有空间(public)还是私有空间(private)
    publicOrPrivate:String

    #空间名
    name:String

}
```
```
#返回数据
type BucketsData{

    #错误码
    code:Int

    #错误信息
    message:String

    #空间信息数组
    buckets:[Bucket]
    
}
```