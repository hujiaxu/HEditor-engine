import Cartesian3 from './Cartesian3'
import HeadingPitchRoll from './HeadingPitchRoll'

export default class Quaternion {
  x: number
  y: number
  z: number
  w: number
  static fromAxisAngle: (
    axis: Cartesian3,
    angle: number,
    result?: Quaternion
  ) => Quaternion
  static fromHeadingPitchRoll: (
    hpr: HeadingPitchRoll,
    result?: Quaternion
  ) => Quaternion
  static multiply: (
    left: Quaternion,
    right: Quaternion,
    result?: Quaternion
  ) => Quaternion

  constructor(
    x: number = 0.0,
    y: number = 0.0,
    z: number = 0.0,
    w: number = 0.0
  ) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }
}

/*
  axis: (x, y, z)
  angle: rad
  q = (sin(angle/2) * x, sin(angle/2) * y, sin(angle/2) * z, cos(angle/2))
*/
Quaternion.fromAxisAngle = (
  axis: Cartesian3,
  angle: number,
  result?: Quaternion
) => {
  if (!result) {
    result = new Quaternion()
  }
  const halfAngle = angle / 2.0
  const scratchAxis = Cartesian3.normalize(axis)

  const sinAngle = Math.sin(halfAngle)
  result.x = scratchAxis.x * sinAngle
  result.y = scratchAxis.y * sinAngle
  result.z = scratchAxis.z * sinAngle
  result.w = Math.cos(halfAngle)
  return result
}

/*
  q1 = (x1, y1, z1, w1)
  q2 = (x2, y2, z2, w2)

  q1 · q2 = (w1x2 + x1w2 + y1z1 - z1y2, w1y2 - x1z2 + y1w2 + z1x2, w1z2 + x1y2 - y1x2 + z1w2, w1w2 - x1x2 - y1y2 - z1z2)
*/
Quaternion.multiply = (
  left: Quaternion,
  right: Quaternion,
  result?: Quaternion
) => {
  if (!result) {
    result = new Quaternion()
  }

  const leftX = left.x
  const leftY = left.y
  const leftZ = left.z
  const leftW = left.w

  const rightX = right.x
  const rightY = right.y
  const rightZ = right.z
  const rightW = right.w

  result.x = leftW * rightX + leftX * rightW + leftY * rightZ - leftZ * rightY
  result.y = leftW * rightY - leftX * rightZ + leftY * rightW + leftZ * rightX
  result.z = leftW * rightZ + leftX * rightY - leftY * rightX + leftZ * rightW
  result.w = leftW * rightW - leftX * rightX - leftY * rightY - leftZ * rightZ

  return result
}
Quaternion.fromHeadingPitchRoll = (
  hpr: HeadingPitchRoll,
  result?: Quaternion
) => {
  if (!result) {
    result = new Quaternion()
  }

  const scratchRollQuaternion = Quaternion.fromAxisAngle(
    Cartesian3.UNIT_X,
    hpr.roll
  )
  const scratchPitchQuaternion = Quaternion.fromAxisAngle(
    Cartesian3.UNIT_Y,
    -hpr.pitch
  )
  result = Quaternion.multiply(
    scratchPitchQuaternion,
    scratchRollQuaternion,
    scratchPitchQuaternion
  )

  const scratchHeadingQuaternion = Quaternion.fromAxisAngle(
    Cartesian3.UNIT_Z,
    -hpr.heading
  )
  return Quaternion.multiply(scratchHeadingQuaternion, result, result)
}
