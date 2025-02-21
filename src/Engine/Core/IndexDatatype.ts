import Defined from './Defined'
import HEditorMath from './Math'

export default class IndexDatatype {
  static createTypedArray: (
    numberOfVertices: number,
    indicesLengthOrArray: ArrayLike<number>  | ArrayBuffer | number
  ) => Uint32Array<ArrayBuffer> | Uint16Array<ArrayBuffer>
  static readonly UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT
  static readonly UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE
  static readonly UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT
  static validate: (
    indexDatatype: number
  ) => indexDatatype is 5125 | 5121 | 5123
  static getSizeInBytes: (indexDatatype: number) => number
}

IndexDatatype.createTypedArray = (
  numberOfVertices: number,
  indicesLengthOrArray: ArrayLike<number> | ArrayBuffer | number
) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(numberOfVertices)) {
    throw new Error('numberOfVertices is required.')
  }
  // >>includeEnd('debug');
  const typedArray = typeof indicesLengthOrArray === 'number' ? new ArrayBuffer(indicesLengthOrArray) : indicesLengthOrArray

  if (numberOfVertices >= HEditorMath.SIXTY_FOUR_KILOBYTES) {
    return new Uint32Array(typedArray)
  }

  // 2^16 - 1
  return new Uint16Array(typedArray)
}
IndexDatatype.validate = (indexDatatype: number) => {
  return (
    Defined(indexDatatype) &&
    (indexDatatype === IndexDatatype.UNSIGNED_BYTE ||
      indexDatatype === IndexDatatype.UNSIGNED_SHORT ||
      indexDatatype === IndexDatatype.UNSIGNED_INT)
  )
}
IndexDatatype.getSizeInBytes = (indexDatatype: number) => {
  switch (indexDatatype) {
    case IndexDatatype.UNSIGNED_BYTE:
      return Uint8Array.BYTES_PER_ELEMENT
    case IndexDatatype.UNSIGNED_SHORT:
      return Uint16Array.BYTES_PER_ELEMENT
    case IndexDatatype.UNSIGNED_INT:
      return Uint32Array.BYTES_PER_ELEMENT
  }

  // >>includeStart('debug', pragmas.debug);
  throw new Error(
    'indexDatatype is required and must be a valid IndexDatatype constant.'
  )
  // >>includeEnd('debug');
}
