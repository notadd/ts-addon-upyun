```
type Mutation{

    #空间配置
    bucket(

        #是否为公有空间
        isPublic:Boolean

        #空间名称
        name:String

        #操作员
        operator:String

        #密码
        password:String

        #空间对应的目录
        directory:String

        #又拍云给的cdn域名
        baseUrl:String

        #请求超时时间，单位秒
        requestExpire:Int

        #私有空间token超时，单位秒
        tokenExpire:Int

        #私有空间token密钥
        tokenSecretKey:String):ConfigData

}
```
```
#配置返回数据
type ConfigData{

    #错误码
    code:Int

    #错误信息
    message:String
    
}
```
