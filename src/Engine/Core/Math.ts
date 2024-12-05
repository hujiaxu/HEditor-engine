import defaultValue from './DefaultValue'
import { defined } from './Defined'

const HEditorMath = {
  PI: Math.PI,
  TWO_PI: 2.0 * Math.PI,
  cos: function (radians: number): number {
    return Math.cos(radians)
  },
  sin: function (radians: number): number {
    return Math.sin(radians)
  },
  toRadians: function (degrees: number): number {
    return degrees * HEditorMath.RADIANS_PER_DEGREE
  },
  toDegrees: function (radians: number): number {
    return radians * HEditorMath.DEGREES_PER_RADIAN
  },
  RADIANS_PER_DEGREE: Math.PI / 180.0,
  DEGREES_PER_RADIAN: 180.0 / Math.PI,

  EPSILON1: 0.1,
  EPSILON2: 0.01,
  EPSILON3: 0.001,
  EPSILON4: 0.0001,
  EPSILON5: 0.00001,
  EPSILON6: 0.000001,
  EPSILON7: 0.0000001,
  EPSILON8: 0.00000001,
  EPSILON9: 0.000000001,
  EPSILON10: 0.0000000001,
  EPSILON11: 0.00000000001,
  EPSILON12: 0.000000000001,
  EPSILON13: 0.0000000000001,
  EPSILON14: 0.00000000000001,
  EPSILON15: 0.000000000000001,

  LUNAR_RADIUS: 1737400.0,

  equalsEpsilon: (
    left: number,
    right: number,
    relativeEpsilon?: number,
    absoluteEpsilon?: number
  ) => {
    if (!defined(left) || !defined(right)) {
      throw new Error('left and right are required.')
    }

    relativeEpsilon = defaultValue<number>(relativeEpsilon, 0.0)
    absoluteEpsilon = defaultValue<number>(absoluteEpsilon, relativeEpsilon)
    const absDiff = Math.abs(left - right)
    return (
      absDiff <= absoluteEpsilon ||
      absDiff <= relativeEpsilon * Math.max(Math.abs(left), Math.abs(right))
    )
  },

  sign: function (value: number): number {
    value = +value

    if (value === 0 || value !== value) {
      return value
    }
    return value > 0 ? 1 : -1
  },

  clamp: function (value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value
  },

  acosClamped: function (value: number): number {
    return Math.acos(HEditorMath.clamp(value, -1.0, 1.0))
  }
}

Object.freeze(HEditorMath)

export default HEditorMath
