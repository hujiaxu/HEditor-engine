import { Primitive } from '../../Engine'

// GPUCanvasContext 需要做单独处理
export type ContextType = WebGL2RenderingContext | WebGLRenderingContext

export interface ContextOptions {
  canvas: HTMLCanvasElement
  isUseGPU: boolean
  allowTextureFilterAnisotropic?: boolean
}

export interface PickObject {
  id: string
  primitive: Primitive
}
export type PickObjects = Record<string, PickObject>
