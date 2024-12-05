import { ContextType } from './context'

export enum BufferTargetType {
  ARRAY_BUFFER = WebGLRenderingContext.ARRAY_BUFFER,

  ELEMENT_ARRAY_BUFFER = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,

  COPY_READ_BUFFER = WebGL2RenderingContext.COPY_READ_BUFFER,

  COPY_WRITE_BUFFER = WebGL2RenderingContext.COPY_WRITE_BUFFER,

  TRANSFORM_FEEDBACK_BUFFER = WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER,

  UNIFORM_BUFFER = WebGL2RenderingContext.UNIFORM_BUFFER,

  PIXEL_PACK_BUFFER = WebGL2RenderingContext.PIXEL_PACK_BUFFER,

  PIXEL_UNPACK_BUFFER = WebGL2RenderingContext.PIXEL_UNPACK_BUFFER
}

export enum BufferUsageType {
  STATIC_DRAW = WebGLRenderingContext.STATIC_DRAW,
  DYNAMIC_DRAW = WebGLRenderingContext.DYNAMIC_DRAW,
  STREAM_DRAW = WebGLRenderingContext.STREAM_DRAW
}

export enum BufferType {
  ARRAY_BUFFER = WebGLRenderingContext.ARRAY_BUFFER,
  ELEMENT_ARRAY_BUFFER = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER
}

export enum IndexDataType {
  BYTE = WebGLRenderingContext.BYTE,
  UNSIGNED_BYTE = WebGLRenderingContext.UNSIGNED_BYTE,
  SHORT = WebGLRenderingContext.SHORT,
  UNSIGNED_SHORT = WebGLRenderingContext.UNSIGNED_SHORT,
  INT = WebGLRenderingContext.INT,
  UNSIGNED_INT = WebGLRenderingContext.UNSIGNED_INT
}

export interface BufferOptions {
  gl: ContextType
  data: Float32Array | Uint16Array
  bufferTarget: BufferTargetType
  bufferUsage: BufferUsageType
  // bufferType: BufferType
}
