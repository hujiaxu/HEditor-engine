import Cartesian3 from './Cartesian3'
import Cartographic from './Cartographic'
import { defined } from './Defined'
import HEditorMath from './Math'
import scaleToGeodeticSurface from './ScaletoGeodeticSurface'

const cartesianToCartographicP = new Cartesian3()
const cartesianToCartographicN = new Cartesian3()
const cartesianToCartographicH = new Cartesian3()

const cartographicToCartesianNormal = new Cartesian3()
const cartographicToCartesianK = new Cartesian3()

/*
  A quadratic surface defined in Cartesian coordinates by the equation (x / a)² + (y / b)² + (z / c)² = 1

*/

export default class Ellipsoid {
  x: number
  y: number
  z: number
  private _radii = new Cartesian3()
  private _radiiSquared = new Cartesian3()
  private _radiiToTheFourth = new Cartesian3()
  private _oneOverRadii = new Cartesian3()
  private _oneOverRadiiSquared = new Cartesian3()
  private _minimumRadius = 0
  private _maximumRadius = 0
  private _centerToleranceSquared = 0
  private _squaredXOverSquaredZ = 0
  static WGS84: Ellipsoid
  static UNIT_SPHERE: Ellipsoid
  static MOON: Ellipsoid
  static default: Ellipsoid
  static clone: (ellipsoid: Ellipsoid, result?: Ellipsoid) => Ellipsoid
  static fromCartesian3: (
    cartesian: Cartesian3,
    result?: Ellipsoid
  ) => Ellipsoid

  get radii() {
    return this._radii
  }
  get radiiSquared() {
    return this._radiiSquared
  }
  get radiiToTheFourth() {
    return this._radiiToTheFourth
  }
  get oneOverRadii() {
    return this._oneOverRadii
  }
  get oneOverRadiiSquared() {
    return this._oneOverRadiiSquared
  }
  get minimumRadius() {
    return this._minimumRadius
  }
  get maximumRadius() {
    return this._maximumRadius
  }
  get centerToleranceSquared() {
    return this._centerToleranceSquared
  }
  get squaredXOverSquaredZ() {
    return this._squaredXOverSquaredZ
  }
  constructor(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
    this.x = x
    this.y = y
    this.z = z
    this._initialize(x, y, z)
  }
  reinitialize(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
    this._initialize(x, y, z)
  }

  private _initialize(x: number, y: number, z: number) {
    this._radii = new Cartesian3(x, y, z)
    this._radiiSquared = new Cartesian3(x * x, y * y, z * z)
    this._radiiToTheFourth = new Cartesian3(
      x * x * x * x,
      y * y * y * y,
      z * z * z * z
    )
    this._oneOverRadii = new Cartesian3(
      x === 0.0 ? 0.0 : 1.0 / x,
      y === 0.0 ? 0.0 : 1.0 / y,
      z === 0.0 ? 0.0 : 1.0 / z
    )
    this._oneOverRadiiSquared = new Cartesian3(
      x === 0.0 ? 0.0 : 1.0 / (x * x),
      y === 0.0 ? 0.0 : 1.0 / (y * y),
      z === 0.0 ? 0.0 : 1.0 / (z * z)
    )
    this._minimumRadius = Math.min(x, y, z)
    this._maximumRadius = Math.max(x, y, z)
    this._centerToleranceSquared = HEditorMath.EPSILON1

    if (this._radiiSquared.z !== 0) {
      this._squaredXOverSquaredZ = this._radiiSquared.x / this._radiiSquared.z
    }
  }

  public geodeticSurfaceNormal(cartesian: Cartesian3, result?: Cartesian3) {
    if (!result) {
      result = new Cartesian3()
    }

    if (
      Cartesian3.equalsEpsilon(
        cartesian,
        Cartesian3.ZERO,
        HEditorMath.EPSILON14
      )
    ) {
      return new Cartesian3()
    }

    result = Cartesian3.multiplyComponents(
      cartesian,
      this._oneOverRadiiSquared,
      result
    )

    return Cartesian3.normalize(result, result)
  }

  public equals(right: Ellipsoid) {
    return (
      this === right ||
      (right instanceof Ellipsoid &&
        Cartesian3.equals(this._radii, right._radii))
    )
  }

  public scaleToGeodeticSurface(cartesian: Cartesian3, result?: Cartesian3) {
    return scaleToGeodeticSurface(
      cartesian,
      this._oneOverRadii,
      this._oneOverRadiiSquared,
      this._centerToleranceSquared,
      result
    )
  }

  public cartesianToCartographic(
    cartesian: Cartesian3,
    result: Cartographic = new Cartographic()
  ) {
    // p is a Cartesian on the surface, and same longitude and latitude with cartesian
    const p = this.scaleToGeodeticSurface(cartesian, cartesianToCartographicP)
    if (!defined(p)) {
      return new Cartographic()
    }

    const n = this.geodeticSurfaceNormal(p, cartesianToCartographicN)
    if (!defined(n)) {
      return new Cartographic()
    }
    const h = Cartesian3.subtract(cartesian, p, cartesianToCartographicH)

    /*
      Longitude: is the angle between the projection of the point on the XY plane and the X axis.
      Latitude: is the angle of point with respect to the equator(this XY plane)
    */
    const longitude = Math.atan2(n.y, n.x)
    const latitude = Math.asin(n.z)
    const height =
      HEditorMath.sign(Cartesian3.dot(h, cartesian)) * Cartesian3.magnitude(h)

    result.longitude = longitude
    result.latitude = latitude
    result.height = height
    return result
  }

  public geodeticSurfaceNormalCartogrphic(
    cartographic: Cartographic,
    result?: Cartesian3
  ) {
    const longitude = cartographic.longitude
    const latitude = cartographic.latitude
    const cosLatitude = Math.cos(latitude)

    // n = [cos(longitude) * cos(latitude), cos(latitude) * sin(longitude), sin(latitude)]
    const x = cosLatitude * Math.cos(longitude)
    const y = cosLatitude * Math.sin(longitude)
    const z = Math.sin(latitude)

    if (!result) {
      result = new Cartesian3()
    }

    result.x = x
    result.y = y
    result.z = z
    return result
  }

  /*
    cartographic: [longitude, latitude, height]
    cartesian: [x, y, z]

    x = (N + h) * cos(longitude) * cos(latitude) = N * cos(logitude) * cos(latitude) + h * cos(longitude) * cos(latitude) = k.x + n.x
    y = (N + h) * cos(latitude) * sin(longitude) = N * cos(latitude) * sin(longitude) + h * cos(latitude) * sin(longitude) = k.y + n.y
    z = (N * (1 - e^2) + h) * sin(latitude) = N * (1 - e^2) * sin(latitude) + h * sin(latitude) = k.z + n.z

    k = [N * n.x, N * n.y, N * (1 - e^2) * n.z]

    这里和经典椭圆公式算的不一样: N = 1 / gamma = 1 / sqrt(n.x * n.x * a^2 + n.y * n.y * b^2 + n.z * n.z * c^2) = 1 / sqrt(n.x^2 * a^2 + n.y^2 * b^2 + n.z^2 * c^2)

    假设存在一点 k 存在, 且 k = [n.x * a^2, n.y * b^2, n.z * c^2]
    那么必存在一个值 gamma 使得 (n.x * a^2 / (gamma * a))^2 + (n.y * b^2 / (gamma * b))^2 + (n.z * c^2 / (gamma * c))^2 = 1 等式成立

    那么
    (n.x * a^2 / (gamma * a))^2 + (n.y * b^2 / (gamma * b))^2 + (n.z * c^2 / (gamma * c))^2 = 1
    n.x^2 * a^2 / gamma^2 + n.y^2 * b^2 / gamma^2 + n.z^2 * c^2 / gamma^2 = 1
    (n.x * a)^2 / gamma^2 + (n.y * b)^2 / gamma^2 + (n.z * c)^2 / gamma^2 = 1
    n.x^2 * a^2 + n.y^2 * b^2 + n.z^2 * c^2 = gamma^2
    
    gamma = sqrt(n.x * n.x * a^2 + n.y * n.y * b^2 + n.z * n.z * c^2)
    所以
    k' = [n.x * a^2 / gamma, n.y * b^2 / gamma, n.z * c^2 / gamma] 在椭球表面
    (k'.x / a)^2 + (k'.y / b)^2 + (k'.z / c)^2 = 1

    经典椭球公式: N = a / sqrt(1 - e^2 * sin^2(latitude))
  */
  public cartographicToCartesian(
    cartographic: Cartographic,
    result?: Cartesian3
  ) {
    const n = cartographicToCartesianNormal
    const k = cartographicToCartesianK

    // 单位球该经纬度的法向量
    this.geodeticSurfaceNormalCartogrphic(cartographic, n)
    Cartesian3.multiplyComponents(this._radiiSquared, n, k)
    const gamma = Math.sqrt(Cartesian3.dot(n, k))
    Cartesian3.divideByScalar(k, gamma, k)
    Cartesian3.multiplyByScalar(n, cartographic.height, n)

    if (!defined(result)) {
      result = new Cartesian3()
    }

    return Cartesian3.add(k, n, result)
  }

  public transformPositionToScaledSpace(
    position: Cartesian3,
    result?: Cartesian3
  ) {
    if (!defined(result)) {
      result = new Cartesian3()
    }
    Cartesian3.multiplyComponents(position, this.oneOverRadii, result)

    return result
  }
}

Ellipsoid.clone = function (ellipsoid: Ellipsoid, result?: Ellipsoid) {
  if (!result) {
    result = new Ellipsoid()
  }
  result.reinitialize(ellipsoid.x, ellipsoid.y, ellipsoid.z)
  return result
}
Ellipsoid.WGS84 = new Ellipsoid(6378137.0, 6378137.0, 6356752.3)
Ellipsoid.default = Ellipsoid.clone(Ellipsoid.WGS84)
Ellipsoid.UNIT_SPHERE = new Ellipsoid(1.0, 1.0, 1.0)
Ellipsoid.MOON = new Ellipsoid(
  HEditorMath.LUNAR_RADIUS,
  HEditorMath.LUNAR_RADIUS,
  HEditorMath.LUNAR_RADIUS
)
Ellipsoid.fromCartesian3 = function (
  cartesian: Cartesian3,
  result?: Ellipsoid
) {
  if (!result) {
    result = new Ellipsoid()
  }
  if (!defined(cartesian)) {
    return result
  }
  result.reinitialize(cartesian.x, cartesian.y, cartesian.z)
  return result
}
