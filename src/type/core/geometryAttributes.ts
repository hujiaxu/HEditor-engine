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
  createTypedArray: (componentDatatype: number, valuesOrLength: number) => {
  
    //>>includeStart('debug', pragmas.debug);
    if (!Defined(componentDatatype)) {
      throw new Error("componentDatatype is required.");
    }
    if (!Defined(valuesOrLength)) {
      throw new Error("valuesOrLength is required.");
    }
    //>>includeEnd('debug');


  switch (componentDatatype) {
    case ComponentDatatype.BYTE:
      return new Int8Array(valuesOrLength);
    case ComponentDatatype.UNSIGNED_BYTE:
      return new Uint8Array(valuesOrLength);
    case ComponentDatatype.SHORT:
      return new Int16Array(valuesOrLength);
    case ComponentDatatype.UNSIGNED_SHORT:
      return new Uint16Array(valuesOrLength);
    case ComponentDatatype.INT:
      return new Int32Array(valuesOrLength);
    case ComponentDatatype.UNSIGNED_INT:
      return new Uint32Array(valuesOrLength);
    case ComponentDatatype.FLOAT:
      return new Float32Array(valuesOrLength);
    case ComponentDatatype.DOUBLE:
      return new Float64Array(valuesOrLength);
    //>>includeStart('debug', pragmas.debug);
    default:
      throw new Error("componentDatatype is not a valid value.");
    //>>includeEnd('debug');
  }
  }
}


export interface GeometryAttributeOptions {
  componentDatatype: number
  componentsPerAttribute: number
  values: ArrayLike<number>
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
}

export type GeometryAttributeType = 'position' | 'position3DHigh' | 'position3DLow' | 'normal' | 'st' | 'binormal' | 'tangent' | 'bitangent' | 'color' | 'batchId'
