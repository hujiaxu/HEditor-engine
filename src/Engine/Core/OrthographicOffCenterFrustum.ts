import { OrthographicOffCenterFrustumOptions } from '../../type'
import Cartesian2 from './Cartesian2'
import { defined } from './Defined'

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

    const frustumWidth = this.right - this.left
    const frustumHeight = this.top - this.bottom
    const pixelWidth = (pixelRatio * frustumWidth) / drawingBufferWidth
    const pixelHeight = (pixelRatio * frustumHeight) / drawingBufferHeight

    result.x = pixelWidth
    result.y = pixelHeight

    return result
  }

  private _update() {}
}
