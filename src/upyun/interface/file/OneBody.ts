import { ImagePostProcessInfo } from './ImageProcessInfo'
 
export interface OneBody{
    bucket_name:string
    name:string
    type:string
    imagePostProcessInfo?:ImagePostProcessInfo
}