
class ResizeData {
    scale: number
    wscale: number
    hscale: number
    width: number
    height: number
    pixel: number
}

class Resize {
    mode: string
    data: ResizeData
}

class Tailor {
    isBefore: boolean
    width: number
    height: number
    x: number
    y: number
    gravity: string
}

class Blur {
    redius: number
    sigma: number
}


export class ImagePreProcessInfo {
    resize?: Resize
    tailor?: Tailor
    watermark?: boolean
    rotate?: number
}


export class ImagePostProcessInfo {
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