import { OrthographicOffCenterFrustumOptions } from '../../type'

export default class OrthographicOffCenterFrustum {
  private _left: number
  private _right: number
  private _bottom: number
  private _top: number
  private _near: number
  private _far: number

  get left() {
    return this._left
  }
  get right() {
    return this._right
  }
  get bottom() {
    return this._bottom
  }
  get top() {
    return this._top
  }
  get near() {
    return this._near
  }
  get far() {
    return this._far
  }
  constructor({
    left = 0.0,
    right = 0.0,
    bottom = 0.0,
    top = 0.0,
    near = 0.0,
    far = 0.0
  }: OrthographicOffCenterFrustumOptions) {
    this._left = left
    this._right = right
    this._bottom = bottom
    this._top = top
    this._near = near
    this._far = far
  }
}
