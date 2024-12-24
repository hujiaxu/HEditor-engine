import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import defined from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWxsaXBzb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL0VsbGlwc29pZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUE7QUFDekMsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQTtBQUNoQyxPQUFPLHNCQUFzQixNQUFNLDBCQUEwQixDQUFBO0FBRTdELE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLHdCQUF3QixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7QUFDakQsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0FBRWpELE1BQU0sNkJBQTZCLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtBQUN0RCxNQUFNLHdCQUF3QixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7QUFFakQ7OztFQUdFO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBQzVCLENBQUMsQ0FBUTtJQUNULENBQUMsQ0FBUTtJQUNULENBQUMsQ0FBUTtJQUNELE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBQ3pCLGFBQWEsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBQ2hDLGlCQUFpQixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7SUFDcEMsYUFBYSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7SUFDaEMsb0JBQW9CLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUN2QyxjQUFjLEdBQUcsQ0FBQyxDQUFBO0lBQ2xCLGNBQWMsR0FBRyxDQUFDLENBQUE7SUFDbEIsdUJBQXVCLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLHFCQUFxQixHQUFHLENBQUMsQ0FBQTtJQUNqQyxNQUFNLENBQUMsS0FB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