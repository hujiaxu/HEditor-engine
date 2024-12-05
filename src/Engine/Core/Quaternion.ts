import Cartesian3 from './Cartesian3'

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
