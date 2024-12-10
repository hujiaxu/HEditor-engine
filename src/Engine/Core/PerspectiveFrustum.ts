import { PerspectiveFrustumOptions } from '../../type'
import Cartesian2 from './Cartesian2'
import PerspectiveOffCenterFrustum from './PerspectiveOffCenterFrustum'

export default class PerspectiveFrustum {
  private _fov: number
  private _fovy: number
  private _aspectRatio: number
  private _near: number
  private _far: number
  private _xOffset: number
  private _yOffset: number

  private _offCenterFrustum!: PerspectiveOffCenterFrustum

  get fov() {
    return this._fov
  }

  get fovy() {
    return this._fovy
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

  get xOffset() {
    return this._xOffset
  }

  get yOffset() {
    return this._yOffset
  }

  get offCenterFrustum() {
    return this._offCenterFrustum
  }

  constructor({
    fov,
    aspectRatio,
    near,
    far,
    xOffset,
    yOffset
  }: PerspectiveFrustumOptions) {
    this._fov = fov
    this._fovy = fov
    this._aspectRatio = aspectRatio
    this._near = near
    this._far = far
    this._xOffset = xOffset || 0
    this._yOffset = yOffset || 0

    const top = Math.tan(this._fov * 0.5)
    const bottom = -top
    const right = this._aspectRatio * top
    const left = -right

    this._offCenterFrustum = new PerspectiveOffCenterFrustum({
      left,
      right,
      top,
      bottom,
      near: this._near,
      far: this._far
    })
  }

  get projectionMatrix() {
    this.update(this)
    return this._offCenterFrustum.projectionMatrix
  }

  public getPixelDimensions(
    drawingBufferWidth: number,
    drawingBufferHeight: number,
    distance: number,
    pixelRatio: number,
    result?: Cartesian2
  ) {
    this.update(this)
    return this._offCenterFrustum.getPixelDimensions(
      drawingBufferWidth,
      drawingBufferHeight,
      distance,
      pixelRatio,
      result
    )
  }

  update(frustum: PerspectiveFrustum) {
    const offCenterFrustum = this._offCenterFrustum

    if (
      frustum._aspectRatio !== this._aspectRatio ||
      frustum._fov !== this._fov ||
      frustum._near !== this._near ||
      frustum._far !== this._far ||
      frustum._xOffset !== this._xOffset ||
      frustum._yOffset !== this._yOffset
    ) {
      if (frustum._fov < 0 || frustum._fov >= Math.PI) {
        throw new Error('fov must be in the range [0, PI)')
      }
      if (frustum._aspectRatio < 0) {
        throw new Error('aspect must be greater than 0')
      }
      if (frustum._near < 0 || frustum._near > frustum._far) {
        throw new Error('near must be in the range [0, far]')
      }

      this._aspectRatio = frustum._aspectRatio
      this._fov = frustum._fov
      this._fovy =
        frustum._aspectRatio <= 1
          ? frustum._fov
          : Math.atan(Math.tan(frustum._fov * 0.5) / frustum._aspectRatio) * 2.0
      this._near = frustum._near
      this._far = frustum._far
      this._xOffset = frustum._xOffset
      this._yOffset = frustum._yOffset

      offCenterFrustum.top = Math.tan(this._fovy * 0.5) * this._near
      offCenterFrustum.bottom = -offCenterFrustum.top
      offCenterFrustum.right = this._aspectRatio * offCenterFrustum.top
      offCenterFrustum.left = -offCenterFrustum.right
      offCenterFrustum.near = this._near
      offCenterFrustum.far = this._far

      offCenterFrustum.right += this._xOffset
      offCenterFrustum.left -= this._xOffset
      offCenterFrustum.top += this._yOffset
      offCenterFrustum.bottom -= this._yOffset
    }
  }
}
