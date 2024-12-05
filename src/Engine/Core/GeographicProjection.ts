import Cartesian3 from './Cartesian3'
import Cartographic from './Cartographic'
import { defined } from './Defined'
import Ellipsoid from './Ellipsoid'

export default class GeographicProjection {
  private _ellipsoid: Ellipsoid
  private _semimajorAxis: number
  private _oneOverSemimajorAxis: number

  get ellipsoid() {
    return this._ellipsoid
  }
  constructor(ellipsoid: Ellipsoid = Ellipsoid.default) {
    this._ellipsoid = ellipsoid
    this._semimajorAxis = ellipsoid.maximumRadius
    this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis
  }

  public project(cartographic: Cartographic, result?: Cartesian3) {
    if (!defined(result)) {
      result = new Cartesian3()
    }

    result.x = cartographic.longitude * this._semimajorAxis
    result.y = cartographic.latitude * this._semimajorAxis
    result.z = cartographic.height
    return result
  }

  public unproject(cartesian: Cartesian3, result?: Cartographic) {
    if (!defined(result)) {
      result = new Cartographic()
    }

    result.longitude = cartesian.x * this._oneOverSemimajorAxis
    result.latitude = cartesian.y * this._oneOverSemimajorAxis
    result.height = cartesian.z
    return result
  }
}
