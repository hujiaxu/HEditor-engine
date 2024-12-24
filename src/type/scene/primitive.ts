import { Appearance, Cartesian3, GeometryInstance, Matrix4 } from '../../Engine'

export enum PrimitiveType {
  POINTS = WebGLRenderingContext.POINTS,
  LINES = WebGLRenderingContext.LINES,
  LINE_LOOP = WebGLRenderingContext.LINE_LOOP,
  LINE_STRIP = WebGLRenderingContext.LINE_STRIP,
  TRIANGLES = WebGLRenderingContext.TRIANGLES,
  TRIANGLE_STRIP = WebGLRenderingContext.TRIANGLE_STRIP,
  TRIANGLE_FAN = WebGLRenderingContext.TRIANGLE_FAN
}

export enum PrimitiveState {
  READY = 0,
  CREATING = 1,
  CREATED = 2,
  COMBINING = 3,
  COMBINED = 4,
  COMPLETE = 5,
  FAILED = 6
}

export interface PrimitiveOptions {
  GeometryInstances: GeometryInstance[] | GeometryInstance
  primitiveType: PrimitiveType
  appearance: Appearance
  depthFailAppearance?: Appearance
  show?: boolean
  modelMatrix?: Matrix4
  id?: string
  releaseGeometryInstances?: boolean
  vertexCacheOptimize?: boolean
  interleave?: boolean
  allowPicking?: boolean
  asynchronous?: boolean
  compressVertices?: boolean
  cull?: boolean
  rtcCenter?: Cartesian3
}
