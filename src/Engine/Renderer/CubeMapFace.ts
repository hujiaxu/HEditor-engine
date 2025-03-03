import Context from './Context'
import Texture from './Texture'

export default class CubeMapFace {
  private _context: Context
  private _texture: WebGLTexture
  private _textureTarget: number
  private _targetFace: number
  private _pixelDatatype: number
  private _internalFormat: number
  private _pixelFormat: number
  private _size: number
  private _preMultiplyAlpha: boolean
  private _flipY: boolean
  private _initialized: boolean

  constructor(
    context: Context,
    texture: WebGLTexture,
    textureTarget: number,
    targetFace: number,
    internalFormat: number,
    pixelFormat: number,
    pixelDatatype: number,
    size: number,
    preMultiplyAlpha: boolean,
    flipY: boolean,
    initialized: boolean
  ) {
    this._context = context
    this._texture = texture
    this._textureTarget = textureTarget
    this._targetFace = targetFace
    this._pixelDatatype = pixelDatatype
    this._internalFormat = internalFormat
    this._pixelFormat = pixelFormat
    this._size = size
    this._preMultiplyAlpha = preMultiplyAlpha
    this._flipY = flipY
    this._initialized = initialized
  }
}
