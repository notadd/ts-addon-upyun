import { Component, Inject } from '@nestjs/common';
import { isArray } from 'util';
import { Config } from '../model/Config'


/* URL做图处理字符串服务，可以根据请求体参数，拼接URL处理字符串 */
@Component()
export class ProcessStringUtil {
    private readonly gravity:Set<string>
    private readonly font:Map<string,string>
    private readonly colorRegex:RegExp
    private readonly borderRegex:RegExp
    private readonly format:Set<string>
    constructor(){
        //重心集合，在裁剪与水印中使用
       this.gravity = new Set(['northwest','north','northeast','west','center','east','southwest','south','southeast'])
       //字体集合，在文字水印中使用
       this.font = new Map([['宋体','simsun'],['黑体','simhei'],['楷体','simkai'],['隶书','simli'],['幼圆','simyou'],['仿宋','simfang'],['简体中文','sc'],['繁体中文','tc'],['Arial','arial'],['Georgia','georgia'],['Helvetica','helvetica'],['Times-New-Roman','roman']]) 
       //验证RGB颜色的正则表达式
       this.colorRegex = new RegExp('^[0-9A-F]{6}$','g') 
       //验证文字描边的正则表达式
       this.borderRegex = new RegExp('^[0-9A-F]{8}$','g') 
       //图片保存格式
       this.format = new Set(['jpg','png','webp'])
    }

    //根据请求体参数生成处理字符串
    makeProcessString(data:any,body:any,config:Config):string{
        //分别获取缩放、裁剪、圆角、水印、旋转、高斯模糊、锐化、输出格式、图片质量、是否渐进显示、是否去除元信息等参数
        let {resize,tailor,roundrect,watermark,rotate,blur,sharpen,format,quality,progressive,strip} = body
        let processString = ''
        
        processString += this.resizeString(data,resize)
        if(data.code !== 200){
            return ''
        }
        console.log('1:'+processString)
        processString += this.tailorString(data,tailor)
        if(data.code !== 200){
            return ''
        }
        console.log('2:'+processString)
        processString += this.roundrectString(data,roundrect)
        if(data.code !== 200){
            return ''
        }
        console.log('3:'+processString)
        processString += this.watermarkString(data,watermark,config)
        if(data.code !== 200){
            return ''
        }
        console.log('4:'+processString)
        processString += this.rotateString(data,rotate)
        if(data.code !== 200){
            return ''
        }
        console.log('5:'+processString)
        processString += this.blurString(data,blur)
        if(data.code !== 200){
            return ''
        }
        console.log('6:'+processString)
        processString += this.outputString(data,sharpen,format,quality,progressive,strip)
        if(data.code !== 200){
            return ''
        }
        console.log('7:'+processString)
        return processString
    }

    /*生成缩放字符串
      支持的缩放模式有：
      scale：  指定比例，长宽等比例缩放
      wscale:  指定比例，只缩放宽度，高度不变
      hscale:  指定比例，只缩放高度，宽度不变
      both：   指定宽高值，强制缩放不裁剪
      fw：     指定宽度，等比缩放
      fh：     指定高度，等比缩放
      fp：     指定像素积，等比缩放
      fwfh：   限定宽高最大值，宽高都不足时，不缩放，应该是让图片等比缩放到可以完全放进指定矩形的意思
      fwfh2：  限定宽高最小值，宽高都大于指定值时，不缩放，应该是让图片等比缩放到可以完全包含指定矩形的意思
      其中fw、fh、fp等，在有拍云中原意是限定宽度最大值，即只缩小不放大，加上/force/true的意思应该是指定而不是限定，需要验证
      如果需要限定最大值功能，后面再加，因为七牛云大部分都是指定值
    */
    resizeString(data:any,resize:any){
    
        //不存在直接返回，不抛出错误，进行下一步
        if(!resize){
            return ''
        }
        //缩放模式
        let mode = resize.mode
        //缩放数据
        let info = resize.data
        if(mode == 'scale'){
            if(info.scale&&Number.isInteger(info.scale)&&info.scale>=1&&info.scale<=1000){
                //这里的/force是为了保险
                return '/scale/'+info.scale+'/force/true'
            }
            data.code = 429
            data.message = '比例参数不正确'
            return ''
        }else if(mode == 'wscale'){
            if(info.wscale&&Number.isInteger(info.wscale)&&info.wscale>=1&&info.wscale<=1000){
                //为了保险，经验证这里可以不加/force/true
                return '/wscale/'+info.wscale+'/force/true'
            }
            data.code = 430
            data.message = '宽度比例参数不正确'
            return ''
        }else if(mode == 'hscale'){
            if(info.hscale&&Number.isInteger(info.hscale)&&info.hscale>=1&&info.hscale<=1000){
                //为了保险，经验证这里可以不加/force/true
                return '/hscale/'+info.hscale+'/force/true'
            }
            data.code = 431
            data.message = '高度比例参数不正确'
            return ''
        }else if(mode == 'both'){
            if(info.width&&Number.isInteger(info.width)&&info.height&&Number.isInteger(info.height)){
                //指定force强制缩放，否则宽高不足时会居中裁剪后缩放
                //经验证不加/force/true图片边缘处有变化，这个居中裁剪后缩放不是字面意思
                return '/both/'+info.width+'x'+info.height+'/force/true'
            }
            data.code = 432
            data.message = '宽高参数不正确'
            return ''
        }
        else if(mode == 'fw'){
            if(info.width&&Number.isInteger(info.width)){
                //强制指定可以放大，经验证这个必须加上/force/true才能放大
                return '/fw/'+info.width+'/force/true'
            }
            data.code = 433
            data.message = '宽度参数不正确'
            return ''
        }else if(mode == 'fh'){
            if(info.height&&Number.isInteger(info.height)){
                //强制指定可以放大，经验证这个必须加上/force/true才能放大
                return '/fh/'+info.height+'/force/true'
            }
            data.code = 434
            data.message = '高度参数不正确'
            return ''
        }else if(mode == 'fp'){
            if(info.pixel&&Number.isInteger(info.pixel)&&info.pixel>=1&&info.pixel<=25000000){
                //强制指定可以放大，经验证这个必须加上/force/true才能放大
                return '/fp/'+info.pixel+'/force/true'
            }
            data.code = 435
            data.message = '像素参数不正确'
            return ''
        }else if(mode == 'fwfh'){
            if(info.width&&Number.isInteger(info.width)&&info.height&&Number.isInteger(info.height)){
                //加上force，代表可以放大缩小，但是缩放后必须可以被指定矩形完全包含
                return '/fwfh/'+info.width+'x'+info.height+'/force/true'
            }
            data.code = 432
            data.message = '宽高参数不正确'
            return ''
        }else if(mode == 'fwfh2'){
            if(info.width&&Number.isInteger(info.width)&&info.height&&Number.isInteger(info.height)){
                //加上force，代表可以放大缩小，但是缩放后必须可以完全包含指定矩形
                return '/fwfh2/'+info.width+'x'+info.height+'/force/true'
            }
            data.code = 432
            data.message = '宽高参数不正确'
            return ''
        }else{
            data.code = 436
            data.message = '缩放模式不正确'
            return  ''
        }
    }

    /* 生成裁剪字符串，可以在缩放之前或之后裁剪
       暂定坐标都只能为整数，a为正向(即向东南/右下偏移)，s为负向(即向西北/左上偏移)
       但是在七牛云中，可以使用-x来代表为指定宽度减去指定值，这里有歧义，七牛云的坐标不知道可不可以为负值，反正七牛云中没有a、s之说
     */
    tailorString(data:any,tailor:any){
        if(!tailor){
            return ''
        }

        let {isBefore,width,height,x,y,gravity} = tailor
        let str = ''

        if(isBefore!==null&&isBefore!==undefined&&isBefore===true){
            str += '/crop'
        }else if(isBefore!==null&&isBefore!==undefined&&isBefore===false){
            str += '/clip'
        }else if(isBefore===null&&isBefore===undefined){
            //默认为缩放之后裁剪
            str += '/clip'
        }else{
            data.code = 437
            data.message = '裁剪顺序指定错误'
            return ''
        }

        if(gravity&&this.gravity.has(gravity)){
            str += '/gravity/'+gravity
        }else if(!gravity){
            //默认为西北角
            str += '/gravity/northwest'
        }else{
            data.code = 438
            data.message = '裁剪重心参数不正确'
            return ''
        }
        if(width&&Number.isInteger(width)&&height&&Number.isInteger(height)&&x&&Number.isInteger(x)&&y&&Number.isInteger(y)){
            str += '/'+width+'x'+height
        }else{
            data.code = 439
            data.message = '裁剪宽高参数不正确'
            return ''
        }
        if(x&&Number.isInteger(x)&&x>=0){
            str += 'a'+x
        }else if(x&&Number.isInteger(x)&&x<0){
            str += 's'+x
        }else{
            data.code = 440
            data.message = 'x参数不正确'
            return ''
        }
        if(y&&Number.isInteger(y)&&y>=0){
            str += 'a'+y
        }else if(y&&Number.isInteger(y)&&y<0){
            str += 's'+y
        }else{
            data.code = 441
            data.message = 'y参数不正确'
            return ''
        }
        return str 
    }


    /* 圆角字符串 */
    roundrectString(data:any,roundrect:number){
        if(!roundrect){
            return ''
        }else if(roundrect&&Number.isInteger(roundrect)){
            return '/roundrect/'+roundrect            
        }else{
            data.code = 442
            data.message = '圆角参数不正确'
            return '' 
        }
    }

    /* 生成水印字符串
       水印配置只有全局一个
       默认情况下全局启用水印，所有图片都打水印
       可以通过参数覆盖全局启用配置
    */
    watermarkString(data:any,watermark:boolean,config:Config){
        let enable:boolean
        if(watermark===true){
            enable = true
        }else if(watermark === false){
            enable = false
        }else if(watermark === null || watermark === undefined){
           if(config.watermark_enable==='true'){
               enable = true
           }else if(config.watermark_enable === 'false'){
               enable = false
           }else{
               enable = false
           }
        }else{
            data.code = 443
            data.message = '水印参数不正确'
            return ''
        }
        let str:string = ''
        if(enable){
            if(config.watermark_save_key){
                str += '/watermark/url/'+Buffer.from(config.watermark_save_key).toString('base64')
            }else{
                data.code = 444
                data.message = '水印图片url不存在'
                return ''
            }

            if(config.watermark_gravity&&!this.gravity.has(config.watermark_gravity)){
                data.code = 445
                data.message = '水印重心参数不正确'
                return ''
            }else{
                str+= '/align/'+config.watermark_gravity
            }

            if((config.watermark_x&&!Number.isInteger(config.watermark_x))||(config.watermark_y&&!Number.isInteger(config.watermark_y))){
                data.code = 446
                data.message = '偏移参数不正确'
                return ''
            }else if(!config.watermark_x&&!config.watermark_y){
                str+='/margin/20x20'
            }else if(!config.watermark_x&&config.watermark_y){
                str+='/margin/20x'+config.watermark_y
            }else if(config.watermark_x&&!config.watermark_y){
                str+='/margin/'+config.watermark_x+'x20'
            }else{
                str+='/margin/'+config.watermark_x+'x'+config.watermark_y
            }

            if(config.watermark_opacity&&!Number.isInteger(config.watermark_opacity)){
                data.code = 447
                data.message = '透明度参数不正确'
                return ''
            }else if(!config.watermark_opacity){
                //默认为100，不用管
            }else{
                str+='/opacity/'+config.watermark_opacity
            }

            if(config.watermark_ws&&Number.isInteger(config.watermark_ws)&&config.watermark_ws>=1&&config.watermark_ws<=100){
                str+='/percent/'+config.watermark_ws
            }else if(!config.watermark_ws){
                //默认为0，不用管
            }else{
                data.code = 448
                data.message = '短边自适应参数不正确'
                return ''
            }
            
        }
        return str
            
        /*这段代码当使用自定义水印时用
        if(!watermark){
            return ''
        }else if(isArray(watermark)){
            let str = ''
            for(let i=0;i<watermark.length;i++){
                if(watermark[i].mode=='image'){
                    let {url,gravity,x,y,opacity,ws,repeat,animate} = watermark[i].data

                    if(!url){
                        data.code = 409
                        data.message = '图片url不存在'
                        return ''
                    }else{
                        str += '/watermark/url/'+Buffer.from(url).toString('base64')
                    }

                    if(gravity&&!this.gravity.has(gravity)){
                        data.code = 409
                        data.message = '重心参数不正确'
                        return ''
                    }else if(!gravity){
                        str+= '/align/northwest'
                    }else{
                        str+= '/align/'+gravity
                    }

                    if((x&&!Number.isInteger(x))||(y&&!Number.isInteger(y))){
                        data.code = 409
                        data.message = '偏移参数不正确'
                        return ''
                    }else if(!x&&!y){
                        str+='/margin/20x20'
                    }else if(!x&&y){
                        str+='/margin/20x'+y
                    }else if(x&&!y){
                        str+='/margin/'+x+'x20'
                    }else{
                        str+='/margin/'+x+'x'+y
                    }

                    if(opacity&&!Number.isInteger(opacity)){
                        data.code = 409
                        data.message = '透明度参数不正确'
                        return ''
                    }else if(!opacity){
                        //默认为100，不用管
                    }else{
                        str+='/opacity/'+opacity
                    }

                    if(ws&&Number.isInteger(ws)&&ws>=1&&ws<=100){
                        str+='/percent/'+ws
                    }else if(!ws){
                        //默认为0，不用管
                    }else{
                        data.code = 409
                        data.message = '短边自适应参数不正确'
                        return ''
                    }

                    if(repeat&&repeat!==true&&repeat!==false){
                        data.code = 409
                        data.message = 'repeat参数不正确'
                        return ''
                    }else if(repeat===true){
                        str+='/repeat/true'
                    }else{
                        //默认不管
                    }

                    if(animate&&animate!==true&&animate!==false){
                        data.code = 409
                        data.message = 'animate参数不正确'
                        return ''
                    }else if(animate===true){
                        str+='/animate/true'
                    }else{
                        //默认不管
                    }

                }else if(watermark[i].mode=='text'){
                    let {text,size,font,color,border,gravity,x,y,opacity,animate} = watermark[i].data

                    if(!text){
                        data.code = 409
                        data.message = '水印文本不存在'
                        return ''
                    }else{
                        str+='/watermark/text/'+Buffer.from(text).toString('base64')
                    }

                    if(size&&Number.isInteger(size)){
                        str+='/size/'+size
                    }else if(!size){
                        str+='/size/32'
                    }else{
                        data.code = 409
                        data.message = '文字大小不正确'
                        return ''
                    }
                    
                    if(font&&this.font.has(font)){
                        str+='/font/'+font
                    }else if(!font){
                        str+='/font/simsun'
                    }else{
                        data.code = 409
                        data.message = '文字字体不正确'
                        return ''
                    }

                    if(color&&!this.colorRegex.test(color)){
                        data.code = 409
                        data.message = '文字颜色不正确'
                        return ''
                    }else if(!color){
                        //默认为黑色不管
                    }else{
                        str+='/color/'+color
                    }

                    if(border&&!this.borderRegex.test(border)){
                        data.code = 409
                        data.message = '文字描边不正确'
                        return ''
                    }else if(!border){
                        //默认为黑色不管
                    }else{
                        str+='/border/'+border
                    }

                    if(gravity&&!this.gravity.has(gravity)){
                        data.code = 409
                        data.message = '重心参数不正确'
                        return ''
                    }else if(!gravity){
                        str+= '/align/northwest'
                    }else{
                        str+= '/align/'+gravity
                    }

                    if((x&&!Number.isInteger(x))||(y&&!Number.isInteger(y))){
                        data.code = 409
                        data.message = '偏移参数不正确'
                        return ''
                    }else if(!x&&!y){
                        str+='/margin/20x20'
                    }else if(!x&&y){
                        str+='/margin/20x'+y
                    }else if(x&&!y){
                        str+='/margin/'+x+'x20'
                    }else{
                        str+='/margin/'+x+'x'+y
                    }

                    if(opacity&&!Number.isInteger(opacity)){
                        data.code = 409
                        data.message = '透明度参数不正确'
                        return ''
                    }else if(!opacity){
                        //默认为100，不用管
                    }else{
                        str+='/opacity/'+opacity
                    }

                    if(animate&&animate!==true&&animate!==false){
                        data.code = 409
                        data.message = 'animate参数不正确'
                        return ''
                    }else if(animate===true){
                        str+='/animate/true'
                    }else{
                        //默认不管
                    }
                }else{
                    data.code = 409
                    data.message = '水印模式不正确'
                    return ''
                }
            }
            return str
        }else{
            data.code = 409
            data.message = '水印参数不正确'
            return ''
        }
    */
    }

    rotateString(data:any,rotate:number){
        if(!rotate){
            return ''
        }
        if(Number.isInteger(rotate)){
            return '/rotate/'+rotate
        }else{
            data.code = 449
            data.message = '旋转角度不正确'
            return ''
        }
    }

    blurString(data:any,blur:any){
        if(!blur){
            return ''
        }
        let {redius,sigma} = blur
        if( !redius|| !Number.isInteger(redius) || redius<0 || redius>50){
            data.code = 450
            data.message = '模糊半径不正确'
            return ''
        }
        if(!sigma || !Number.isInteger(sigma)){
            data.code = 451
            data.message = '标准差不正确'
            return ''
        }
        return '/gaussblur/'+redius+'x'+sigma 
    }

    outputString(data:any,sharpen:boolean,format:string,quality:number,progressive:boolean,strip:boolean){
        let str = ''

        if(sharpen===true){
            str+='/unsharp/true'
        }else if(sharpen){
            data.code = 452
            data.message = '锐化参数不正确'
            return ''
        }else{
            //false或者不存在都不管
        }

        if(format&&this.format.has(format)){
            str+='/format/'+format
        }else if(format&&!this.format.has(format)){
            data.code = 453
            data.message = '格式参数不正确'
            return ''
        }else{

        }

        if(quality&&Number.isInteger(quality)&&quality>=1&&quality<=99){
            str+='/quality/'+quality
        }else if(!quality){

        }else{
            data.code = 454
            data.message = '图片质量参数不正确'
            return ''
        }

        if(progressive===true){
            str+='/progressive/true'
        }else if(progressive){
            data.code = 455
            data.message = '渐进参数不正确'
            return ''
        }else{
            //false或者不存在都不管
        }

        if(strip===true){
            str+='/strip/true'
        }else if(strip){
            data.code = 456
            data.message = '去除元信息参数不正确'
            return ''
        }else{
            //false或者不存在都不管
        }
        return str
 
    }

}