import { ContextType } from './context'

export interface UniformOptions {
  gl: ContextType
}

export enum UniformType {
  FLOAT = WebGLRenderingContext.FLOAT,
  FLOAT_VEC2 = WebGLRenderingContext.FLOAT_VEC2,
  FLOAT_VEC3 = WebGLRenderingContext.FLOAT_VEC3,
  FLOAT_VEC4 = WebGLRenderingContext.FLOAT_VEC4,
  INT = WebGLRenderingContext.INT,
  INT_VEC2 = WebGLRenderingContext.INT_VEC2,
  INT_VEC3 = WebGLRenderingContext.INT_VEC3,
  INT_VEC4 = WebGLRenderingContext.INT_VEC4,
  BOOL = WebGLRenderingContext.BOOL,
  BOOL_VEC2 = WebGLRenderingContext.BOOL_VEC2,
  BOOL_VEC3 = WebGLRenderingContext.BOOL_VEC3,
  BOOL_VEC4 = WebGLRenderingContext.BOOL_VEC4,
  FLOAT_MAT2 = WebGLRenderingContext.FLOAT_MAT2,
  FLOAT_MAT3 = WebGLRenderingContext.FLOAT_MAT3,
  FLOAT_MAT4 = WebGLRenderingContext.FLOAT_MAT4,
  SAMPLER_2D = WebGLRenderingContext.SAMPLER_2D,
  SAMPLER_CUBE = WebGLRenderingContext.SAMPLER_CUBE
}
