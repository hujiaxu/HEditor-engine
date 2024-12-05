import HEditorMath from './Math'

export default class Cartesian2 {
  x: number
  y: number
  static lerp: (
    left: Cartesian2,
    right: Cartesian2,
    t: number,
    result?: Cartesian2
  ) => Cartesian2
  static clone: (cartesian: Cartesian2, result?: Cartesian2) => Cartesian2
  static fromElements: (x: number, y: number, result?: Cartesian2) => Cartesian2
  static equals: (left: Cartesian2, right: Cartesian2) => boolean
  static equalsEpsilon: (
    left: Cartesian2,
    right: Cartesian2,
    relativeEpsilon?: number,
    absoluteEpsilon?: number
  ) => boolean
  constructor(x?: number, y?: number) {
    this.x = x || 0.0
    this.y = y || 0.0
  }
}

Cartesian2.lerp = function (
  left: Cartesian2,
  right: Cartesian2,
  t: number,
  result?: Cartesian2
) {
  const x = left.x + (right.x - left.x) * t
  const y = left.y + (right.y - left.y) * t
  if (!result) {
    result = new Cartesian2()
  }
  result.x = x
  result.y = y
  return result
}
Cartesian2.clone = function (cartesian: Cartesian2, result?: Cartesian2) {
  if (!result) {
    return new Cartesian2(cartesian.x, cartesian.y)
  }
  result.x = cartesian.x
  result.y = cartesian.y
  return result
}
Cartesian2.fromElements = function (x: number, y: number, result?: Cartesian2) {
  if (!result) {
    return new Cartesian2(x, y)
  }
  result.x = x
  result.y = y
  return result
}
Cartesian2.equals = function (left: Cartesian2, right: Cartesian2) {
  return left.x === right.x && left.y === right.y
}
Cartesian2.equalsEpsilon = function (
  left: Cartesian2,
  right: Cartesian2,
  relativeEpsilon?: number,
  absoluteEpsilon?: number
) {
  return (
    left === right &&
    HEditorMath.equalsEpsilon(
      left.x,
      right.x,
      relativeEpsilon,
      absoluteEpsilon
    ) &&
    HEditorMath.equalsEpsilon(left.y, right.y, relativeEpsilon, absoluteEpsilon)
  )
}
