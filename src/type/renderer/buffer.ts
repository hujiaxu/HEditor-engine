import { Context } from '../../Engine'
import { GeometryAttributeValuesType } from '../core/geometryAttributes'

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
  bufferTarget: BufferTargetType
  bufferUsage?: BufferUsageType
  context: Context
  typedArray?: ArrayBuffer | GeometryAttributeValuesType
  usage: BufferUsageType
  sizeInBytes?: number
  // bufferType: BufferType
}

export const BufferUsage = {
  STREAM_DRAW: BufferUsageType.STREAM_DRAW,
  STATIC_DRAW: BufferUsageType.STATIC_DRAW,
  DYNAMIC_DRAW: BufferUsageType.DYNAMIC_DRAW,

  validate: function (bufferUsage: BufferUsageType) {
    return (
      bufferUsage === BufferUsage.STREAM_DRAW ||
      bufferUsage === BufferUsage.STATIC_DRAW ||
      bufferUsage === BufferUsage.DYNAMIC_DRAW
    )
  }
}
export interface BufferCreateVertexBufferOptions {
  context: Context
  typedArray: ArrayBuffer | GeometryAttributeValuesType
  sizeInBytes?: number
  usage: number
}
export interface BufferCreateIndexBufferOptions {
  context: Context
  typedArray: ArrayBuffer | GeometryAttributeValuesType
  usage: number
  indexDatatype: number
  sizeInBytes?: number
}
