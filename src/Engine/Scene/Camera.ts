import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import defined from '../Core/Defined'
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
import Ellipsoid from '../Core/Ellipsoid'
import IntersectionTests from '../Core/IntersectionTests'
import {
  CameraViewOptions,
  OrientationDirectionType,
  SceneMode
} from '../../type'
import HeadingPitchRoll from '../Core/HeadingPitchRoll'
import Rectangle from '../Core/Rectangle'
import Transforms from '../Core/Transforms'
import EllipsoidGeodesic from '../Core/EllipsoidGeodesic'

const defaultRF = {
  direction: new Cartesian3(),
  right: new Cartesian3(),
  up: new Cartesian3()
}
export default class Camera {
  public position: Cartesian3 = new Cartesian3(0.0, 0.0, -10)
  public direction: Cartesian3 = new Cartesian3(0.0, 0.0, 0.5)
  public up: Cartesian3 = new Cartesian3(0.0, 0.5, 0.0)
  public right: Cartesian3 = new Cartesian3(0.5, 0.0, 0.0)
  public constrainedAxis: Cartesian3 | undefined

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
  private _transformChanged = false
  private _modeChanged = false
  private _defaultLookAmount: number = Math.PI / 60.0
  private _defaultRotateAmount: number = Math.PI / 3600.0
  private _defaultZoomAmount: number = 100000.0

  private _actualTransform: Matrix4 = Matrix4.clone(Matrix4.IDENTITY)
  private _actualInvTransform: Matrix4 = Matrix4.clone(Matrix4.IDENTITY)
  private _viewMatrix: Matrix4 = Matrix4.clone(Matrix4.IDENTITY)
  private _invViewMatrix: Matrix4 = Matrix4.clone(Matrix4.IDENTITY)

  scene: Scene
  private _projection: GeographicProjection
  private _positionCartographic: Cartographic
  private _maxCoord: Cartesian3
  private _mode: SceneMode
  heading: number = 0.0
  pitch: number = -HEditorMath.PI_OVER_TWO
  roll: number = 0.0
  static DEFAULT_VIEW_RECTANGLE: Rectangle

  get viewMatrix() {
    this._updateMembers()

    return this._viewMatrix
  }
  get transform() {
    return this._transform
  }
  get positionCartographic() {
    this._updateMembers()
    return this._positionCartographic
  }

  frustum: PerspectiveFrustum | OrthographicFrustum

  constructor(scene: Scene) {
    this.scene = scene

    const aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight
    const fov = HEditorMath.toRadians(65.0)
    const near = 0.1
    const far = 10000
    this.frustum = new PerspectiveFrustum({
      fov,
      aspectRatio,
      near,
      far
    })

    const projection = scene.mapProjection
    this._projection = projection

    this.updateViewMatrix(this)
    this._maxCoord = projection.project(
      new Cartographic(Math.PI, HEditorMath.PI_OVER_TWO)
    )!
    this._positionCartographic = new Cartographic()
    this._mode = SceneMode.SCENE3D

    // this._rectangleCameraPosition3D(
    //   Camera.DEFAULT_VIEW_RECTANGLE,
    //   this.position,
    //   true
    // )
  }

  public update(mode: SceneMode) {
    if (this._mode !== mode) {
      this._mode = mode
    }
  }
  private _updateMembers() {
    let position = this._position
    const positionChanged = !Cartesian3.equals(this.position, position)
    if (positionChanged) {
      position = Cartesian3.clone(this.position, this._position)
    }
    let direction = this._direction
    const directionChanged = !Cartesian3.equals(this.direction, direction)
    if (directionChanged) {
      Cartesian3.normalize(this.direction, this.direction)
      direction = Cartesian3.clone(this.direction, this._direction)
    }
    let up = this._up
    const upChanged = !Cartesian3.equals(this.up, up)
    if (upChanged) {
      Cartesian3.normalize(this.up, this.up)
      up = Cartesian3.clone(this.up, this._up)
    }
    let right = this._right
    const rightChanged = !Cartesian3.equals(this.right, right)
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

      this._modeChanged = false
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
  private _calculateOrthographicFrustumWidth() {
    if (!Matrix4.equals(Matrix4.IDENTITY, this.transform)) {
      return Cartesian3.magnitude(this.position)
    }

    const scene = this.scene
    const globe = scene.globe
    console.log('globe: ', globe)
  }
  _adjustOrthographicFrustum(zooming: boolean) {
    if (!(this.frustum instanceof OrthographicFrustum)) return

    if (!zooming && this._positionCartographic.height < 150000.0) {
      return
    }

    this.frustum.width =
      this._calculateOrthographicFrustumWidth() || this.frustum.width
  }
  public updateViewMatrix(camera: Camera) {
    Matrix4.computeView(
      camera._position,
      camera._direction,
      camera._up,
      camera._right,
      this._viewMatrix
    )
    Matrix4.multiply(
      this._viewMatrix,
      this._actualInvTransform,
      this._viewMatrix
    )
    Matrix4.inverseTransformation(this._viewMatrix, this._invViewMatrix)
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
      return new Ray()
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

  public worldToCameraCoordinates(cartesian: Cartesian4, result?: Cartesian4) {
    if (!defined(cartesian)) {
      throw new Error('cartesian is required.')
    }
    if (!defined(result)) {
      result = new Cartesian4()
    }

    this._updateMembers()

    return Matrix4.multiplyByVector(this._actualInvTransform, cartesian, result)
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

  private _pickEllipsoid3D(
    windowPosition: Cartesian2,
    ellipsoid: Ellipsoid,
    result?: Cartesian3
  ) {
    ellipsoid = defaultValue(ellipsoid, Ellipsoid.default)
    const ray = this.getPickRay(windowPosition)
    const intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid)
    if (!defined(intersection)) {
      return undefined
    }

    const t = intersection.start > 0.0 ? intersection.start : intersection.stop

    return Ray.getPoint(ray, t, result)
  }
  public pickEllipsoid(
    windowPosition: Cartesian2,
    ellipsoid: Ellipsoid,
    result?: Cartesian3
  ) {
    if (!defined(windowPosition)) {
      throw new Error('windowPosition is required.')
    }

    const canvas = this.scene.canvas
    if (canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
      return undefined
    }

    ellipsoid = defaultValue(ellipsoid, Ellipsoid.default)

    result = this._pickEllipsoid3D(windowPosition, ellipsoid, result)

    return result
  }
  public setView(options: CameraViewOptions) {
    let orientation = defaultValue(options.orientation, new HeadingPitchRoll())

    const mode = this._mode

    if (mode === SceneMode.MORPHING) {
      return
    }

    if (defined(options.endTransform)) {
      this.setTransform(options.endTransform)
    }

    let convert = defaultValue(options.convert, true)
    let destination = defaultValue(
      options.destination,
      Cartesian3.clone(this.positionWC)
    )
    if (defined(destination) && defined((destination as Rectangle).west)) {
      destination = this.getRectangleCameraCoordinates(
        destination as Rectangle
      ) as Cartesian3

      if (isNaN(destination.x) || isNaN(destination.y)) {
        throw new Error('destination has a NaN component.')
      }
      convert = false
      console.log('convert: ', convert)
    }

    if (defined((orientation as OrientationDirectionType).direction)) {
      orientation = this._directionUpToHeadingPitchRoll(
        destination as Cartesian3,
        orientation as OrientationDirectionType
      ) as HeadingPitchRoll
    }

    const scratchHpr = new HeadingPitchRoll()
    scratchHpr.heading = defaultValue(
      (orientation as HeadingPitchRoll).heading,
      0.0
    )
    scratchHpr.pitch = defaultValue(
      (orientation as HeadingPitchRoll).pitch,
      -HEditorMath.PI_OVER_TWO
    )
    scratchHpr.roll = defaultValue((orientation as HeadingPitchRoll).roll, 0.0)

    if (mode === SceneMode.SCENE3D) {
      this._setView3D(destination as Cartesian3, scratchHpr)
    }
  }

  public getRectangleCameraCoordinates(
    rectangle: Rectangle,
    result: Cartesian3 = new Cartesian3()
  ) {
    if (!defined(rectangle)) {
      throw new Error('rectangle is required.')
    }

    const mode = this._mode

    if (mode === SceneMode.SCENE3D) {
      return this._rectangleCameraPosition3D(rectangle, result)
    }
  }
  private _rectangleCameraPosition3D(
    rectangle: Rectangle,
    result: Cartesian3 = new Cartesian3(),
    updateCamera: boolean = false
  ) {
    const ellipsoid = this._projection.ellipsoid
    const cameraRF = updateCamera ? this : defaultRF

    const north = rectangle.north
    const south = rectangle.south
    let east = rectangle.east
    const west = rectangle.west

    // 处理国际日期限的跨越
    if (west > east) {
      east += HEditorMath.TWO_PI
    }

    // 计算矩形的中心经纬度
    const longitude = (west + east) * 0.5
    let latitude
    if (
      south < -HEditorMath.PI_OVER_TWO + HEditorMath.RADIANS_PER_DEGREE &&
      north > HEditorMath.PI_OVER_TWO - HEditorMath.RADIANS_PER_DEGREE
    ) {
      latitude = 0.0
    } else {
      const northCartographic = new Cartographic()
      northCartographic.longitude = longitude
      northCartographic.latitude = north
      northCartographic.height = 0.0

      const southCartographic = new Cartographic()
      southCartographic.longitude = longitude
      southCartographic.latitude = south
      southCartographic.height = 0.0

      let ellipsoidGeodesic: EllipsoidGeodesic | undefined
      if (
        !defined(ellipsoidGeodesic) ||
        ellipsoidGeodesic.ellipsoid !== ellipsoid
      ) {
        ellipsoidGeodesic = new EllipsoidGeodesic(
          undefined,
          undefined,
          ellipsoid
        )
      }

      ellipsoidGeodesic.setEndPoints(northCartographic, southCartographic)
      latitude = ellipsoidGeodesic.interpolateUsingFraction(0.5).latitude
    }

    // 计算矩形中心点的笛卡尔坐标
    const centerCartographic = new Cartographic()
    centerCartographic.longitude = longitude
    centerCartographic.latitude = latitude
    centerCartographic.height = 0.0
    const center = ellipsoid.cartographicToCartesian(centerCartographic)

    // 计算角点: 计算矩形四个角(东北, 北西, 南东, 南西)的笛卡尔坐标
    const cart = new Cartographic()
    cart.longitude = east
    cart.latitude = north
    const northEast = ellipsoid.cartographicToCartesian(cart)

    cart.longitude = west
    const northWest = ellipsoid.cartographicToCartesian(cart)

    cart.latitude = longitude
    const northCenter = ellipsoid.cartographicToCartesian(cart)

    cart.longitude = south
    const southCenter = ellipsoid.cartographicToCartesian(cart)

    cart.longitude = east
    const southEast = ellipsoid.cartographicToCartesian(cart)

    cart.longitude = west
    const southWest = ellipsoid.cartographicToCartesian(cart)

    Cartesian3.subtract(northWest, center, northWest)
    Cartesian3.subtract(southEast, center, southEast)
    Cartesian3.subtract(northEast, center, northEast)
    Cartesian3.subtract(southWest, center, southWest)
    Cartesian3.subtract(northCenter, center, northCenter)
    Cartesian3.subtract(southCenter, center, southCenter)

    // 计算相机方向, 右向量和上向量
    const direction = ellipsoid.geodeticSurfaceNormal(
      center,
      cameraRF.direction
    )
    Cartesian3.negate(direction, direction)
    const right = Cartesian3.cross(direction, Cartesian3.UNIT_Z, cameraRF.right)
    Cartesian3.normalize(right, right)
    const up = Cartesian3.cross(right, direction, cameraRF.up)

    let d
    if (this.frustum instanceof OrthographicFrustum) {
      // 计算正交视锥体中的相机位置
      const width = Math.max(
        Cartesian3.distance(northWest, southEast),
        Cartesian3.distance(southEast, southWest)
      )
      const height = Math.max(
        Cartesian3.distance(northEast, southEast),
        Cartesian3.distance(northWest, northWest)
      )

      let rightScalar, topScalar
      const offCenterFrustum = this.frustum.offCenterFrustum
      const ratio = offCenterFrustum.right / offCenterFrustum.top
      const heightRatio = height * ratio
      if (width > heightRatio) {
        rightScalar = width
        topScalar = rightScalar / ratio
      } else {
        topScalar = height
        rightScalar = heightRatio
      }

      d = Math.max(rightScalar, topScalar)
    } else {
      // 计算透视视锥体中的相机位置
      const tanPhi = Math.tan(this.frustum.fovy * 0.5)
      const tanTheta = this.frustum.aspectRatio * tanPhi

      d = Math.max(
        this._computeD(direction, up, northWest, tanPhi),
        this._computeD(direction, up, southEast, tanPhi),
        this._computeD(direction, up, northEast, tanPhi),
        this._computeD(direction, up, southWest, tanPhi),
        this._computeD(direction, up, northCenter, tanPhi),
        this._computeD(direction, up, southCenter, tanPhi),
        this._computeD(direction, right, northWest, tanTheta),
        this._computeD(direction, right, southEast, tanTheta),
        this._computeD(direction, right, northEast, tanTheta),
        this._computeD(direction, right, southWest, tanTheta),
        this._computeD(direction, right, northCenter, tanTheta),
        this._computeD(direction, right, southCenter, tanTheta)
      )

      if (south < 0 && north > 0) {
        const equatorCartographic = new Cartographic()
        equatorCartographic.longitude = west
        equatorCartographic.latitude = 0.0
        equatorCartographic.height = 0.0
        let equatorPosition =
          ellipsoid.cartographicToCartesian(equatorCartographic)
        Cartesian3.subtract(equatorPosition, center, equatorPosition)
        d = Math.max(
          d,
          this._computeD(direction, up, equatorPosition, tanPhi),
          this._computeD(direction, right, equatorPosition, tanTheta)
        )

        equatorCartographic.longitude = east
        equatorPosition = ellipsoid.cartographicToCartesian(equatorCartographic)
        Cartesian3.subtract(equatorPosition, center, equatorPosition)
        d = Math.max(
          d,
          this._computeD(direction, up, equatorPosition, tanPhi),
          this._computeD(direction, right, equatorPosition, tanTheta)
        )
      }
    }

    return Cartesian3.add(
      center,
      Cartesian3.multiplyByScalar(direction, -d),
      result
    )
  }

  private _computeD(
    direction: Cartesian3,
    upOrRight: Cartesian3,
    corner: Cartesian3,
    tanThetaOrPhi: number
  ) {
    const opposite = Math.abs(Cartesian3.dot(upOrRight, corner))
    return opposite / tanThetaOrPhi - Cartesian3.dot(direction, corner)
  }
  private _directionUpToHeadingPitchRoll(
    position: Cartesian3,
    orientation: OrientationDirectionType,
    result: HeadingPitchRoll = new HeadingPitchRoll()
  ) {
    const direction = Cartesian3.clone(orientation.direction)
    const up = Cartesian3.clone(orientation.up)

    if (this._mode === SceneMode.SCENE3D) {
      const ellipsoid = this.scene.ellipsoid
      const transform = Transforms.eastNorthUpToFixedFrame(position, ellipsoid)
      const invTransform = Matrix4.inverseTransformation(transform)

      Matrix4.multiplyByPointAsVector(invTransform, direction, direction)
      Matrix4.multiplyByPointAsVector(invTransform, up, up)
    }

    const right = Cartesian3.cross(direction, up)

    result.heading = this._getHeading(direction, up)
    result.pitch = this._getPitch(direction)
    result.roll = this._getRoll(direction, up, right)
    return result
  }
  private _setView3D(position: Cartesian3, hpr: HeadingPitchRoll) {
    if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)) {
      throw new Error('position is required')
    }

    const currentTransform = Matrix4.clone(this.transform)
    const localTransform = Transforms.eastNorthUpToFixedFrame(
      position,
      this._projection.ellipsoid
    )
    this.setTransform(localTransform)

    Cartesian3.clone(Cartesian3.ZERO, this.position)
    hpr.heading = hpr.heading - HEditorMath.PI_OVER_TWO

    const rotQuat = Quaternion.fromHeadingPitchRoll(hpr)
    const rotMat = Matrix3.fromQuaternion(rotQuat)

    Matrix3.getColumn(rotMat, 0, this.direction)
    Matrix3.getColumn(rotMat, 2, this.up)
    Cartesian3.cross(this.direction, this.up, this.right)

    this.setTransform(currentTransform)
    this._adjustOrthographicFrustum(true)
  }

  private _getHeading(direction: Cartesian3, up: Cartesian3) {
    let heading

    if (
      !HEditorMath.equalsEpsilon(
        Math.abs(direction.z),
        1.0,
        HEditorMath.EPSILON3
      )
    ) {
      heading = Math.atan2(direction.y, direction.x) - HEditorMath.PI_OVER_TWO
    } else {
      heading = Math.atan2(up.y, up.x) - HEditorMath.PI_OVER_TWO
    }

    return HEditorMath.TWO_PI - HEditorMath.zeroToTwoPi(heading)
  }
  private _getPitch(direction: Cartesian3) {
    return HEditorMath.PI_OVER_TWO - HEditorMath.acosClamped(direction.z)
  }
  private _getRoll(direction: Cartesian3, up: Cartesian3, right: Cartesian3) {
    let roll = 0.0
    if (
      !HEditorMath.equalsEpsilon(
        Math.abs(direction.z),
        1.0,
        HEditorMath.EPSILON3
      )
    ) {
      roll = Math.atan2(-right.z, up.z)
      roll = HEditorMath.zeroToTwoPi(roll + HEditorMath.TWO_PI)
    }

    return roll
  }
  private _clampMove2D(position: Cartesian3) {
    const maxProjectedX = this._maxCoord.x
    const maxProjectedY = this._maxCoord.y

    const maxX = position.x - maxProjectedX * 2.0
    const minX = position.x + maxProjectedX * 2.0

    if (position.x > maxProjectedX) {
      position.x = maxX
    }
    if (position.x < -maxProjectedX) {
      position.x = minX
    }
    if (position.y > maxProjectedY) {
      position.y = maxProjectedY
    }
    if (position.y < -maxProjectedY) {
      position.y = -maxProjectedY
    }
  }

  public look(axis: Cartesian3, angle?: number) {
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

  public lookDown(amount?: number) {
    amount = defaultValue(amount, this._defaultLookAmount)
    this.look(this.right, amount)
  }
  public lookUp(amount?: number) {
    amount = defaultValue(amount, this._defaultLookAmount)
    this.look(this.right, -amount)
  }
  public lookRight(amount?: number) {
    amount = defaultValue(amount, this._defaultLookAmount)
    this.look(this.up, amount)
  }
  public lookLeft(amount?: number) {
    amount = defaultValue(amount, this._defaultLookAmount)
    this.look(this.up, -amount)
  }

  public move(direction: Cartesian3, amount: number) {
    if (!defined(direction)) {
      throw new Error('direction is required.')
    }

    const cameraPosition = this.position
    const moveScratch = Cartesian3.multiplyByScalar(direction, amount)

    Cartesian3.add(cameraPosition, moveScratch, cameraPosition)

    this._clampMove2D(cameraPosition)
    this._adjustOrthographicFrustum(true)
  }
  public moveForward(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)
    this.move(this.direction, amount)
  }
  public moveBackward(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)
    this.move(this.direction, -amount)
  }
  public moveRight(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)
    this.move(this.right, amount)
  }
  public moveLeft(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)
    this.move(this.right, -amount)
  }
  public moveUp(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)
    this.move(this.up, amount)
  }
  public moveDown(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)
    this.move(this.up, -amount)
  }

  private _rotateVertical(angle: number) {
    const position = this.position

    if (
      defined(this.constrainedAxis) &&
      !Cartesian3.equalsEpsilon(
        this.position,
        Cartesian3.ZERO,
        HEditorMath.EPSILON2
      )
    ) {
      const p = Cartesian3.normalize(position)
      const northParallel = Cartesian3.equalsEpsilon(
        p,
        this.constrainedAxis,
        HEditorMath.EPSILON2
      )
      const southParallel = Cartesian3.equalsEpsilon(
        p,
        Cartesian3.negate(this.constrainedAxis, new Cartesian3()),
        HEditorMath.EPSILON2
      )
      if (!northParallel && !southParallel) {
        const constrainedAxis = Cartesian3.normalize(this.constrainedAxis)

        let dot = Cartesian3.dot(p, constrainedAxis)
        let angleToAxis = HEditorMath.acosClamped(dot)
        if (angle > 0 && angle > angleToAxis) {
          angle = angleToAxis - HEditorMath.EPSILON4
        }

        dot = Cartesian3.dot(
          p,
          Cartesian3.negate(constrainedAxis, new Cartesian3())
        )
        angleToAxis = HEditorMath.acosClamped(dot)
        if (angle < 0 && -angle > angleToAxis) {
          angle = -angleToAxis + HEditorMath.EPSILON4
        }

        const tangent = Cartesian3.cross(constrainedAxis, p, new Cartesian3())
        this.rotate(tangent, angle)
      } else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
        this.rotate(this.right, angle)
      }
    } else {
      this.rotate(this.right, angle)
    }
  }
  private _rotateHorizonTal(angle: number) {
    if (defined(this.constrainedAxis)) {
      this.rotate(this.constrainedAxis, angle)
    } else {
      this.rotate(this.up, angle)
    }
  }
  public rotate(axis: Cartesian3, angle?: number) {
    if (!defined(axis)) {
      throw new Error('axis is required.')
    }

    const turnAngle = defaultValue(angle, this._defaultRotateAmount)
    const quaternion = Quaternion.fromAxisAngle(axis, turnAngle)

    const rotation = Matrix3.fromQuaternion(quaternion)
    Matrix3.multiplyByVector(rotation, this.position, this.position)
    Matrix3.multiplyByVector(rotation, this.direction, this.direction)
    Matrix3.multiplyByVector(rotation, this.up, this.up)
    Cartesian3.cross(this.direction, this.up, this.right)
    Cartesian3.cross(this.right, this.direction, this.up)

    this._adjustOrthographicFrustum(false)
  }
  public rotateDown(angle?: number) {
    angle = defaultValue(angle, this._defaultRotateAmount)

    this._rotateVertical(angle)
  }
  public rotateUp(angle?: number) {
    angle = defaultValue(angle, this._defaultRotateAmount)

    this._rotateVertical(-angle)
  }
  public rotateRight(angle?: number) {
    angle = defaultValue(angle, this._defaultRotateAmount)

    this._rotateHorizonTal(-angle)
  }
  public rotateLeft(angle?: number) {
    angle = defaultValue(angle, this._defaultRotateAmount)
    this._rotateHorizonTal(angle)
  }

  private _zoom3D(amount: number) {
    this.move(this.direction, amount)
  }
  public zoomIn(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)

    this._zoom3D(amount)
  }
  public zoomOut(amount?: number) {
    amount = defaultValue(amount, this._defaultZoomAmount)

    this._zoom3D(-amount)
  }
}
Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(-95.0, -20.0, -70.0, 90.0)
