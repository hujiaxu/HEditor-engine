import { Defined, GeometryAttribute } from '../../Engine'

export const ComponentDatatype = {
  BYTE: WebGLRenderingContext.BYTE,
  FLOAT: WebGLRenderingContext.FLOAT,
  SHORT: WebGLRenderingContext.SHORT,
  UNSIGNED_BYTE: WebGLRenderingContext.UNSIGNED_BYTE,
  UNSIGNED_SHORT: WebGLRenderingContext.UNSIGNED_SHORT,
  UNSIGNED_INT: WebGLRenderingContext.UNSIGNED_INT,
  // Desktop OpenGL
  DOUBLE: 0x140a,
  INT: WebGLRenderingContext.INT,
  validate: function (componentDatatype: number) {
    return (
      componentDatatype === ComponentDatatype.BYTE ||
      componentDatatype === ComponentDatatype.FLOAT ||
      componentDatatype === ComponentDatatype.SHORT ||
      componentDatatype === ComponentDatatype.UNSIGNED_BYTE ||
      componentDatatype === ComponentDatatype.UNSIGNED_SHORT ||
      componentDatatype === ComponentDatatype.UNSIGNED_INT ||
      componentDatatype === ComponentDatatype.DOUBLE ||
      componentDatatype === ComponentDatatype.INT
    )
  },
  getSizeInBytes: function (componentDatatype: number) {
    switch (componentDatatype) {
      case ComponentDatatype.BYTE:
        return Int8Array.BYTES_PER_ELEMENT
      case ComponentDatatype.UNSIGNED_BYTE:
        return Uint8Array.BYTES_PER_ELEMENT
      case ComponentDatatype.SHORT:
        return Int16Array.BYTES_PER_ELEMENT
      case ComponentDatatype.UNSIGNED_SHORT:
        return Uint16Array.BYTES_PER_ELEMENT
      case ComponentDatatype.INT:
        return Int32Array.BYTES_PER_ELEMENT
      case ComponentDatatype.UNSIGNED_INT:
        return Uint32Array.BYTES_PER_ELEMENT
      case ComponentDatatype.FLOAT:
        return Float32Array.BYTES_PER_ELEMENT
      case ComponentDatatype.DOUBLE:
        return Float64Array.BYTES_PER_ELEMENT
      // >>includeStart('debug', pragmas.debug);
      default:
        throw new Error('componentDatatype is not a valid value.')
      // >>includeEnd('debug');
    }
  },
  createTypedArray: (
    componentDatatype: number,
    valuesOrLength: GeometryAttributeValuesType | ArrayBuffer
  ) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(componentDatatype)) {
      throw new Error('componentDatatype is required.')
    }
    if (!Defined(valuesOrLength)) {
      throw new Error('valuesOrLength is required.')
    }
    // >>includeEnd('debug');

    switch (componentDatatype) {
      case ComponentDatatype.BYTE:
        return new Int8Array(valuesOrLength)
      case ComponentDatatype.UNSIGNED_BYTE:
        return new Uint8Array(valuesOrLength)
      case ComponentDatatype.SHORT:
        return new Int16Array(valuesOrLength)
      case ComponentDatatype.UNSIGNED_SHORT:
        return new Uint16Array(valuesOrLength)
      case ComponentDatatype.INT:
        return new Int32Array(valuesOrLength)
      case ComponentDatatype.UNSIGNED_INT:
        return new Uint32Array(valuesOrLength)
      case ComponentDatatype.FLOAT:
        return new Float32Array(valuesOrLength)
      case ComponentDatatype.DOUBLE:
        return new Float64Array(valuesOrLength)
      // >>includeStart('debug', pragmas.debug);
      default:
        throw new Error('componentDatatype is not a valid value.')
      // >>includeEnd('debug');
    }
  }
}

export type GeometryAttributeValuesType =
  | Int8Array<ArrayBuffer>
  | Uint8Array<ArrayBuffer>
  | Float32Array<ArrayBuffer>
  | Int16Array<ArrayBuffer>
  | Uint16Array<ArrayBuffer>
  | Int32Array<ArrayBuffer>
  | Uint32Array<ArrayBuffer>
  | Float64Array<ArrayBuffer>

export type GeometryIndicesType =
  | Uint16Array<ArrayBuffer>
  | Uint32Array<ArrayBuffer>

export interface GeometryAttributeOptions {
  componentDatatype: number
  componentsPerAttribute: number
  values: GeometryAttributeValuesType
  normalize?: boolean
  functionName?: string
}

export interface GeometryAttributesOptions {
  position: GeometryAttribute
  position3DHigh?: GeometryAttribute
  position3DLow?: GeometryAttribute
  normal?: GeometryAttribute
  st?: GeometryAttribute
  binormal?: GeometryAttribute
  tangent?: GeometryAttribute
  bitangent?: GeometryAttribute
  color?: GeometryAttribute
  batchId?: GeometryAttribute
  extrudeDirection?: GeometryAttribute
}

export type GeometryAttributeType =
  | 'position'
  | 'position3DHigh'
  | 'position3DLow'
  | 'normal'
  | 'st'
  | 'binormal'
  | 'tangent'
  | 'bitangent'
  | 'color'
  | 'batchId'

export enum GeometryOffsetAttribute {
  NONE = 0,
  TOP = 1,
  ALL = 2
}
