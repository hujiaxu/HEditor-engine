import Ellipsoid from './Ellipsoid'

export default class EllipsoidTerrainProvider {
  private _ellipsoid: Ellipsoid

  get ellipsoid() {
    return this._ellipsoid
  }
  constructor({ ellipsoid }: { ellipsoid: Ellipsoid }) {
    this._ellipsoid = ellipsoid
  }
}
