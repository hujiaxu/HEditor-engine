import Cartesian3 from './Cartesian3'

export default class Plane {
  public normal: Cartesian3
  public distance: number

  constructor(normal: Cartesian3 = Cartesian3.ZERO, distance: number = 0.0) {
    this.normal = Cartesian3.clone(normal)
    this.distance = distance
  }
}
