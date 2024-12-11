import defaultValue from '../Core/DefaultValue'
import Ellipsoid from '../Core/Ellipsoid'
import EllipsoidTerrainProvider from '../Core/EllipsoidTerrainProvider'
import Ray from '../Core/Ray'
import Scene from './Scene'

export default class Globe {
  private _ellipsoid: Ellipsoid
  private _terrainProvider: EllipsoidTerrainProvider

  get ellipsoid() {
    return this._ellipsoid
  }
  get terrainProvider() {
    return this._terrainProvider
  }
  constructor(ellipsoid: Ellipsoid) {
    ellipsoid = defaultValue(ellipsoid, Ellipsoid.default)
    this._ellipsoid = ellipsoid

    this._terrainProvider = new EllipsoidTerrainProvider({
      ellipsoid: ellipsoid
    })
  }

  public pickWorldCoordinates(
    ray: Ray,
    scene: Scene,
    cameraUnderground: boolean
  ) {
    if (cameraUnderground) {
      console.log(scene)
    }
    return ray.origin
  }
}
