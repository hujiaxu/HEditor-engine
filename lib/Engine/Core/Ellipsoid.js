import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import { defined } from './Defined';
import HEditorMath from './Math';
import scaleToGeodeticSurface from './ScaletoGeodeticSurface';
const cartesianToCartographicP = new Cartesian3();
const cartesianToCartographicN = new Cartesian3();
const cartesianToCartographicH = new Cartesian3();
const cartographicToCartesianNormal = new Cartesian3();
const cartographicToCartesianK = new Cartesian3();
/*
  A quadratic surface defined in Cartesian coordinates by the equation (x / a)² + (y / b)² + (z / c)² = 1

*/
export default class Ellipsoid {
    x;
    y;
    z;
    _radii = new Cartesian3();
    _radiiSquared = new Cartesian3();
    _radiiToTheFourth = new Cartesian3();
    _oneOverRadii = new Cartesian3();
    _oneOverRadiiSquared = new Cartesian3();
    _minimumRadius = 0;
    _maximumRadius = 0;
    _centerToleranceSquared = 0;
    _squaredXOverSquaredZ = 0;
    static WGS84;
    static UNIT_SPHERE;
    static MOON;
    static default;
    static clone;
    static fromCartesian3;
    get radii() {
        return this._radii;
    }
    get radiiSquared() {
        return this._radiiSquared;
    }
    get radiiToTheFourth() {
        return this._radiiToTheFourth;
    }
    get oneOverRadii() {
        return this._oneOverRadii;
    }
    get oneOverRadiiSquared() {
        return this._oneOverRadiiSquared;
    }
    get minimumRadius() {
        return this._minimumRadius;
    }
    get maximumRadius() {
        return this._maximumRadius;
    }
    get centerToleranceSquared() {
        return this._centerToleranceSquared;
    }
    get squaredXOverSquaredZ() {
        return this._squaredXOverSquaredZ;
    }
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this._initialize(x, y, z);
    }
    reinitialize(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this._initialize(x, y, z);
    }
    _initialize(x, y, z) {
        this._radii = new Cartesian3(x, y, z);
        this._radiiSquared = new Cartesian3(x * x, y * y, z * z);
        this._radiiToTheFourth = new Cartesian3(x * x * x * x, y * y * y * y, z * z * z * z);
        this._oneOverRadii = new Cartesian3(x === 0.0 ? 0.0 : 1.0 / x, y === 0.0 ? 0.0 : 1.0 / y, z === 0.0 ? 0.0 : 1.0 / z);
        this._oneOverRadiiSquared = new Cartesian3(x === 0.0 ? 0.0 : 1.0 / (x * x), y === 0.0 ? 0.0 : 1.0 / (y * y), z === 0.0 ? 0.0 : 1.0 / (z * z));
        this._minimumRadius = Math.min(x, y, z);
        this._maximumRadius = Math.max(x, y, z);
        this._centerToleranceSquared = HEditorMath.EPSILON1;
        if (this._radiiSquared.z !== 0) {
            this._squaredXOverSquaredZ = this._radiiSquared.x / this._radiiSquared.z;
        }
    }
    geodeticSurfaceNormal(cartesian, result) {
        if (!result) {
            result = new Cartesian3();
        }
        if (Cartesian3.equalsEpsilon(cartesian, Cartesian3.ZERO, HEditorMath.EPSILON14)) {
            return new Cartesian3();
        }
        result = Cartesian3.multiplyComponents(cartesian, this._oneOverRadiiSquared, result);
        return Cartesian3.normalize(result, result);
    }
    equals(right) {
        return (this === right ||
            (right instanceof Ellipsoid &&
                Cartesian3.equals(this._radii, right._radii)));
    }
    scaleToGeodeticSurface(cartesian, result) {
        return scaleToGeodeticSurface(cartesian, this._oneOverRadii, this._oneOverRadiiSquared, this._centerToleranceSquared, result);
    }
    cartesianToCartographic(cartesian, result = new Cartographic()) {
        // p is a Cartesian on the surface, and same longitude and latitude with cartesian
        const p = this.scaleToGeodeticSurface(cartesian, cartesianToCartographicP);
        if (!defined(p)) {
            return new Cartographic();
        }
        const n = this.geodeticSurfaceNormal(p, cartesianToCartographicN);
        if (!defined(n)) {
            return new Cartographic();
        }
        const h = Cartesian3.subtract(cartesian, p, cartesianToCartographicH);
        /*
          Longitude: is the angle between the projection of the point on the XY plane and the X axis.
          Latitude: is the angle of point with respect to the equator(this XY plane)
        */
        const longitude = Math.atan2(n.y, n.x);
        const latitude = Math.asin(n.z);
        const height = HEditorMath.sign(Cartesian3.dot(h, cartesian)) * Cartesian3.magnitude(h);
        result.longitude = longitude;
        result.latitude = latitude;
        result.height = height;
        return result;
    }
    geodeticSurfaceNormalCartogrphic(cartographic, result) {
        const longitude = cartographic.longitude;
        const latitude = cartographic.latitude;
        const cosLatitude = Math.cos(latitude);
        // n = [cos(longitude) * cos(latitude), cos(latitude) * sin(longitude), sin(latitude)]
        const x = cosLatitude * Math.cos(longitude);
        const y = cosLatitude * Math.sin(longitude);
        const z = Math.sin(latitude);
        if (!result) {
            result = new Cartesian3();
        }
        result.x = x;
        result.y = y;
        result.z = z;
        return result;
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
    cartographicToCartesian(cartographic, result) {
        const n = cartographicToCartesianNormal;
        const k = cartographicToCartesianK;
        // 单位球该经纬度的法向量
        this.geodeticSurfaceNormalCartogrphic(cartographic, n);
        Cartesian3.multiplyComponents(this._radiiSquared, n, k);
        const gamma = Math.sqrt(Cartesian3.dot(n, k));
        Cartesian3.divideByScalar(k, gamma, k);
        Cartesian3.multiplyByScalar(n, cartographic.height, n);
        if (!defined(result)) {
            result = new Cartesian3();
        }
        return Cartesian3.add(k, n, result);
    }
    transformPositionToScaledSpace(position, result) {
        if (!defined(result)) {
            result = new Cartesian3();
        }
        Cartesian3.multiplyComponents(position, this.oneOverRadii, result);
        return result;
    }
}
Ellipsoid.clone = function (ellipsoid, result) {
    if (!result) {
        result = new Ellipsoid();
    }
    result.reinitialize(ellipsoid.x, ellipsoid.y, ellipsoid.z);
    return result;
};
Ellipsoid.WGS84 = new Ellipsoid(6378137.0, 6378137.0, 6356752.3);
Ellipsoid.default = Ellipsoid.clone(Ellipsoid.WGS84);
Ellipsoid.UNIT_SPHERE = new Ellipsoid(1.0, 1.0, 1.0);
Ellipsoid.MOON = new Ellipsoid(HEditorMath.LUNAR_RADIUS, HEditorMath.LUNAR_RADIUS, HEditorMath.LUNAR_RADIUS);
Ellipsoid.fromCartesian3 = function (cartesian, result) {
    if (!result) {
        result = new Ellipsoid();
    }
    if (!defined(cartesian)) {
        return result;
    }
    result.reinitialize(cartesian.x, cartesian.y, cartesian.z);
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWxsaXBzb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL0VsbGlwc29pZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUE7QUFDekMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNuQyxPQUFPLFdBQVcsTUFBTSxRQUFRLENBQUE7QUFDaEMsT0FBTyxzQkFBc0IsTUFBTSwwQkFBMEIsQ0FBQTtBQUU3RCxNQUFNLHdCQUF3QixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7QUFDakQsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0FBQ2pELE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtBQUVqRCxNQUFNLDZCQUE2QixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7QUFDdEQsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0FBRWpEOzs7RUFHRTtBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBUztJQUM1QixDQUFDLENBQVE7SUFDVCxDQUFDLENBQVE7SUFDVCxDQUFDLENBQVE7SUFDRCxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUN6QixhQUFhLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUNoQyxpQkFBaUIsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBQ3BDLGFBQWEsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBQ2hDLG9CQUFvQixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7SUFDdkMsY0FBYyxHQUFHLENBQUMsQ0FBQTtJQUNsQixjQUFjLEdBQUcsQ0FBQyxDQUFBO0lBQ2xCLHVCQUF1QixHQUFHLENBQUMsQ0FBQTtJQUMzQixxQkFBcUIsR0FBRyxDQUFDLENBQUE7SUFDakMsTUFB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