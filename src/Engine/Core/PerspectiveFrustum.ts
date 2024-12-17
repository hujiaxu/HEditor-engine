import { PerspectiveFrustumOptions } from '../../type'
import Cartesian2 from './Cartesian2'
import PerspectiveOffCenterFrustum from './PerspectiveOffCenterFrustum'

export default class PerspectiveFrustum {
  private _fov: number = 0.0
  private _fovy: number = 0.0
  private _aspectRatio: number = 0.0
  private _near: number = 0.0
  private _far: number = 0.0
  private _xOffset: number = 0.0
  private _yOffset: number = 0.0

  private _offCenterFrustum!: PerspectiveOffCenterFrustum

  public fov: number = 0.0
  public fovy: number = 0.0
  public aspectRatio: number = 0.0
  public near: number = 0.0
  public far: number = 0.0
  public xOffset: number = 0.0
  public yOffset: number = 0.0

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
    this.fov = fov
    this.fovy = fov
    this.aspectRatio = aspectRatio
    this.near = near
    this.far = far
    this.xOffset = xOffset || 0
    this.yOffset = yOffset || 0

    this._offCenterFrustum = new PerspectiveOffCenterFrustum({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      near,
      far
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
      frustum.aspectRatio !== this._aspectRatio ||
      frustum.fov !== this._fov ||
      frustum.near !== this._near ||
      frustum.far !== this._far ||
      frustum.xOffset !== this._xOffset ||
      frustum.yOffset !== this._yOffset
    ) {
      if (frustum.fov < 0 || frustum.fov >= Math.PI) {
        throw new Error('fov must be in the range [0, PI)')
      }
      if (frustum.aspectRatio < 0) {
        throw new Error('aspect must be greater than 0')
      }
      if (frustum.near < 0 || frustum.near > frustum.far) {
        throw new Error('near must be in the range [0, far]')
      }

      this._aspectRatio = frustum.aspectRatio
      this._fov = frustum.fov
      this._fovy =
        frustum._aspectRatio <= 1
          ? frustum.fov
          : Math.atan(Math.tan(frustum.fov * 0.5) / frustum.aspectRatio) * 2.0
      this._near = frustum.near
      this._far = frustum.far
      this._xOffset = frustum.xOffset
      this._yOffset = frustum.yOffset

      offCenterFrustum.top = Math.tan(this._fovy * 0.5) * this.near
      offCenterFrustum.bottom = -offCenterFrustum.top
      offCenterFrustum.right = this.aspectRatio * offCenterFrustum.top
      offCenterFrustum.left = -offCenterFrustum.right
      offCenterFrustum.near = this.near
      offCenterFrustum.far = this.far

      offCenterFrustum.right += this.xOffset
      offCenterFrustum.left -= this.xOffset
      offCenterFrustum.top += this.yOffset
      offCenterFrustum.bottom -= this.yOffset
    }
  }
}
