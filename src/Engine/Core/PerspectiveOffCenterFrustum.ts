import { PerspectiveOffCenterFrustumOptions } from '../../type'
import Cartesian2 from './Cartesian2'
import defined from './Defined'
import Matrix4 from './Matrix4'

export default class PerspectiveOffCenterFrustum {
  private _left: number = 0.0
  private _right: number = 0.0
  private _top: number = 0.0
  private _bottom: number = 0.0
  private _near: number = 0.0
  private _far: number = 0.0

  private _projectionMatrix: Matrix4

  get projectionMatrix() {
    this._update(this)
    return this._projectionMatrix
  }

  public left: number = 0.0
  public right: number = 0.0
  public top: number = 0.0
  public bottom: number = 0.0
  public near: number = 0.0
  public far: number = 0.0

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

  public getPixelDimensions(
    drawingBufferWidth: number,
    drawingBufferHeight: number,
    distance: number,
    pixelRatio: number,
    result?: Cartesian2
  ) {
    this._update(this)

    if (!defined(drawingBufferWidth) || !defined(drawingBufferHeight)) {
      throw new Error(
        'drawingBufferWidth and drawingBufferHeight are required.'
      )
    }
    if (drawingBufferHeight <= 0) {
      throw new Error('drawingBufferHeight must be greater than zero.')
    }
    if (drawingBufferWidth <= 0) {
      throw new Error('drawingBufferWidth must be greater than zero.')
    }
    if (!defined(distance)) {
      throw new Error('distance is required.')
    }
    if (!defined(pixelRatio)) {
      throw new Error('pixelRatio is required.')
    }
    if (pixelRatio <= 0) {
      throw new Error('pixelRatio must be greater than zero.')
    }
    if (!defined(result)) {
      result = new Cartesian2()
    }

    // 在近裁剪面上，视野的总高度为 2 * this.top，总宽度为 2 * this.right。
    // 根据透视投影的相似三角形原理，在距离为 distance 处：
    // 实际的半高 = (distance / this.near) * this.top
    // 整个高度 = 2 * (distance / this.near) * this.top
    // 类似地，宽度为：2 * (distance / this.near) * this.right

    // 绘制缓冲区的宽度和高度（drawingBufferWidth 和 drawingBufferHeight）代表了画布上实际的像素总数
    // 当我们计算出目标距离处视野的物理尺寸（例如总高度为 2 * distance * tanTheta）时，这个尺寸是覆盖整个画布的尺寸。
    // 为了知道一个单独像素对应多少物理单位，就需要将总尺寸均分到每一个像素上，也就是除以对应的像素数。

    // 在很多设备（尤其是高分辨率屏幕）上，一个 CSS 像素并不等于一个物理像素。
    // pixelRatio 就是描述这种比例的，比如 pixelRatio 为 2 时，表示一个逻辑像素对应两个物理像素。
    const inverseNear = 1.0 / this.near
    let tanTheta = this.top * inverseNear
    const pixelHeight =
      (2.0 * pixelRatio * distance * tanTheta) / drawingBufferHeight
    tanTheta = this.right * inverseNear
    const pixelWidth =
      (2.0 * pixelRatio * distance * tanTheta) / drawingBufferWidth

    result.x = pixelWidth
    result.y = pixelHeight
    return result
  }

  private _update(offCenterFrustum: PerspectiveOffCenterFrustum) {
    this._left = offCenterFrustum.left
    this._right = offCenterFrustum.right
    this._top = offCenterFrustum.top
    this._bottom = offCenterFrustum.bottom
    this._near = offCenterFrustum.near
    this._far = offCenterFrustum.far
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
