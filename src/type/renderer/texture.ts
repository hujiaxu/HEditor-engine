import { Context, Sampler, Framebuffer } from '../../Engine'

export interface SourceType {
  image?: HTMLImageElement
  canvas?: HTMLCanvasElement
  data?: ArrayBuffer
  width?: number
  height?: number
  xOffset?: number
  yOffset?: number
  pixelFormat?: number
  pixelDatatype?: number
  naturalWidth?: number
  naturalHeight?: number
  videoWidth?: number
  videoHeight?: number
  arrayBufferView?: Uint8Array
  framebuffer?: Framebuffer
  mipLevels?: Uint8Array[]
}
export interface TextureOptions {
  id?: string
  context: Context
  source?: SourceType
  pixelFormat?: number
  pixelDatatype?: number
  flipY?: boolean
  skipColorSpaceConversion?: boolean
  sampler?: Sampler
  width?: number
  height?: number
  preMultiplyAlpha?: boolean
}
