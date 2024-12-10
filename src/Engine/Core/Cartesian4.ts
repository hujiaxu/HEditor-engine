import { defined } from './Defined'

export default class Cartesian4 {
  x: number
  y: number
  z: number
  w: number
  static UNIT_W: Cartesian4
  static clone: (cartesian: Cartesian4, result?: Cartesian4) => Cartesian4
  static fromElements: (
    x: number,
    y: number,
    z: number,
    w: number,
    result?: Cartesian4
  ) => Cartesian4

  constructor(x?: number, y?: number, z?: number, w?: number) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
    this.w = w || 0
  }
}

Cartesian4.UNIT_W = Cartesian4.clone(new Cartesian4(0.0, 0.0, 0.0, 1.0))
Cartesian4.clone = (cartesian: Cartesian4, result?: Cartesian4) => {
  if (!defined(cartesian)) {
    throw new Error('cartesian is required.')
  }
  if (!defined(result)) {
    result = new Cartesian4()
  }
  result.x = cartesian.x
  result.y = cartesian.y
  result.z = cartesian.z
  result.w = cartesian.w
  return result
}
Cartesian4.fromElements = function (
  x: number,
  y: number,
  z: number,
  w: number,
  result?: Cartesian4
) {
  if (!defined(result)) {
    return new Cartesian4(x, y, z, w)
  }
  result.x = x
  result.y = y
  result.z = z
  result.w = w
  return result
}
