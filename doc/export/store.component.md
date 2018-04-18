```
StoreComponent是又拍云模块提供的供其他模块使用的存储组件,可以通过如下方法注入这个组件：
```
```
@Inject("StoreComponentToken") private readonly storeComponent: StoreComponent
```
```
这个组件与本地存储模块中StoreComponent是可以互相替代的，注入的token同为StoreComponentToken，其方法参数、返回值都是一样的
```
```
又拍云中StoreComponent组件方法为：
```
```
upload(bucketName: string,rawName: string,base64: string,imagePreProcessInfo: ImagePreProcessInfo,): Promise<{ bucketName: string, name: string, type: string }>
上传指定文件，参数为上传空间名、文件原名、文件base64编码、图片预处理信息，返回文件存储名称、类型等
```
```
delete(bucketName: string, name: string, type: string): Promise<void>
删除指定文件，从数据库、云存储一并删除
```
```
getUrl(req: any, bucketName: string, name: string, type: string, imagePostProcessInfo: ImagePostProcessInfo): Promise<string>
获取指定文件访问url，参数为请求对象、空间名、文件存储名、文件类型、图片后处理信息
```