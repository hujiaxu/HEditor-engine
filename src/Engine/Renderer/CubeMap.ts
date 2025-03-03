import { CubeFaceNames, CubeMapOptions } from '../../type'
import Check from '../Core/Check'
import Defined from '../Core/Defined'
import DeveloperError from '../Core/DeveloperError'
import ContextLimits from './ContextLimits'
import CubeMapFace from './CubeMapFace'
import PixelDatatype from './PixelDatatype'
import PixelFormat from './PixelFormat'
import Sampler from './Sampler'

/**
 * @typedef CubeMap.BufferSource
 *
 * @property {TypedArray} arrayBufferView A view of a binary data buffer containing pixel values.
 * @property {number} width The width of one face of the cube map, in pixels. Must be equal to height.
 * @property {number} height The height of one face of the cube map, in pixels. Must be equal to width.
 *
 * @private
 */

/**
 * @typedef CubeMap.Source
 *
 * @property {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|CubeMap.BufferSource} positiveX
 * @property {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|CubeMap.BufferSource} negativeX
 * @property {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|CubeMap.BufferSource} positiveY
 * @property {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|CubeMap.BufferSource} negativeY
 * @property {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|CubeMap.BufferSource} positiveZ
 * @property {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|CubeMap.BufferSource} negativeZ
 */

/**
 * @typedef CubeMap.ConstructorOptions
 *
 * @property {Context} context
 * @property {CubeMap.Source} [source] The source for texel values to be loaded into the texture.
 * @property {PixelFormat} [pixelFormat=PixelFormat.RGBA] The format of each pixel, i.e., the number of components it has and what they represent.
 * @property {PixelDatatype} [pixelDatatype=PixelDatatype.UNSIGNED_BYTE] The data type of each pixel.
 * @property {boolean} [flipY=true] If true, the source values will be read as if the y-axis is inverted (y=0 at the top).
 * @property {boolean} [skipColorSpaceConversion=false] If true, color space conversions will be skipped when reading the texel values.
 * @property {Sampler} [sampler] Information about how to sample the cubemap texture.
 * @property {number} [width] The pixel width of the texture. If not supplied, must be available from the source. Must be equal to height.
 * @property {number} [height] The pixel height of the texture. If not supplied, must be available from the source. Must be equal to width.
 * @property {boolean} [preMultiplyAlpha] If true, the alpha channel will be multiplied into the other channels.
 *
 * @private
 */

/**
 * A wrapper for a {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLTexture|WebGLTexture}
 * used as a cube map, to abstract away the verbose GL calls associated with setting up a texture.
 *
 * @alias CubeMap
 * @constructor
 *
 * @param {CubeMap.ConstructorOptions} options An object describing initialization options.
 * @private
 */
export default class CubeMap {
  static readonly FaceName = {
    POSITIVEX: CubeFaceNames.POSITIVEX,
    NEGATIVEX: CubeFaceNames.NEGATIVEX,
    POSITIVEY: CubeFaceNames.POSITIVEY,
    NEGATIVEY: CubeFaceNames.NEGATIVEY,
    POSITIVEZ: CubeFaceNames.POSITIVEZ,
    NEGATIVEZ: CubeFaceNames.NEGATIVEZ
  }
  static faceNames: () => Generator<string, void, unknown>
  _context: import('/Users/hujiaxu/Desktop/cesium-GS/HEditor-engine/src/index').Context
  private _textureFilterAnisotropic: boolean
  private _textureTarget: number
  private _texture: WebGLTexture
  private _pixelFormat: number
  private _pixelDatatype: number
  private _size: number | undefined
  private _hasMipmap: boolean
  private _sizeInBytes: number
  private _preMultiplyAlpha: boolean
  private _flipY: boolean
  private _positiveX: any
  private _negativeX: any
  private _positiveY: any
  private _negativeY: any
  private _positiveZ: any
  private _negativeZ: any
  constructor(options: CubeMapOptions) {
    // >>includeStart('debug', pragmas.debug);
    Check.defined('options.context', options.context)
    // >>includeEnd('debug');

    const {
      context,
      source,
      pixelFormat = PixelFormat.RGBA,
      pixelDatatype = PixelDatatype.UNSIGNED_BYTE,
      flipY = true,
      skipColorSpaceConversion = false,
      sampler = new Sampler()
    } = options

    // Use premultiplied alpha for opaque textures should perform better on Chrome:
    // http://media.tojicode.com/webglCamp4/#20

    const preMultiplyAlpha =
      options.preMultiplyAlpha ||
      pixelFormat === PixelFormat.RGB ||
      pixelFormat === PixelFormat.LUMINANCE

    const { width, height } = options

    if (Defined(source)) {
      // >>includeStart('debug', pragmas.debug);
      if (
        !Object.values(CubeMap.FaceName).every((faceName) =>
          Defined(source[faceName])
        )
      ) {
        throw new DeveloperError(
          `options.source requires faces ${Object.values(CubeMap.FaceName).join(
            ', '
          )}.`
        )
      }
      // >>includeEnd('debug');

      // >>includeStart('debug', pragmas.debug);
      for (const faceName of CubeMap.faceNames()) {
        const face = source[faceName as CubeFaceNames]
        if (Number(face.width) !== width || Number(face.height) !== height) {
          throw new DeveloperError(
            'Each face in options.source must have the same width and height.'
          )
        }
      }
      // >>includeEnd('debug');
    }

    const size = width

    // >>includeStart('debug', pragmas.debug);
    if (!Defined(width) || !Defined(height)) {
      throw new DeveloperError(
        'options requires a source field to create an initialized cube map or width and height fields to create a blank cube map.'
      )
    }

    if (width !== height) {
      throw new DeveloperError('Width must equal height.')
    }

    if (size! <= 0) {
      throw new DeveloperError('Width and height must be greater than zero.')
    }
    if (size! > ContextLimits._maximumCubeMapSize) {
      throw new DeveloperError(
        `Width and height must be less than or equal to the maximum cube map size (${ContextLimits._maximumCubeMapSize}). Check maximumCubeMapSize.`
      )
    }
    if (!PixelFormat.validate(pixelFormat)) {
      throw new DeveloperError('Invalid options.pixelFormat.')
    }
    if (PixelFormat.isDepthFormat(pixelFormat)) {
      throw new DeveloperError(
        'options.pixelFormat cannot be DEPTH_COMPONENT or DEPTH_STENCIL.'
      )
    }
    if (!PixelDatatype.validate(pixelDatatype)) {
      throw new DeveloperError('Invalid options.pixelDatatype.')
    }
    if (
      pixelDatatype === PixelDatatype.FLOAT &&
      !context.floatingPointTexture
    ) {
      throw new DeveloperError(
        'When options.pixelDatatype is FLOAT, this WebGL implementation must support the OES_texture_float extension.'
      )
    }
    if (
      pixelDatatype === PixelDatatype.HALF_FLOAT &&
      !context.halfFloatingPointTexture
    ) {
      throw new DeveloperError(
        'When options.pixelDatatype is HALF_FLOAT, this WebGL implementation must support the OES_texture_half_float extension.'
      )
    }
    // >>includeEnd('debug');

    const sizeInBytes =
      PixelFormat.textureSizeInBytes(pixelFormat, pixelDatatype, size!, size!) *
      6
    const internalFormat = PixelFormat.toInternalFormat(
      pixelFormat,
      pixelDatatype,
      context
    )

    const gl = context.gl
    const textureTarget = gl.TEXTURE_CUBE_MAP
    const texture = gl.createTexture()

    this._context = context
    this._textureFilterAnisotropic = context.textureFilterAnisotropic
    this._textureTarget = textureTarget
    this._texture = texture
    this._pixelFormat = pixelFormat
    this._pixelDatatype = pixelDatatype
    this._size = size
    this._hasMipmap = false
    this._sizeInBytes = sizeInBytes
    this._preMultiplyAlpha = preMultiplyAlpha
    this._flipY = flipY

    const initialized = Defined(source)

    function constructFace(targetFace: any) {
      return new CubeMapFace(
        context,
        texture,
        textureTarget,
        targetFace,
        internalFormat,
        pixelFormat,
        pixelDatatype,
        size!,
        preMultiplyAlpha,
        flipY,
        initialized
      )
    }
    this._positiveX = constructFace(gl.TEXTURE_CUBE_MAP_POSITIVE_X)
    this._negativeX = constructFace(gl.TEXTURE_CUBE_MAP_NEGATIVE_X)
    this._positiveY = constructFace(gl.TEXTURE_CUBE_MAP_POSITIVE_Y)
    this._negativeY = constructFace(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y)
    this._positiveZ = constructFace(gl.TEXTURE_CUBE_MAP_POSITIVE_Z)
    this._negativeZ = constructFace(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z)
  }
}

function* makeFaceNamesIterator() {
  yield CubeMap.FaceName.POSITIVEX
  yield CubeMap.FaceName.NEGATIVEX
  yield CubeMap.FaceName.POSITIVEY
  yield CubeMap.FaceName.NEGATIVEY
  yield CubeMap.FaceName.POSITIVEZ
  yield CubeMap.FaceName.NEGATIVEZ
}

/**
 * Creates an iterator for looping over the cubemap faces.
 * @type {Iterable<CubeMap.FaceName>}
 * @private
 */
CubeMap.faceNames = function () {
  return makeFaceNamesIterator()
}
