export default class Cartesian3 {
  static cross: (
    left: Cartesian3,
    right: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static dot: (left: Cartesian3, right: Cartesian3) => number
  static subtract: (
    left: Cartesian3,
    right: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static add: (
    left: Cartesian3,
    right: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3

  x: number
  y: number
  z: number
  static multiplyByScalar: (
    cartesian: Cartesian3,
    scalar: number,
    result?: Cartesian3
  ) => Cartesian3
  static multiply: (
    left: Cartesian3,
    right: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static clone: (cartesian: Cartesian3) => Cartesian3
  static ZERO: Cartesian3
  static distance: (left: Cartesian3, right: Cartesian3) => number
  static distanceSquared: (left: Cartesian3, right: Cartesian3) => number
  constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
  }
}

Cartesian3.cross = function (
  left: Cartesian3,
  right: Cartesian3,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  const x = left.y * right.z - left.z * right.y
  const y = left.z * right.x - left.x * right.z
  const z = left.x * right.y - left.y * right.x
  result.x = x
  result.y = y
  result.z = z
  return result
}
Cartesian3.dot = function (left: Cartesian3, right: Cartesian3) {
  return left.x * right.x + left.y * right.y + left.z * right.z
}
Cartesian3.subtract = function (
  left: Cartesian3,
  right: Cartesian3,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = left.x - right.x
  result.y = left.y - right.y
  result.z = left.z - right.z
  return result
}
Cartesian3.add = function (
  left: Cartesian3,
  right: Cartesian3,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = left.x + right.x
  result.y = left.y + right.y
  result.z = left.z + right.z
  return result
}
Cartesian3.multiplyByScalar = function (
  cartesian: Cartesian3,
  scalar: number,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = cartesian.x * scalar
  result.y = cartesian.y * scalar
  result.z = cartesian.z * scalar
  return result
}
Cartesian3.multiply = function (
  left: Cartesian3,
  right: Cartesian3,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = left.x * right.x
  result.y = left.y * right.y
  result.z = left.z * right.z
  return result
}

Cartesian3.clone = function (cartesian: Cartesian3) {
  return new Cartesian3(cartesian.x, cartesian.y, cartesian.z)
}
Cartesian3.ZERO = new Cartesian3(0, 0, 0)
Cartesian3.distance = function (left: Cartesian3, right: Cartesian3) {
  return Math.sqrt(Cartesian3.distanceSquared(left, right))
}
Cartesian3.distanceSquared = function (left: Cartesian3, right: Cartesian3) {
  const x = left.x - right.x
  const y = left.y - right.y
  const z = left.z - right.z
  return x * x + y * y + z * z
}
