import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import { defined } from '../Core/Defined'
import HEditorMath from '../Core/Math'
import Matrix4 from '../Core/Matrix4'
import Ray from '../Core/Ray'
import PerspectiveFrustum from '../Core/PerspectiveFrustum'
import Scene from './Scene'
import OrthographicFrustum from '../Core/OrthographicFrustum'
import OrthographicOffCenterFrustum from '../Core/OrthographicOffCenterFrustum'
import GeographicProjection from '../Core/GeographicProjection'
import Cartographic from '../Core/Cartographic'
import Cartesian4 from '../Core/Cartesian4'
import defaultValue from '../Core/DefaultValue'
import Quaternion from '../Core/Quaternion'
import Matrix3 from '../Core/Matrix3'

export default class Camera {
  public position: Cartesian3 = new Cartesian3(50, 50, 50)
  public direction: Cartesian3 = new Cartesian3(0.0, -1.0, 1.0)
  public up: Cartesian3 = new Cartesian3(0.0, 0.0, 1.0)
  public right: Cartesian3 = new Cartesian3(1.0, 0.0, 0.0)
  public constrainedAxis: Cartesian3 | undefined = undefined

  public positionWC: Cartesian3 = new Cartesian3()
  public directionWC: Cartesian3 = new Cartesian3()
  public upWC: Cartesian3 = new Cartesian3()
  public rightWC: Cartesian3 = new Cartesian3()

  private _positionWC: Cartesian3 = new Cartesian3()
  private _directionWC: Cartesian3 = new Cartesian3()
  private _upWC: Cartesian3 = new Cartesian3()
  private _rightWC: Cartesian3 = new Cartesian3()
  private _position: Cartesian3 = new Cartesian3()
  private _direction: Cartesian3 = new Cartesian3()
  private _up: Cartesian3 = new Cartesian3()
  private _right: Cartesian3 = new Cartesian3()
  private _transform: Matrix4 = new Matrix4()
  private _actualTransform: Matrix4 = new Matrix4()
  private _actualInvTransform: Matrix4 = new Matrix4()
  private _transformChanged = false
  private _modeChanged = false
  private _defaultLookAmount: number = Math.PI / 60.0

  private _viewMatrix: Matrix4 = new Matrix4()

  scene: Scene
  private _projection: GeographicProjection
  private _positionCartographic: Cartographic | undefined

  get viewMatrix() {
    this.updateViewMatrix(this)
    return this._viewMatrix
  }
  get transform() {
    return this._transform
  }

  frustum: PerspectiveFrustum | OrthographicFrustum

  constructor(scene: Scene) {
    this.scene = scene
    this.constrainedAxis = Cartesian3.ZERO

    const aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight
    const fov = HEditorMath.toRadians(60.0)
    const near = 0.1
    const far = 1000
    this.frustum = new PerspectiveFrustum({
      fov,
      aspectRatio,
      near,
      far
    })

    const projection = scene.mapProjection
    this._projection = projection
  }

  private _updateMembers() {
    let position = this.position
    const positionChanged = !Cartesian3.equals(this.position, this._position)
    if (positionChanged) {
      position = Cartesian3.clone(this.position, this._position)
    }
    let direction = this.direction
    const directionChanged = !Cartesian3.equals(this.direction, this._direction)
    if (directionChanged) {
      Cartesian3.normalize(this.direction, this.direction)
      direction = Cartesian3.clone(this.direction, this._direction)
    }
    let up = this.up
    const upChanged = !Cartesian3.equals(this.up, this._up)
    if (upChanged) {
      Cartesian3.normalize(this.up, this.up)
      up = Cartesian3.clone(this.up, this._up)
    }
    let right = this.right
    const rightChanged = !Cartesian3.equals(this.right, this._right)
    if (rightChanged) {
      Cartesian3.normalize(this.right, this.right)
      right = Cartesian3.clone(this.right, this._right)
    }

    const transformChanged = this._transformChanged || this._modeChanged
    this._transformChanged = false
    if (transformChanged) {
      Matrix4.inverseTransformation(this._transform, this._actualInvTransform)

      Matrix4.clone(this._transform, this._actualTransform)

      Matrix4.inverseTransformation(
        this._actualTransform,
        this._actualInvTransform
      )
    }

    const transform = this._actualTransform

    if (positionChanged || transformChanged) {
      this._positionWC = Matrix4.multiplyByPoint(
        transform,
        position,
        this._positionWC
      )

      this._positionCartographic =
        this._projection.ellipsoid.cartesianToCartographic(
          this._positionWC,
          this._positionCartographic
        )
    }

    if (directionChanged || upChanged || rightChanged) {
      const det = Cartesian3.dot(
        direction,
        Cartesian3.cross(up, right, new Cartesian3())
      )
      if (Math.abs(1.0 - det) > HEditorMath.EPSILON2) {
        const invUpMag = 1.0 / Cartesian3.magnitudeSquared(up)
        const scalar = Cartesian3.dot(up, direction) * invUpMag
        const w0 = Cartesian3.multiplyByScalar(direction, scalar)
        up = Cartesian3.normalize(
          Cartesian3.subtract(up, w0, this._up),
          this._up
        )
        Cartesian3.clone(up, this.up)

        right = Cartesian3.cross(direction, up, this._right)
        Cartesian3.clone(right, this.right)
      }
    }

    if (directionChanged || transformChanged) {
      this._directionWC = Matrix4.multiplyByPointAsVector(
        transform,
        direction,
        this._directionWC
      )
      Cartesian3.normalize(this._directionWC, this._directionWC)
    }
    if (upChanged || transformChanged) {
      this._upWC = Matrix4.multiplyByPointAsVector(transform, up, this._upWC)
      Cartesian3.normalize(this._upWC, this._upWC)
    }
    if (rightChanged || transformChanged) {
      this._rightWC = Matrix4.multiplyByPointAsVector(
        transform,
        right,
        this._rightWC
      )
      Cartesian3.normalize(this._rightWC, this._rightWC)
    }

    if (
      positionChanged ||
      directionChanged ||
      upChanged ||
      rightChanged ||
      transformChanged
    ) {
      this.updateViewMatrix(this)
    }
  }
  public updateViewMatrix(camera: Camera) {
    this._viewMatrix = Matrix4.computeView(
      camera.position,
      camera.direction,
      camera.up,
      camera.right
    )
  }

  public getPickRay(windowPos: Cartesian2, result?: Ray) {
    if (!defined(windowPos)) {
      throw new Error('windowPos is required')
    }

    if (!defined(result)) {
      result = new Ray()
    }

    const canvas = this.scene.canvas
    if (canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
      return undefined
    }

    const frustum = this.frustum

    if (
      frustum instanceof PerspectiveFrustum &&
      defined(frustum.aspectRatio) &&
      defined(frustum.fov) &&
      defined(frustum.near)
    ) {
      return this._getPickRayPerspective(this, windowPos, result)
    }

    return this._getPickRayOrthographic(this, windowPos, result)
  }

  private _getPickRayPerspective(
    camera: Camera,
    windowPos: Cartesian2,
    result: Ray
  ) {
    const canvas = camera.scene.canvas
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    const frustum = camera.frustum as PerspectiveFrustum

    const tanPhi = Math.tan(frustum.fovy * 0.5)
    const tanTheta = frustum.aspectRatio * tanPhi
    const near = frustum.near

    const x = (2.0 / width) * windowPos.x - 1.0
    const y = (2.0 / height) * (height - windowPos.y) - 1.0

    const position = camera.positionWC
    Cartesian3.clone(position, result.origin)

    // 这里由于透视投影模拟了 物体远近对视觉的影响, 视场是有限的, 射线从相机位置出发, 并根据深度变化来确定方向

    // 从屏幕坐标映射到三维空间里的点, 投射到近裁剪面与其他的点投射到近裁剪面的点 不是平行的
    // 及屏幕坐标以相机形成的射线 必定与 相机的 近裁剪面形成交点, 这个交点会与相机的视线有左右的偏移
    // 而这个交点与相机的位置形成射线就是最终要的射线
    // nearCenter 可以看作是 屏幕中心 与 相机形成 射线的 交点, 并且以 nearCenter 为基准点
    // xDir 与 yDir 分别是 屏幕坐标 在近裁剪面相对于 nearCenter 的偏移量
    const nearCenter = Cartesian3.multiplyByScalar(camera.directionWC, near)
    Cartesian3.add(position, nearCenter, nearCenter)

    const xDir = Cartesian3.multiplyByScalar(
      camera.rightWC,
      x * near * tanTheta
    )
    const yDir = Cartesian3.multiplyByScalar(camera.upWC, y * near * tanPhi)

    const direction = Cartesian3.add(nearCenter, xDir, result.direction)
    Cartesian3.add(direction, yDir, direction)
    Cartesian3.subtract(direction, position, direction)
    Cartesian3.normalize(direction, direction)

    return result
  }

  private _getPickRayOrthographic(
    camera: Camera,
    windowPos: Cartesian2,
    result: Ray
  ) {
    const canvas = camera.scene.canvas
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    // 这里 正交投影 无需模拟物体远近对视觉的影响,
    // 从屏幕坐标映射到三维空间里的点, 投射到近裁剪面与其他的点投射到近裁剪面的点 是平行的, 且与相机的视线平行
    // 所以只需计算射线的起始点即可
    const frustum = camera.frustum as OrthographicFrustum
    const offCenterFrustum =
      frustum.offCenterFrustum as OrthographicOffCenterFrustum

    let x = (2.0 / width) * windowPos.x - 1.0
    let y = (2.0 / height) * (height - windowPos.y) - 1.0

    x *= (offCenterFrustum.right - offCenterFrustum.left) * 0.5
    y *= (offCenterFrustum.top - offCenterFrustum.bottom) * 0.5

    const origin = result.origin
    Cartesian3.clone(camera.position, origin)

    const xDir = Cartesian3.multiplyByScalar(camera.right, x)
    const yDir = Cartesian3.multiplyByScalar(camera.up, y)

    Cartesian3.add(xDir, origin, origin)
    Cartesian3.add(yDir, origin, origin)

    Cartesian3.clone(camera.directionWC, result.direction)

    return result
  }

  public setTransform(transform: Matrix4) {
    const position = Cartesian3.clone(this.positionWC)
    const up = Cartesian3.clone(this.upWC)
    const direction = Cartesian3.clone(this.directionWC)

    Matrix4.clone(transform, this._transform)
    this._transformChanged = true
    this._updateMembers()

    const inverse = this._actualInvTransform

    Matrix4.multiplyByPoint(inverse, position, this.position)
    Matrix4.multiplyByPointAsVector(inverse, direction, this.direction)
    Matrix4.multiplyByPointAsVector(inverse, up, this.up)
    Cartesian3.cross(this.direction, this.up, this.right)

    this._updateMembers()
  }

  public worldToCameraCoordinatesPoint(
    cartesian: Cartesian3,
    result?: Cartesian3
  ) {
    if (!defined(cartesian)) {
      throw new Error('cartesian is required.')
    }
    if (!defined(result)) {
      result = new Cartesian3()
    }

    this._updateMembers()

    return Matrix4.multiplyByPoint(this._actualInvTransform, cartesian, result)
  }
  public worldToCameraCoordinatesVector(
    cartesian: Cartesian3,
    result?: Cartesian3
  ) {
    if (!defined(cartesian)) {
      throw new Error('cartesian is required.')
    }
    if (!defined(result)) {
      result = new Cartesian3()
    }

    this._updateMembers()

    return Matrix4.multiplyByPointAsVector(
      this._actualInvTransform,
      cartesian,
      result
    )
  }
  public cameraToWorldCoordinates(cartesian: Cartesian4, result?: Cartesian4) {
    if (!defined(cartesian)) {
      throw new Error('cartesian is required.')
    }
    if (!defined(result)) {
      result = new Cartesian4()
    }

    this._updateMembers()

    return Matrix4.multiplyByVector(this._actualTransform, cartesian, result)
  }
  public cameraToWorldCoordinatesPoint(
    cartesian: Cartesian3,
    result?: Cartesian3
  ) {
    if (!defined(cartesian)) {
      throw new Error('cartesian is required.')
    }
    if (!defined(result)) {
      result = new Cartesian3()
    }

    this._updateMembers()
    return Matrix4.multiplyByPoint(this._actualTransform, cartesian, result)
  }
  public cameraToWorldCoordinatesVector(
    cartesian: Cartesian3,
    result?: Cartesian3
  ) {
    if (!defined(cartesian)) {
      throw new Error('cartesian is required.')
    }
    if (!defined(result)) {
      result = new Cartesian3()
    }

    this._updateMembers()

    return Matrix4.multiplyByPointAsVector(
      this._actualTransform,
      cartesian,
      result
    )
  }

  public look(axis: Cartesian3, angle: number) {
    if (!defined(axis)) {
      throw new Error('axis is required.')
    }

    const turnAngle = defaultValue(angle, this._defaultLookAmount)
    const quaternion = Quaternion.fromAxisAngle(axis, -turnAngle)
    const rotation = Matrix3.fromQuaternion(quaternion)

    const direction = this.direction
    const right = this.right
    const up = this.up

    Matrix3.multiplyByVector(rotation, direction, direction)
    Matrix3.multiplyByVector(rotation, up, up)
    Matrix3.multiplyByVector(rotation, right, right)
  }
}
