import { PerspectiveOffCenterFrustumOptions } from '../../type'
import Matrix4 from './Matrix4'

export default class PerspectiveOffCenterFrustum {
  private _left: number
  private _right: number
  private _top: number
  private _bottom: number
  private _near: number
  private _far: number

  private _projectionMatrix: Matrix4

  get projectionMatrix() {
    this.update(this)
    return this._projectionMatrix
  }

  get left() {
    return this._left
  }

  set left(value: number) {
    this._left = value
  }

  get right() {
    return this._right
  }

  set right(value: number) {
    this._right = value
  }
  get top() {
    return this._top
  }

  set top(value: number) {
    this._top = value
  }
  get bottom() {
    return this._bottom
  }

  set bottom(value: number) {
    this._bottom = value
  }
  get near() {
    return this._near
  }

  set near(value: number) {
    this._near = value
  }

  get far() {
    return this._far
  }

  set far(value: number) {
    this._far = value
  }

  constructor({
    left,
    right,
    top,
    bottom,
    near,
    far
  }: PerspectiveOffCenterFrustumOptions) {
    this._left = left
    this._right = right
    this._top = top
    this._bottom = bottom
    this._near = near
    this._far = far

    this._projectionMatrix = Matrix4.computePerspectiveOffCenter(
      this._left,
      this._right,
      this._bottom,
      this._top,
      this._near,
      this._far
    )
  }

  update(offCenterFrustum: PerspectiveOffCenterFrustum) {
    this.left = offCenterFrustum.left
    this.right = offCenterFrustum.right
    this.top = offCenterFrustum.top
    this.bottom = offCenterFrustum.bottom
    this.near = offCenterFrustum.near
    this.far = offCenterFrustum.far
    this._projectionMatrix = Matrix4.computePerspectiveOffCenter(
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far
    )
  }
}
