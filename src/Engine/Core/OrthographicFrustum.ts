import { OrthographicFrustumOptions } from '../../type'
import defaultValue from './DefaultValue'
import OrthographicOffCenterFrustum from './OrthographicOffCenterFrustum'

export default class OrthographicFrustum {
  private _offCenterFrustum: OrthographicOffCenterFrustum
  private _width: number
  private _aspectRatio: number
  private _near: number
  private _far: number

  get offCenterFrustum() {
    return this._offCenterFrustum
  }
  get width() {
    return this._width
  }
  get aspectRatio() {
    return this._aspectRatio
  }
  get near() {
    return this._near
  }
  get far() {
    return this._far
  }
  constructor({ width, aspectRatio, near, far }: OrthographicFrustumOptions) {
    this._offCenterFrustum = new OrthographicOffCenterFrustum({})

    this._width = width
    this._aspectRatio = aspectRatio
    this._near = defaultValue(near, 0.0)
    this._far = defaultValue(far, 500000000.0)
  }
}
