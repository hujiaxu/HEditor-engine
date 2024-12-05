import Cartesian3 from './Cartesian3'

export default class Ray {
  origin: Cartesian3
  direction: Cartesian3
  static getPoint: (ray: Ray, t: number, result?: Cartesian3) => Cartesian3
  constructor(
    origin: Cartesian3 = new Cartesian3(),
    direction: Cartesian3 = new Cartesian3()
  ) {
    this.origin = origin
    this.direction = direction
  }
}

Ray.getPoint = function (ray: Ray, t: number, result?: Cartesian3) {
  result = result || new Cartesian3()
  result = Cartesian3.multiplyByScalar(ray.direction, t, result)
  return Cartesian3.add(ray.origin, result, result)
}
