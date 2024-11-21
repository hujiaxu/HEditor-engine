import { HEditorMathOptions } from '../../type'

const HEditorMath: HEditorMathOptions = {
  PI: Math.PI,
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
  DEGREES_PER_RADIAN: 180.0 / Math.PI
}

export default HEditorMath
