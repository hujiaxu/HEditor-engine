// GPUCanvasContext 需要做单独处理
export type ContextType = WebGL2RenderingContext | WebGLRenderingContext

export interface ContextOptions {
  canvas: HTMLCanvasElement
  isUseGPU: boolean
}
