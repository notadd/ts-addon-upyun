
interface ResizeData {
    scale: number
    wscale: number
    hscale: number
    width: number
    height: number
    pixel: number
}

interface Resize {
    mode: string
    data: ResizeData
}

interface Tailor {
    isBefore: boolean
    width: number
    height: number
    x: number
    y: number
    gravity: string
}

interface Blur {
    redius: number
    sigma: number
}


export interface ImagePreProcessInfo {
    resize?: Resize
    tailor?: Tailor
    watermark?: boolean
    rotate?: number
}


export interface ImagePostProcessInfo {
    resize?: Resize
    tailor?: Tailor
    watermark?: boolean
    rotate?: number
    blur?: Blur
    sharpen?: boolean
    format?: string
    lossless?: boolean
    quality?: number
    progressive?: boolean
    strip?: boolean
}