import { OrthographicFrustumOptions } from '../../type'
import Cartesian2 from './Cartesian2'
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
  set width(value: number) {
    this._width = value
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

  public getPixelDimensions(
    drawingBufferWidth: number,
    drawingBufferHeight: number,
    distance: number,
    pixelRatio: number,
    result?: Cartesian2
  ) {
    this._update()
    return this._offCenterFrustum.getPixelDimensions(
      drawingBufferWidth,
      drawingBufferHeight,
      distance,
      pixelRatio,
      result
    )
  }

  private _update() {}
}
