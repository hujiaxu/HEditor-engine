import Context from './Context'

const PixelDatatype = {
  UNSIGNED_INT: WebGL2RenderingContext.UNSIGNED_INT,
  UNSIGNED_BYTE: WebGL2RenderingContext.UNSIGNED_BYTE,
  UNSIGNED_SHORT: WebGL2RenderingContext.UNSIGNED_SHORT,
  FLOAT: WebGL2RenderingContext.FLOAT,
  HALF_FLOAT: WebGL2RenderingContext.HALF_FLOAT,
  UNSIGNED_INT_24_8: WebGL2RenderingContext.UNSIGNED_INT_24_8,
  UNSIGNED_SHORT_4_4_4_4: WebGL2RenderingContext.UNSIGNED_SHORT_4_4_4_4,
  UNSIGNED_SHORT_5_5_5_1: WebGL2RenderingContext.UNSIGNED_SHORT_5_5_5_1,
  UNSIGNED_SHORT_5_6_5: WebGL2RenderingContext.UNSIGNED_SHORT_5_6_5,

  toWebGLConstant: function (pixelDatatype: number, context: Context) {
    switch (pixelDatatype) {
      case PixelDatatype.UNSIGNED_BYTE:
        return WebGL2RenderingContext.UNSIGNED_BYTE
      case PixelDatatype.UNSIGNED_SHORT:
        return WebGL2RenderingContext.UNSIGNED_SHORT
      case PixelDatatype.UNSIGNED_INT:
        return WebGL2RenderingContext.UNSIGNED_INT
      case PixelDatatype.FLOAT:
        return WebGL2RenderingContext.FLOAT
      case PixelDatatype.HALF_FLOAT:
        return context.isSuppotedwebgl2
          ? WebGL2RenderingContext.HALF_FLOAT
          : 0x8d61
      case PixelDatatype.UNSIGNED_INT_24_8:
        return WebGL2RenderingContext.UNSIGNED_INT_24_8
      case PixelDatatype.UNSIGNED_SHORT_4_4_4_4:
        return WebGL2RenderingContext.UNSIGNED_SHORT_4_4_4_4
      case PixelDatatype.UNSIGNED_SHORT_5_5_5_1:
        return WebGL2RenderingContext.UNSIGNED_SHORT_5_5_5_1
      case PixelDatatype.UNSIGNED_SHORT_5_6_5:
        return PixelDatatype.UNSIGNED_SHORT_5_6_5
    }
  },

  validate: function (pixelDatatype: number) {
    return (
      pixelDatatype === PixelDatatype.UNSIGNED_BYTE ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT ||
      pixelDatatype === PixelDatatype.UNSIGNED_INT ||
      pixelDatatype === PixelDatatype.FLOAT ||
      pixelDatatype === PixelDatatype.HALF_FLOAT ||
      pixelDatatype === PixelDatatype.UNSIGNED_INT_24_8 ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT_4_4_4_4 ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT_5_5_5_1 ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT_5_6_5
    )
  },
  getTypedArrayConstructor: function (pixelDatatype: number) {
    const sizeInBytes = PixelDatatype.sizeInBytes(pixelDatatype)
    if (sizeInBytes === Uint8Array.BYTES_PER_ELEMENT) {
      return Uint8Array
    } else if (sizeInBytes === Uint16Array.BYTES_PER_ELEMENT) {
      return Uint16Array
    } else if (
      sizeInBytes === Float32Array.BYTES_PER_ELEMENT &&
      pixelDatatype === PixelDatatype.FLOAT
    ) {
      return Float32Array
    }
    return Uint32Array
  },
  sizeInBytes: function (pixelDatatype: number) {
    switch (pixelDatatype) {
      case PixelDatatype.UNSIGNED_BYTE:
        return 1
      case PixelDatatype.UNSIGNED_SHORT:
      case PixelDatatype.UNSIGNED_SHORT_4_4_4_4:
      case PixelDatatype.UNSIGNED_SHORT_5_5_5_1:
      case PixelDatatype.UNSIGNED_SHORT_5_6_5:
      case PixelDatatype.HALF_FLOAT:
        return 2
      case PixelDatatype.UNSIGNED_INT:
      case PixelDatatype.FLOAT:
      case PixelDatatype.UNSIGNED_INT_24_8:
        return 4
    }
  },
  isPacked: function (pixelDatatype: number) {
    return (
      pixelDatatype === PixelDatatype.UNSIGNED_INT_24_8 ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT_4_4_4_4 ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT_5_5_5_1 ||
      pixelDatatype === PixelDatatype.UNSIGNED_SHORT_5_6_5
    )
  }
}
export default PixelDatatype
