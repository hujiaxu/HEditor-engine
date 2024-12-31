import { SourceType, TextureOptions } from '../../type'
import PixelDatatype from './PixelDatatype'
import Defined from '../Core/Defined'
import Sampler from './Sampler'
import PixelFormat from './PixelFormat'
import ContextLimits from './ContextLimits'
import { createGuid } from '../../utils'
import Cartesian2 from '../Core/Cartesian2'
import Context from './Context'
import TextureMinificationFilter from './TextureMinificationFilter'
import TextureMagnificationFilter from './TextureMagnificationFilter'

export default class Texture {
  private _id!: string
  private _context!: Context
  private _sampler: Sampler | undefined
  private _initialized!: boolean
  private _flipY!: boolean
  private _preMultiplyAlpha!: boolean
  private _sizeInBytes!: number
  private _textureFilterAnisotropic: any
  private _textureTarget!: number
  private _texture!: WebGLTexture
  private _internalFormat!: number
  private _pixelFormat!: number
  private _pixelDatatype!: number
  private _width!: number
  private _height!: number
  private _dimensions!: Cartesian2
  private _hasMipmap!: boolean

  get internalFormat() {
    return this._internalFormat
  }
  get textureTarget() {
    return this._textureTarget
  }
  get pixelFormat() {
    return this._pixelFormat
  }
  get pixelDatatype() {
    return this._pixelDatatype
  }
  get id() {
    return this._id
  }
  get sampler() {
    return this._sampler
  }
  get initialized() {
    return this._initialized
  }
  get flipY() {
    return this._flipY
  }
  get preMultiplyAlpha() {
    return this._preMultiplyAlpha
  }
  get sizeInBytes() {
    return this._sizeInBytes
  }
  get width() {
    return this._width
  }
  get height() {
    return this._height
  }
  get dimensions() {
    return this._dimensions
  }
  get hasMipmap() {
    return this._hasMipmap
  }
  constructor(options: TextureOptions) {
    const {
      context,
      source,
      pixelFormat = PixelFormat.RGBA,
      pixelDatatype = PixelDatatype.UNSIGNED_BYTE,
      flipY = true,
      skipColorSpaceConversion = false,
      sampler = new Sampler()
    } = options

    let { width, height } = options
    if (Defined(source)) {
      // Make sure we are using the element's intrinsic width and height where available
      if (!Defined(width)) {
        width = source.videoWidth ?? source.naturalWidth ?? source.width
      }
      if (!Defined(height)) {
        height = source.videoHeight ?? source.naturalHeight ?? source.height
      }
    }

    // Use premultiplied alpha for opaque textures should perform better on Chrome:
    // http://media.tojicode.com/webglCamp4/#20
    const preMultiplyAlpha =
      options.preMultiplyAlpha ||
      pixelFormat === PixelFormat.RGB ||
      pixelFormat === PixelFormat.LUMINANCE

    const internalFormat = PixelFormat.toInternalFormat(
      pixelFormat,
      pixelDatatype,
      context
    )
    const isCompressed = PixelFormat.isCompressedFormat(internalFormat)

    if (!Defined(width) || !Defined(height)) {
      throw new Error(
        'options requires a source field to create an initialized texture or width and height fields to create a blank texture.'
      )
    }

    if (width > ContextLimits.maximumTextureSize) {
      throw new Error(
        `Width must be less than or equal to the maximum texture size (${ContextLimits.maximumTextureSize}).  Check maximumTextureSize.`
      )
    }

    if (height > ContextLimits.maximumTextureSize) {
      throw new Error(
        `Height must be less than or equal to the maximum texture size (${ContextLimits.maximumTextureSize}).  Check maximumTextureSize.`
      )
    }
    if (!PixelFormat.validate(pixelFormat)) {
      throw new Error('Invalid options.pixelFormat.')
    }

    if (!isCompressed && !PixelDatatype.validate(pixelDatatype)) {
      throw new Error('Invalid options.pixelDatatype.')
    }
    if (
      pixelFormat === PixelFormat.DEPTH_COMPONENT &&
      pixelDatatype !== PixelDatatype.UNSIGNED_SHORT &&
      pixelDatatype !== PixelDatatype.UNSIGNED_INT
    ) {
      throw new Error(
        'When options.pixelFormat is DEPTH_COMPONENT, options.pixelDatatype must be UNSIGNED_SHORT or UNSIGNED_INT.'
      )
    }
    if (
      pixelFormat === PixelFormat.DEPTH_STENCIL &&
      pixelDatatype !== PixelDatatype.UNSIGNED_INT_24_8
    ) {
      throw new Error(
        'When options.pixelFormat is DEPTH_STENCIL, options.pixelDatatype must be UNSIGNED_INT_24_8.'
      )
    }

    if (
      pixelDatatype === PixelDatatype.HALF_FLOAT &&
      !context.halfFloatingPointTexture
    ) {
      throw new Error(
        'When options.pixelDatatype is HALF_FLOAT, this WebGL implementation must support the OES_texture_half_float extension. Check context.halfFloatingPointTexture.'
      )
    }

    if (PixelFormat.isDepthFormat(pixelFormat)) {
      if (Defined(source)) {
        throw new Error(
          'When options.pixelFormat is DEPTH_COMPONENT or DEPTH_STENCIL, source cannot be provided.'
        )
      }

      if (!context.depthTexture) {
        throw new Error(
          'When options.pixelFormat is DEPTH_COMPONENT or DEPTH_STENCIL, this WebGL implementation must support WEBGL_depth_texture.  Check context.depthTexture.'
        )
      }
    }
    if (isCompressed) {
      if (!Defined(source) || !Defined(source.arrayBufferView)) {
        throw new Error(
          'When options.pixelFormat is compressed, options.source.arrayBufferView must be defined.'
        )
      }

      if (PixelFormat.isDXTFormat(internalFormat) && !context.s3tc) {
        throw new Error(
          'When options.pixelFormat is S3TC compressed, this WebGL implementation must support the WEBGL_compressed_texture_s3tc extension. Check context.s3tc.'
        )
      } else if (PixelFormat.isPVRTCFormat(internalFormat) && !context.pvrtc) {
        throw new Error(
          'When options.pixelFormat is PVRTC compressed, this WebGL implementation must support the WEBGL_compressed_texture_pvrtc extension. Check context.pvrtc.'
        )
      } else if (PixelFormat.isASTCFormat(internalFormat) && !context.astc) {
        throw new Error(
          'When options.pixelFormat is ASTC compressed, this WebGL implementation must support the WEBGL_compressed_texture_astc extension. Check context.astc.'
        )
      } else if (PixelFormat.isETC2Format(internalFormat) && !context.etc) {
        throw new Error(
          'When options.pixelFormat is ETC2 compressed, this WebGL implementation must support the WEBGL_compressed_texture_etc extension. Check context.etc.'
        )
      } else if (PixelFormat.isETC1Format(internalFormat) && !context.etc1) {
        throw new Error(
          'When options.pixelFormat is ETC1 compressed, this WebGL implementation must support the WEBGL_compressed_texture_etc1 extension. Check context.etc1.'
        )
      } else if (PixelFormat.isBC7Format(internalFormat) && !context.bc7) {
        throw new Error(
          'When options.pixelFormat is BC7 compressed, this WebGL implementation must support the EXT_texture_compression_bptc extension. Check context.bc7.'
        )
      }

      if (
        PixelFormat.compressedTextureSizeInBytes(
          internalFormat,
          width,
          height
        ) !== source.arrayBufferView.byteLength
      ) {
        throw new Error(
          'The byte length of the array buffer is invalid for the compressed texture with the given width and height.'
        )
      }

      const gl = context.gl

      const sizeInBytes = isCompressed
        ? PixelFormat.compressedTextureSizeInBytes(pixelFormat, width, height)
        : PixelFormat.textureSizeInBytes(
            pixelFormat,
            pixelDatatype,
            width,
            height
          )

      this._id = options.id || createGuid()
      this._context = context
      this._textureFilterAnisotropic = context.textureFilterAnisotropic
      this._textureTarget = gl.TEXTURE_2D
      this._texture = gl.createTexture()
      this._internalFormat = internalFormat
      this._pixelFormat = pixelFormat
      this._pixelDatatype = pixelDatatype
      this._width = width
      this._height = height
      this._dimensions = new Cartesian2(width, height)
      this._hasMipmap = false
      this._sizeInBytes = sizeInBytes
      this._preMultiplyAlpha = preMultiplyAlpha
      this._flipY = flipY
      this._initialized = false
      this._sampler = undefined

      this._sampler = sampler
      this._setupSampler(this, sampler)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(this._textureTarget, this._texture)

      if (Defined(source)) {
        if (skipColorSpaceConversion) {
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
        } else {
          gl.pixelStorei(
            gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
            gl.BROWSER_DEFAULT_WEBGL
          )
        }

        if (Defined(source.arrayBufferView)) {
          const isCompressed = PixelFormat.isCompressedFormat(internalFormat)
          if (isCompressed) {
            this._loadCompressedBufferSource(source)
          } else {
            this._loadBufferSource(source)
          }
        } else if (Defined(source.framebuffer)) {
          this._loadFramebufferSource(source)
        } else {
          this._loadImageSource(source)
        }

        this._initialized = true
      } else {
        this._loadNull()
      }

      gl.bindTexture(this._textureTarget, null)
    }
  }

  private _setupSampler(texture: Texture, sampler: Sampler) {
    let { minificationFilter, magnificationFilter } = sampler

    const mipmap = (
      [
        TextureMinificationFilter.NEAREST_MIPMAP_NEAREST,
        TextureMinificationFilter.LINEAR_MIPMAP_NEAREST,
        TextureMinificationFilter.NEAREST_MIPMAP_LINEAR,
        TextureMinificationFilter.LINEAR_MIPMAP_LINEAR
      ] as number[]
    ).includes(minificationFilter)

    const context = texture._context
    const pixelFormat = texture._pixelFormat
    const pixelDatatype = texture._pixelDatatype

    // float textures only support nearest filtering unless the linear extensions are supported
    if (
      (pixelDatatype === PixelDatatype.FLOAT && !context.textureFloatLinear) ||
      (pixelDatatype === PixelDatatype.HALF_FLOAT &&
        !context.textureHalfFloatLinear)
    ) {
      // override the sampler's settings
      minificationFilter = mipmap
        ? TextureMinificationFilter.NEAREST_MIPMAP_NEAREST
        : TextureMinificationFilter.NEAREST
      magnificationFilter = TextureMagnificationFilter.NEAREST
    }

    // WebGL 2 depth texture only support nearest filtering. See section 3.8.13 OpenGL ES 3 spec
    if (context.isSuppotedwebgl2) {
      if (PixelFormat.isDepthFormat(pixelFormat)) {
        minificationFilter = TextureMinificationFilter.NEAREST
        magnificationFilter = TextureMagnificationFilter.NEAREST
      }
    }

    const gl = context.gl
    const target = texture._textureTarget

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(target, texture._texture)
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minificationFilter)
    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, magnificationFilter)
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, sampler.wrapS)
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, sampler.wrapT)
    if (Defined(texture._textureFilterAnisotropic)) {
      gl.texParameteri(
        target,
        texture._textureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
        sampler.maximumAnisotropy
      )
    }

    gl.bindTexture(target, null)
  }

  private _loadCompressedBufferSource(source: SourceType) {
    const context = this._context
    const gl = context.gl

    const textureTartet = this._textureTarget
    const internalFormat = this._internalFormat

    const { width, height } = this

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

    gl.compressedTexImage2D(
      textureTartet,
      0,
      internalFormat,
      width,
      height,
      0,
      source.arrayBufferView!
    )

    if (Defined(source.mipLevels)) {
      let mipWidth = width
      let mipHeight = height
      for (let i = 0; i < source.mipLevels.length; i++) {
        mipWidth = this._nextMipSize(mipWidth)
        mipHeight = this._nextMipSize(mipHeight)
        gl.compressedTexImage2D(
          textureTartet,
          i + 1,
          internalFormat,
          mipWidth,
          mipHeight,
          0,
          source.mipLevels[i]
        )
      }
    }
  }
  private _loadBufferSource(source: SourceType) {
    const context = this._context
    const gl = context.gl

    const {
      textureTarget,
      internalFormat,
      width,
      height,
      pixelFormat,
      pixelDatatype,
      flipY
    } = this

    const unpackAlignment = PixelFormat.alignmentInBytes(
      pixelFormat,
      pixelDatatype,
      width
    )
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

    let { arrayBufferView } = source
    if (flipY) {
      arrayBufferView = PixelFormat.flipY(
        arrayBufferView!,
        pixelFormat,
        pixelDatatype,
        width,
        height
      ) as Uint8Array
    }

    gl.texImage2D(
      textureTarget,
      0,
      internalFormat,
      width,
      height,
      0,
      pixelFormat,
      PixelDatatype.toWebGLConstant(pixelDatatype, context)!,
      arrayBufferView!
    )
    if (Defined(source.mipLevels)) {
      let mipWidth = width
      let mipHeight = height
      for (let i = 0; i < source.mipLevels.length; ++i) {
        mipWidth = this._nextMipSize(mipWidth)
        mipHeight = this._nextMipSize(mipHeight)
        gl.texImage2D(
          textureTarget,
          i + 1,
          internalFormat,
          mipWidth,
          mipHeight,
          0,
          pixelFormat,
          PixelDatatype.toWebGLConstant(pixelDatatype, context)!,
          source.mipLevels[i]
        )
      }
    }
  }
  private _loadFramebufferSource(source: SourceType) {
    const context = this._context
    const gl = context.gl

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

    if (source.framebuffer !== context.defaultFramebuffer) {
      source.framebuffer!.bind()
    }
    gl.copyTexImage2D(
      this._textureTarget,
      0,
      this._internalFormat,
      source.xOffset!,
      source.yOffset!,
      this.width,
      this.height,
      0
    )
    if (source.framebuffer !== context.defaultFramebuffer) {
      source.framebuffer!.unBind()
    }
  }
  private _loadImageSource(source: SourceType) {
    const context = this._context
    const gl = context.gl
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.preMultiplyAlpha)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY)

    gl.texImage2D(
      this._textureTarget,
      0,
      this._internalFormat,
      this.pixelFormat,
      PixelDatatype.toWebGLConstant(this.pixelDatatype, context)!,
      source.image!
    )
  }
  private _loadNull() {
    const context = this._context
    const gl = context.gl
    gl.texImage2D(
      this._textureTarget,
      0,
      this._internalFormat,
      this.width,
      this.height,
      0,
      this.pixelFormat,
      PixelDatatype.toWebGLConstant(this.pixelDatatype, context)!,
      null
    )
  }

  private _nextMipSize(currentSize: number) {
    const nextSize = Math.floor(currentSize / 2) | 0
    return Math.max(1, nextSize)
  }
}
