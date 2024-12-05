import { defined } from './Defined'
import HEditorMath from './Math'

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
  static clone: (cartesian: Cartesian3, result?: Cartesian3) => Cartesian3
  static ZERO: Cartesian3
  static distance: (left: Cartesian3, right: Cartesian3) => number
  static distanceSquared: (left: Cartesian3, right: Cartesian3) => number
  static equals: (left: Cartesian3, right: Cartesian3) => boolean
  static magnitude: (cartesian: Cartesian3) => number
  static normalize: (cartesian: Cartesian3, result?: Cartesian3) => Cartesian3
  static magnitudeSquared: (cartesian: Cartesian3) => number
  static multiplyComponents: (
    left: Cartesian3,
    right: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static equalsEpsilon: (
    left: Cartesian3,
    right: Cartesian3,
    relativeEpsilon: number,
    absoluteEpsilon?: number
  ) => boolean
  static angleBetween: (left: Cartesian3, right: Cartesian3) => number
  static abs: (cartesian: Cartesian3, result?: Cartesian3) => Cartesian3
  static UNIT_X: Cartesian3
  static UNIT_Y: Cartesian3
  static UNIT_Z: Cartesian3
  static mostOrthogonalAxis: (
    cartesian: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static divideByScalar: (
    cartesian: Cartesian3,
    scalar: number,
    result?: Cartesian3
  ) => Cartesian3
  static negate: (cartesian: Cartesian3, result?: Cartesian3) => Cartesian3
  static fromElements: (
    x: number,
    y: number,
    z: number,
    result?: Cartesian3
  ) => Cartesian3
  static unpack: (
    array: number[],
    index: number,
    result?: Cartesian3
  ) => Cartesian3
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

Cartesian3.clone = function (cartesian: Cartesian3, result?: Cartesian3) {
  if (!result) {
    return new Cartesian3(cartesian.x, cartesian.y, cartesian.z)
  }
  result.x = cartesian.x
  result.y = cartesian.y
  result.z = cartesian.z
  return result
}
Cartesian3.ZERO = Cartesian3.clone(new Cartesian3(0, 0, 0))
Cartesian3.UNIT_X = Cartesian3.clone(new Cartesian3(1, 0, 0))
Cartesian3.UNIT_Y = Cartesian3.clone(new Cartesian3(0, 1, 0))
Cartesian3.UNIT_Z = Cartesian3.clone(new Cartesian3(0, 0, 1))
Cartesian3.distance = function (left: Cartesian3, right: Cartesian3) {
  return Math.sqrt(Cartesian3.distanceSquared(left, right))
}
Cartesian3.distanceSquared = function (left: Cartesian3, right: Cartesian3) {
  const x = left.x - right.x
  const y = left.y - right.y
  const z = left.z - right.z
  return x * x + y * y + z * z
}
Cartesian3.equals = function (left: Cartesian3, right: Cartesian3) {
  return left.x === right.x && left.y === right.y && left.z === right.z
}
Cartesian3.magnitude = function (cartesian: Cartesian3) {
  return Math.sqrt(
    cartesian.x * cartesian.x +
      cartesian.y * cartesian.y +
      cartesian.z * cartesian.z
  )
}
Cartesian3.magnitudeSquared = function (cartesian: Cartesian3) {
  return (
    cartesian.x * cartesian.x +
    cartesian.y * cartesian.y +
    cartesian.z * cartesian.z
  )
}
Cartesian3.normalize = function (cartesian: Cartesian3, result?: Cartesian3) {
  if (!result) {
    result = new Cartesian3()
  }
  const magnitude = Cartesian3.magnitude(cartesian)
  result.x = cartesian.x / magnitude
  result.y = cartesian.y / magnitude
  result.z = cartesian.z / magnitude
  return result
}
Cartesian3.multiplyComponents = function (
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
Cartesian3.equalsEpsilon = function (
  left: Cartesian3,
  right: Cartesian3,
  relativeEpsilon: number,
  absoluteEpsilon?: number
) {
  return (
    left === right ||
    (defined(left) &&
      defined(right) &&
      HEditorMath.equalsEpsilon(
        left.x,
        right.x,
        relativeEpsilon,
        absoluteEpsilon
      ) &&
      HEditorMath.equalsEpsilon(
        left.y,
        right.y,
        relativeEpsilon,
        absoluteEpsilon
      ) &&
      HEditorMath.equalsEpsilon(
        left.z,
        right.z,
        relativeEpsilon,
        absoluteEpsilon
      ))
  )
}

const angleBetweenScratch = new Cartesian3()
const angleBetweenScratch2 = new Cartesian3()
Cartesian3.angleBetween = function (left: Cartesian3, right: Cartesian3) {
  Cartesian3.normalize(left, angleBetweenScratch)
  Cartesian3.normalize(right, angleBetweenScratch2)

  const cosine = Cartesian3.dot(angleBetweenScratch, angleBetweenScratch2)
  const sine = Cartesian3.magnitude(
    Cartesian3.cross(
      angleBetweenScratch,
      angleBetweenScratch2,
      angleBetweenScratch
    )
  )

  return Math.atan2(sine, cosine)
}

Cartesian3.abs = function (cartesian: Cartesian3, result?: Cartesian3) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = Math.abs(cartesian.x)
  result.y = Math.abs(cartesian.y)
  result.z = Math.abs(cartesian.z)
  return result
}

const mostOrthogonalAxisScrach = new Cartesian3()
Cartesian3.mostOrthogonalAxis = function (
  cartesian: Cartesian3,
  result?: Cartesian3
) {
  const f = Cartesian3.normalize(cartesian, mostOrthogonalAxisScrach)
  Cartesian3.abs(f, f)

  if (f.x <= f.y) {
    if (f.x <= f.z) {
      result = Cartesian3.clone(Cartesian3.UNIT_X, result)
    } else {
      result = Cartesian3.clone(Cartesian3.UNIT_Z, result)
    }
  } else if (f.y <= f.z) {
    result = Cartesian3.clone(Cartesian3.UNIT_Y, result)
  } else {
    result = Cartesian3.clone(Cartesian3.UNIT_Z, result)
  }

  return result
}
Cartesian3.divideByScalar = function (
  cartesian: Cartesian3,
  scalar: number,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = cartesian.x / scalar
  result.y = cartesian.y / scalar
  result.z = cartesian.z / scalar
  return result
}
Cartesian3.negate = function (cartesian: Cartesian3, result?: Cartesian3) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = -cartesian.x
  result.y = -cartesian.y
  result.z = -cartesian.z
  return result
}
Cartesian3.fromElements = function (
  x: number,
  y: number,
  z: number,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = x
  result.y = y
  result.z = z
  return result
}
Cartesian3.unpack = function (
  array: number[],
  index: number,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = array[index]
  result.y = array[index + 1]
  result.z = array[index + 2]
  return result
}
