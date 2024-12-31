import PixelDatatype from './PixelDatatype'
import Context from './Context'

const PixelFormat = {
  RGBA: WebGL2RenderingContext.RGBA,
  RGB: WebGL2RenderingContext.RGB,
  RG: WebGL2RenderingContext.RG,
  RED: WebGL2RenderingContext.RED,
  LUMINANCE: WebGL2RenderingContext.LUMINANCE,
  DEPTH_STENCIL: WebGL2RenderingContext.DEPTH_STENCIL,
  DEPTH_COMPONENT: WebGL2RenderingContext.DEPTH_COMPONENT,
  LUMINANCE_ALPHA: WebGL2RenderingContext.LUMINANCE_ALPHA,
  ALPHA: WebGL2RenderingContext.ALPHA,
  RGB_DXT1: 0x83f0,
  RGBA_DXT1: 0x83f1,
  RGBA_DXT3: 0x83f2,
  RGBA_DXT5: 0x83f3,
  RGB_PVRTC_4BPPV1: 0x8c00,
  RGB_PVRTC_2BPPV1: 0x8c01,
  RGBA_PVRTC_4BPPV1: 0x8c02,
  RGBA_PVRTC_2BPPV1: 0x8c03,
  RGBA_ASTC: 0x93b0,
  RGB_ETC1: 0x8d64,
  RGB8_ETC2: 0x9274,
  RGBA8_ETC2_EAC: 0x9278,
  RGBA_BC7: 0x8e8c,
  flipY: function (
    bufferView: Uint8Array,
    pixelFormat: number,
    pixelDatatype: number,
    width: number,
    height: number
  ) {
    if (height === 1) {
      return bufferView
    }
    const flipped = PixelFormat.createTypedArray(
      pixelFormat,
      pixelDatatype,
      width,
      height
    )
    const numberOfComponents = PixelFormat.componentsLength(pixelFormat)
    const textureWidth = width * numberOfComponents
    for (let i = 0; i < height; ++i) {
      const row = i * width * numberOfComponents
      const flippedRow = (height - i - 1) * width * numberOfComponents
      for (let j = 0; j < textureWidth; ++j) {
        flipped[flippedRow + j] = bufferView[row + j]
      }
    }
    return flipped
  },
  createTypedArray: function (
    pixelFormat: number,
    pixelDatatype: number,
    width: number,
    height: number
  ) {
    const constructor = PixelDatatype.getTypedArrayConstructor(pixelDatatype)
    const size = PixelFormat.componentsLength(pixelFormat) * width * height
    return new constructor(size)
  },
  validate: function (pixelFormat: number) {
    return (
      pixelFormat === PixelFormat.DEPTH_COMPONENT ||
      pixelFormat === PixelFormat.DEPTH_STENCIL ||
      pixelFormat === PixelFormat.ALPHA ||
      pixelFormat === PixelFormat.RED ||
      pixelFormat === PixelFormat.RG ||
      pixelFormat === PixelFormat.RGB ||
      pixelFormat === PixelFormat.RGBA ||
      pixelFormat === PixelFormat.LUMINANCE ||
      pixelFormat === PixelFormat.LUMINANCE_ALPHA ||
      pixelFormat === PixelFormat.RGB_DXT1 ||
      pixelFormat === PixelFormat.RGBA_DXT1 ||
      pixelFormat === PixelFormat.RGBA_DXT3 ||
      pixelFormat === PixelFormat.RGBA_DXT5 ||
      pixelFormat === PixelFormat.RGB_PVRTC_4BPPV1 ||
      pixelFormat === PixelFormat.RGB_PVRTC_2BPPV1 ||
      pixelFormat === PixelFormat.RGBA_PVRTC_4BPPV1 ||
      pixelFormat === PixelFormat.RGBA_PVRTC_2BPPV1 ||
      pixelFormat === PixelFormat.RGBA_ASTC ||
      pixelFormat === PixelFormat.RGB_ETC1 ||
      pixelFormat === PixelFormat.RGB8_ETC2 ||
      pixelFormat === PixelFormat.RGBA8_ETC2_EAC ||
      pixelFormat === PixelFormat.RGBA_BC7
    )
  },
  isCompressedFormat: function (pixelFormat: number) {
    return (
      pixelFormat === PixelFormat.RGB_DXT1 ||
      pixelFormat === PixelFormat.RGBA_DXT1 ||
      pixelFormat === PixelFormat.RGBA_DXT3 ||
      pixelFormat === PixelFormat.RGBA_DXT5 ||
      pixelFormat === PixelFormat.RGB_PVRTC_4BPPV1 ||
      pixelFormat === PixelFormat.RGB_PVRTC_2BPPV1 ||
      pixelFormat === PixelFormat.RGBA_PVRTC_4BPPV1 ||
      pixelFormat === PixelFormat.RGBA_PVRTC_2BPPV1 ||
      pixelFormat === PixelFormat.RGBA_ASTC ||
      pixelFormat === PixelFormat.RGB_ETC1 ||
      pixelFormat === PixelFormat.RGB8_ETC2 ||
      pixelFormat === PixelFormat.RGBA8_ETC2_EAC ||
      pixelFormat === PixelFormat.RGBA_BC7
    )
  },
  toInternalFormat: function (
    pixelFormat: number,
    pixelDatatype: number,
    context: Context
  ) {
    if (!context.isSuppotedwebgl2) {
      return pixelFormat
    }

    // Convert pixelFormat to correct internalFormat for WebGL 2
    if (pixelFormat === PixelFormat.DEPTH_STENCIL) {
      return WebGL2RenderingContext.DEPTH24_STENCIL8
    }

    if (pixelFormat === PixelFormat.DEPTH_COMPONENT) {
      if (pixelDatatype === PixelDatatype.UNSIGNED_SHORT) {
        return WebGL2RenderingContext.DEPTH_COMPONENT16
      } else if (pixelDatatype === PixelDatatype.UNSIGNED_INT) {
        return WebGL2RenderingContext.DEPTH_COMPONENT24
      }
    }

    if (pixelDatatype === PixelDatatype.FLOAT) {
      switch (pixelFormat) {
        case PixelFormat.RGBA:
          return WebGL2RenderingContext.RGBA32F
        case PixelFormat.RGB:
          return WebGL2RenderingContext.RGB32F
        case PixelFormat.RG:
          return WebGL2RenderingContext.RG32F
        case PixelFormat.RED:
          return WebGL2RenderingContext.R32F
      }
    }

    if (pixelDatatype === PixelDatatype.HALF_FLOAT) {
      switch (pixelFormat) {
        case PixelFormat.RGBA:
          return WebGL2RenderingContext.RGBA16F
        case PixelFormat.RGB:
          return WebGL2RenderingContext.RGB16F
        case PixelFormat.RG:
          return WebGL2RenderingContext.RG16F
        case PixelFormat.RED:
          return WebGL2RenderingContext.R16F
      }
    }

    return pixelFormat
  },
  isDepthFormat: function (pixelFormat: number) {
    return (
      pixelFormat === PixelFormat.DEPTH_COMPONENT ||
      pixelFormat === PixelFormat.DEPTH_STENCIL
    )
  },
  isDXTFormat: function (pixelFormat: number) {
    return (
      pixelFormat === PixelFormat.RGB_DXT1 ||
      pixelFormat === PixelFormat.RGBA_DXT1 ||
      pixelFormat === PixelFormat.RGBA_DXT3 ||
      pixelFormat === PixelFormat.RGBA_DXT5
    )
  },
  isPVRTCFormat: function (pixelFormat: number) {
    return (
      pixelFormat === PixelFormat.RGB_PVRTC_4BPPV1 ||
      pixelFormat === PixelFormat.RGB_PVRTC_2BPPV1 ||
      pixelFormat === PixelFormat.RGBA_PVRTC_4BPPV1 ||
      pixelFormat === PixelFormat.RGBA_PVRTC_2BPPV1
    )
  },
  isASTCFormat: function (pixelFormat: number) {
    return pixelFormat === PixelFormat.RGBA_ASTC
  },
  isETC2Format: function (pixelFormat: number) {
    return (
      pixelFormat === PixelFormat.RGB8_ETC2 ||
      pixelFormat === PixelFormat.RGBA8_ETC2_EAC
    )
  },
  isETC1Format: function (pixelFormat: number) {
    return pixelFormat === PixelFormat.RGB_ETC1
  },
  isBC7Format: function (pixelFormat: number) {
    return pixelFormat === PixelFormat.RGBA_BC7
  },
  compressedTextureSizeInBytes: function (
    pixelFormat: number,
    width: number,
    height: number
  ) {
    switch (pixelFormat) {
      case PixelFormat.RGB_DXT1:
      case PixelFormat.RGBA_DXT1:
      case PixelFormat.RGB_ETC1:
      case PixelFormat.RGB8_ETC2:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8

      case PixelFormat.RGBA_DXT3:
      case PixelFormat.RGBA_DXT5:
      case PixelFormat.RGBA_ASTC:
      case PixelFormat.RGBA8_ETC2_EAC:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16

      case PixelFormat.RGB_PVRTC_4BPPV1:
      case PixelFormat.RGBA_PVRTC_4BPPV1:
        return Math.floor(
          (Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8
        )

      case PixelFormat.RGB_PVRTC_2BPPV1:
      case PixelFormat.RGBA_PVRTC_2BPPV1:
        return Math.floor(
          (Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8
        )

      case PixelFormat.RGBA_BC7:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 16

      default:
        return 0
    }
  },
  textureSizeInBytes: function (
    pixelFormat: number,
    pixelDatatype: number,
    width: number,
    height: number
  ) {
    let componentsLength = PixelFormat.componentsLength(pixelFormat)
    if (PixelDatatype.isPacked(pixelDatatype)) {
      componentsLength = 1
    }
    return (
      componentsLength *
      PixelDatatype.sizeInBytes(pixelDatatype)! *
      width *
      height
    )
  },
  componentsLength: function (pixelFormat: number) {
    switch (pixelFormat) {
      case PixelFormat.RGB:
        return 3
      case PixelFormat.RGBA:
        return 4
      case PixelFormat.LUMINANCE_ALPHA:
      case PixelFormat.RG:
        return 2
      case PixelFormat.ALPHA:
      case PixelFormat.RED:
      case PixelFormat.LUMINANCE:
        return 1
      default:
        return 1
    }
  },
  alignmentInBytes: function (
    pixelFormat: number,
    pixelDatatype: number,
    width: number
  ) {
    const mod =
      PixelFormat.textureSizeInBytes(pixelFormat, pixelDatatype, width, 1) % 4
    return mod === 0 ? 4 : mod === 2 ? 2 : 1
  }
}

export default PixelFormat
