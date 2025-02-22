import { createGuid } from '../../utils'
import {
  BufferCreateIndexBufferOptions,
  BufferCreateVertexBufferOptions,
  BufferOptions,
  BufferTargetType,
  BufferUsage,
  BufferUsageType,
  ContextType
} from '../../type'
import Defined from '../Core/Defined'
import { Check } from '..'
import IndexDatatype from '../Core/IndexDatatype'

export default class Buffer {
  vertexArrayDestroyable: boolean
  private _id: string
  private _gl: ContextType
  private _webgl2: boolean
  private _bufferTarget: BufferTargetType
  private _sizeInBytes: number
  private _usage: BufferUsageType | undefined
  private _buffer: WebGLBuffer
  static createVertexBuffer: (
    options: BufferCreateVertexBufferOptions
  ) => Buffer
  static createIndexBuffer: (options: BufferCreateIndexBufferOptions) => Buffer

  get id() {
    return this._id
  }
  get gl() {
    return this._gl
  }
  get webgl2() {
    return this._webgl2
  }
  get bufferTarget() {
    return this._bufferTarget
  }
  get sizeInBytes() {
    return this._sizeInBytes
  }
  get usage() {
    return this._usage
  }
  get buffer() {
    return this._buffer
  }
  constructor(options: BufferOptions) {
    // const gl = options.gl
    // const buffer = gl.createBuffer()
    // gl.bindBuffer(bufferTarget, buffer)
    // gl.bufferData(bufferTarget, data, bufferUsage)
    // gl.bindBuffer(bufferTarget, null)

    // this.gl = gl
    // this.buffer = buffer!
    // this.bufferTarget = bufferTarget
    // this.bufferUsage = bufferUsage
    // // this._bufferType = bufferType;
    // this.id = createGuid()
    // this.vertexArrayDestroyable = true;

    if (!Defined(options.typedArray) && !Defined(options.sizeInBytes)) {
      throw new Error(
        'Either options.sizeInBytes or options.typedArray is required.'
      )
    }

    if (Defined(options.typedArray) && Defined(options.sizeInBytes)) {
      throw new Error(
        'Cannot pass in both options.sizeInBytes and options.typedArray.'
      )
    }
    if (Defined(options.typedArray)) {
      Check.typeOf.object('options.typedArray', options.typedArray)
      Check.typeOf.number(
        'options.typedArray.byteLength',
        options.typedArray.byteLength
      )
    }

    if (!BufferUsage.validate(options.usage)) {
      throw new Error('usage is invalid.')
    }

    const gl = options.context.gl
    const bufferTarget = options.bufferTarget
    const typedArray = options.typedArray
    let sizeInBytes = options.sizeInBytes
    const usage = options.usage
    const hasArray = Defined(typedArray)

    if (hasArray) {
      sizeInBytes = typedArray.byteLength
    }

    // >>includeStart('debug', pragmas.debug);
    Check.typeOf.number.greaterThan('sizeInBytes', sizeInBytes, 0)
    // >>includeEnd('debug');

    const buffer = gl.createBuffer()
    gl.bindBuffer(bufferTarget, buffer)
    gl.bufferData(
      bufferTarget,
      (hasArray ? typedArray! : sizeInBytes) as ArrayBuffer,
      usage!
    )
    gl.bindBuffer(bufferTarget, null)

    this._id = createGuid()
    this._gl = gl
    this._webgl2 = options.context.isSuppotedwebgl2
    this._bufferTarget = bufferTarget
    this._sizeInBytes = sizeInBytes!
    this._usage = usage
    this._buffer = buffer
    this.vertexArrayDestroyable = true
  }
}

Buffer.createVertexBuffer = (options: BufferCreateVertexBufferOptions) => {
  return new Buffer({
    context: options.context,
    bufferTarget: BufferTargetType.ARRAY_BUFFER,
    typedArray: options.typedArray,
    sizeInBytes: options.sizeInBytes,
    usage: options.usage
  })
}
Buffer.createIndexBuffer = (options: BufferCreateIndexBufferOptions) => {
  // >>includeStart('debug', pragmas.debug);
  Check.defined('options.context', options.context)

  if (!IndexDatatype.validate(options.indexDatatype)) {
    throw new Error('Invalid indexDatatype.')
  }

  if (
    options.indexDatatype === IndexDatatype.UNSIGNED_INT &&
    !options.context.elementIndexUint
  ) {
    throw new Error(
      'IndexDatatype.UNSIGNED_INT requires OES_element_index_uint, which is not supported on this system.  Check context.elementIndexUint.'
    )
  }
  // >>includeEnd('debug');

  const context = options.context
  const indexDatatype = options.indexDatatype

  const bytesPerIndex = IndexDatatype.getSizeInBytes(indexDatatype)
  const buffer = new Buffer({
    context: context,
    bufferTarget: BufferTargetType.ELEMENT_ARRAY_BUFFER,
    typedArray: options.typedArray,
    sizeInBytes: options.sizeInBytes,
    usage: options.usage
  })

  const numberOfIndices = buffer.sizeInBytes / bytesPerIndex

  Object.defineProperties(buffer, {
    indexDatatype: {
      get: function () {
        return indexDatatype
      }
    },
    bytesPerIndex: {
      get: function () {
        return bytesPerIndex
      }
    },
    numberOfIndices: {
      get: function () {
        return numberOfIndices
      }
    }
  })

  return buffer
}
