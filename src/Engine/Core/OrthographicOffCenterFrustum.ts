import { OrthographicOffCenterFrustumOptions } from '../../type'
import Cartesian2 from './Cartesian2'
import defined from './Defined'
import Matrix4 from './Matrix4'

export default class OrthographicOffCenterFrustum {
  private _left: number
  private _right: number
  private _bottom: number
  private _top: number
  private _near: number
  private _far: number
  private _projectionMatrix: Matrix4 = new Matrix4()

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
  get projectionMatrix() {
    this._update()
    return this._projectionMatrix
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

  public getPixelDimensions(
    drawingBufferWidth: number,
    drawingBufferHeight: number,
    distance: number,
    pixelRatio: number,
    result?: Cartesian2
  ) {
    this._update()

    if (!defined(drawingBufferHeight) || !defined(drawingBufferWidth)) {
      throw new Error(
        'drawingBufferHeight and drawingBufferWidth are required.'
      )
    }
    if (drawingBufferHeight <= 0) {
      throw new Error(
        'drawingBufferHeight is required to be greater than zero.'
      )
    }
    if (drawingBufferWidth <= 0) {
      throw new Error('drawingBufferWidth is required to be greater than zero.')
    }
    if (!defined(distance)) {
      throw new Error('distance is required.')
    }
    if (!defined(pixelRatio)) {
      throw new Error('pixelRatio is required.')
    }
    if (pixelRatio <= 0) {
      throw new Error('pixelRatio is required to be greater than zero.')
    }
    if (!defined(result)) {
      result = new Cartesian2()
    }

    const frustumWidth = this._right - this._left
    const frustumHeight = this._top - this._bottom
    const pixelWidth = (pixelRatio * frustumWidth) / drawingBufferWidth
    const pixelHeight = (pixelRatio * frustumHeight) / drawingBufferHeight

    result.x = pixelWidth
    result.y = pixelHeight

    return result
  }

  private _update(offCenterFrustum: OrthographicOffCenterFrustum = this) {
    this._left = offCenterFrustum._left
    this._right = offCenterFrustum._right
    this._top = offCenterFrustum._top
    this._bottom = offCenterFrustum._bottom
    this._near = offCenterFrustum._near
    this._far = offCenterFrustum._far
    this._projectionMatrix = Matrix4.computePerspectiveOffCenter(
      this._left,
      this._right,
      this._bottom,
      this._top,
      this._near,
      this._far
    )
  }
}
