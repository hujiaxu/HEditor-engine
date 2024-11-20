import { createGuid } from '../../utils'
import {
  BufferOptions,
  BufferTargetType,
  BufferUsageType,
  ContextType
} from '../../type'

export default class Buffer {
  buffer: WebGLBuffer

  gl: ContextType
  bufferTarget: BufferTargetType
  bufferUsage: BufferUsageType
  // private _bufferType: BufferType;

  id: string
  constructor({
    data,
    bufferTarget,
    bufferUsage,
    // bufferType,
    gl
  }: BufferOptions) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(bufferTarget, buffer)
    gl.bufferData(bufferTarget, data, bufferUsage)
    // gl.bindBuffer(bufferTarget, null)

    this.gl = gl
    this.buffer = buffer!
    this.bufferTarget = bufferTarget
    this.bufferUsage = bufferUsage
    // this._bufferType = bufferType;
    this.id = createGuid()
  }
}
