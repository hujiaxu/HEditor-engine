import defaultValue from '../Core/DefaultValue'
import Ellipsoid from '../Core/Ellipsoid'
import EllipsoidTerrainProvider from '../Core/EllipsoidTerrainProvider'
import Ray from '../Core/Ray'
import Scene from './Scene'

export default class Globe {
  private _ellipsoid: Ellipsoid

  constructor(ellipsoid: Ellipsoid) {
    ellipsoid = defaultValue(ellipsoid, Ellipsoid.default)
    this._ellipsoid = ellipsoid

    const terrainProvider = new EllipsoidTerrainProvider({
      ellipsoid: ellipsoid
    })
  }

  public pickWorldCoordinates(
    ray: Ray,
    scene: Scene,
    cameraUnderground: boolean
  ) {
    return ray.origin
  }
}
