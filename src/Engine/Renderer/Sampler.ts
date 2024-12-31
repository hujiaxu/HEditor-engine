import { SamplerOptions } from '../../type'
import TextureMagnificationFilter from './TextureMagnificationFilter'
import TextureMinificationFilter from './TextureMinificationFilter'
import TextureWrap from './TextureWrap'

export default class Sampler {
  private _wrapS: number
  private _wrapT: number
  private _minificationFilter: number
  private _magnificationFilter: number
  private _maximumAnisotropy: number
  static NEAREST: Sampler

  get wrapS() {
    return this._wrapS
  }

  get wrapT() {
    return this._wrapT
  }

  get minificationFilter() {
    return this._minificationFilter
  }

  get magnificationFilter() {
    return this._magnificationFilter
  }

  get maximumAnisotropy() {
    return this._maximumAnisotropy
  }

  constructor(options?: SamplerOptions) {
    const {
      wrapS = TextureWrap.CLAMP_TO_EDGE,
      wrapT = TextureWrap.CLAMP_TO_EDGE,
      minificationFilter = TextureMinificationFilter.LINEAR,
      magnificationFilter = TextureMagnificationFilter.LINEAR,
      maximumAnisotropy = 1.0
    } = options || {}

    if (!TextureWrap.validate(wrapS)) {
      throw new Error('Invalid sampler.wrapS.')
    }

    if (!TextureWrap.validate(wrapT)) {
      throw new Error('Invalid sampler.wrapT.')
    }

    if (!TextureMinificationFilter.validate(minificationFilter)) {
      throw new Error('Invalid sampler.minificationFilter.')
    }

    if (!TextureMagnificationFilter.validate(magnificationFilter)) {
      throw new Error('Invalid sampler.magnificationFilter.')
    }

    this._wrapS = wrapS
    this._wrapT = wrapT
    this._minificationFilter = minificationFilter
    this._magnificationFilter = magnificationFilter
    this._maximumAnisotropy = maximumAnisotropy
  }
}

Sampler.NEAREST = new Sampler({
  wrapS: TextureWrap.CLAMP_TO_EDGE,
  wrapT: TextureWrap.CLAMP_TO_EDGE,
  minificationFilter: TextureMinificationFilter.NEAREST,
  magnificationFilter: TextureMagnificationFilter.NEAREST
})
