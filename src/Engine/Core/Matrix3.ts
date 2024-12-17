import Cartesian3 from './Cartesian3'
import HeadingPitchRoll from './HeadingPitchRoll'
import Quaternion from './Quaternion'

export default class Matrix3 {
  private _values: number[]
  static clone: (m3: Matrix3, result?: Matrix3) => Matrix3
  static packedLength: number
  static IDENTITY: Matrix3
  static multiplyByVector: (
    m3: Matrix3,
    cartesian: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static fromQuaternion: (quaternion: Quaternion, result?: Matrix3) => Matrix3
  static transpose: (m3: Matrix3, result?: Matrix3) => Matrix3
  static fromScale: (scale: Cartesian3, result?: Matrix3) => Matrix3
  static multiply: (left: Matrix3, right: Matrix3, result?: Matrix3) => Matrix3
  static COLUMN0ROW0: number
  static COLUMN1ROW0: number
  static COLUMN2ROW0: number
  static COLUMN0ROW1: number
  static COLUMN1ROW1: number
  static COLUMN2ROW1: number
  static COLUMN0ROW2: number
  static COLUMN1ROW2: number
  static COLUMN2ROW2: number
  static getColumn: (
    m: Matrix3,
    index: number,
    result?: Cartesian3
  ) => Cartesian3
  static fromHeadingPitchRoll: (
    headingPitchRoll: HeadingPitchRoll,
    result?: Matrix3
  ) => Matrix3

  get values() {
    return this._values
  }

  set values(values: number[]) {
    this._values = values
  }

  constructor(
    column0Row0: number = 0.0,
    column1Row0: number = 0.0,
    column2Row0: number = 0.0,
    column0Row1: number = 0.0,
    column1Row1: number = 0.0,
    column2Row1: number = 0.0,
    column0Row2: number = 0.0,
    column1Row2: number = 0.0,
    column2Row2: number = 0.0
  ) {
    this._values = [
      column0Row0,
      column0Row1,
      column0Row2,
      column1Row0,
      column1Row1,
      column1Row2,
      column2Row0,
      column2Row1,
      column2Row2
    ]
  }

  setValue(index: number, value: number) {
    this._values[index] = value
  }
}
Matrix3.COLUMN0ROW0 = 0
Matrix3.COLUMN0ROW1 = 1
Matrix3.COLUMN0ROW2 = 2
Matrix3.COLUMN1ROW0 = 3
Matrix3.COLUMN1ROW1 = 4
Matrix3.COLUMN1ROW2 = 5
Matrix3.COLUMN2ROW0 = 6
Matrix3.COLUMN2ROW1 = 7
Matrix3.COLUMN2ROW2 = 8

Matrix3.packedLength = 9
Matrix3.clone = (m3: Matrix3, result?: Matrix3) => {
  if (!result) {
    return new Matrix3(
      m3.values[0],
      m3.values[3],
      m3.values[6],
      m3.values[1],
      m3.values[4],
      m3.values[7],
      m3.values[2],
      m3.values[5],
      m3.values[8]
    )
  }
  for (let i = 0; i < Matrix3.packedLength; ++i) {
    result.setValue(i, m3.values[i])
  }
  return result
}
Matrix3.IDENTITY = Matrix3.clone(
  new Matrix3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0)
)
Matrix3.multiplyByVector = (
  m3: Matrix3,
  cartesian: Cartesian3,
  result?: Cartesian3
) => {
  const vX = cartesian.x
  const vY = cartesian.y
  const vZ = cartesian.z

  const x = m3.values[0] * vX + m3.values[3] * vY + m3.values[6] * vZ
  const y = m3.values[1] * vX + m3.values[4] * vY + m3.values[7] * vZ
  const z = m3.values[2] * vX + m3.values[5] * vY + m3.values[8] * vZ

  if (!result) {
    result = new Cartesian3()
  }

  result.x = x
  result.y = y
  result.z = z
  return result
}

/*
  q = (x, y, z, w)

  m = [
    x2 - y2 - z2 + w2,  2xy - 2zw,    2xz + 2yw,
    2xy + 2zw,    -x2 + y2 - z2 + w2, 2yz - 2xw,
    2xz - 2yw,    2yw + 2xz,    -x2 - y2 + z2 + w2
  ]
*/
Matrix3.fromQuaternion = (quaternion: Quaternion, result?: Matrix3) => {
  const x2 = quaternion.x * quaternion.x
  const xy = quaternion.x * quaternion.y
  const xz = quaternion.x * quaternion.z
  const xw = quaternion.x * quaternion.w
  const y2 = quaternion.y * quaternion.y
  const yz = quaternion.y * quaternion.z
  const yw = quaternion.y * quaternion.w
  const z2 = quaternion.z * quaternion.z
  const zw = quaternion.z * quaternion.w
  const w2 = quaternion.w * quaternion.w

  const m00 = x2 - y2 - z2 + w2
  const m01 = 2.0 * (xy - zw)
  const m02 = 2.0 * (xz + yw)

  const m10 = 2.0 * (xy + zw)
  const m11 = -x2 + y2 - z2 + w2
  const m12 = 2.0 * (yz - xw)

  const m20 = 2.0 * (xz - yw)
  const m21 = 2.0 * (yz + xw)
  const m22 = -x2 - y2 + z2 + w2

  if (!result) {
    result = new Matrix3()
  }

  result.values[0] = m00
  result.values[1] = m10
  result.values[2] = m20
  result.values[3] = m01
  result.values[4] = m11
  result.values[5] = m21
  result.values[6] = m02
  result.values[7] = m12
  result.values[8] = m22
  return result
}
Matrix3.transpose = (m3: Matrix3, result?: Matrix3) => {
  if (!result) {
    result = new Matrix3()
  }

  const column0Row0 = m3.values[0]
  const column0Row1 = m3.values[3]
  const column0Row2 = m3.values[6]
  const column1Row0 = m3.values[1]
  const column1Row1 = m3.values[4]
  const column1Row2 = m3.values[7]
  const column2Row0 = m3.values[2]
  const column2Row1 = m3.values[5]
  const column2Row2 = m3.values[8]

  result.values[0] = column0Row0
  result.values[1] = column0Row1
  result.values[2] = column0Row2
  result.values[3] = column1Row0
  result.values[4] = column1Row1
  result.values[5] = column1Row2
  result.values[6] = column2Row0
  result.values[7] = column2Row1
  result.values[8] = column2Row2
  return result
}
Matrix3.fromScale = (scale: Cartesian3, result?: Matrix3) => {
  if (!result) {
    result = new Matrix3()
  }

  result.values[0] = scale.x
  result.values[1] = 0.0
  result.values[2] = 0.0
  result.values[3] = 0.0
  result.values[4] = scale.y
  result.values[5] = 0.0
  result.values[6] = 0.0
  result.values[7] = 0.0
  result.values[8] = scale.z
  return result
}
Matrix3.multiply = (left: Matrix3, right: Matrix3, result?: Matrix3) => {
  if (!result) {
    result = new Matrix3()
  }

  const column0Row0 =
    left.values[0] * right.values[0] +
    left.values[3] * right.values[1] +
    left.values[6] * right.values[2]
  const column0Row1 =
    left.values[1] * right.values[0] +
    left.values[4] * right.values[1] +
    left.values[7] * right.values[2]
  const column0Row2 =
    left.values[2] * right.values[0] +
    left.values[5] * right.values[1] +
    left.values[8] * right.values[2]

  const column1Row0 =
    left.values[0] * right.values[3] +
    left.values[3] * right.values[4] +
    left.values[6] * right.values[5]
  const column1Row1 =
    left.values[1] * right.values[3] +
    left.values[4] * right.values[4] +
    left.values[7] * right.values[5]
  const column1Row2 =
    left.values[2] * right.values[3] +
    left.values[5] * right.values[4] +
    left.values[8] * right.values[5]

  const column2Row0 =
    left.values[0] * right.values[6] +
    left.values[3] * right.values[7] +
    left.values[6] * right.values[8]
  const column2Row1 =
    left.values[1] * right.values[6] +
    left.values[4] * right.values[7] +
    left.values[7] * right.values[8]
  const column2Row2 =
    left.values[2] * right.values[6] +
    left.values[5] * right.values[7] +
    left.values[8] * right.values[8]

  result.setValue(0, column0Row0)
  result.setValue(1, column0Row1)
  result.setValue(2, column0Row2)
  result.setValue(3, column1Row0)
  result.setValue(4, column1Row1)
  result.setValue(5, column1Row2)
  result.setValue(6, column2Row0)
  result.setValue(7, column2Row1)
  result.setValue(8, column2Row2)

  return result
}
Matrix3.getColumn = (
  m: Matrix3,
  index: number,
  result: Cartesian3 = new Cartesian3()
) => {
  const startIndex = index * 3
  const x = m.values[startIndex]
  const y = m.values[startIndex + 1]
  const z = m.values[startIndex + 2]

  result.x = x
  result.y = y
  result.z = z
  return result
}
Matrix3.fromHeadingPitchRoll = (
  headingPitchRoll: HeadingPitchRoll,
  result?: Matrix3
) => {
  if (!result) {
    result = new Matrix3()
  }

  const cosTheta = Math.cos(-headingPitchRoll.pitch)
  const cosPsi = Math.cos(-headingPitchRoll.heading)
  const cosPhi = Math.cos(headingPitchRoll.roll)
  const sinTheta = Math.sin(-headingPitchRoll.pitch)
  const sinPsi = Math.sin(-headingPitchRoll.heading)
  const sinPhi = Math.sin(headingPitchRoll.roll)

  const m00 = cosTheta * cosPsi
  const m01 = -cosPhi * sinPsi + sinPhi * sinTheta * cosPsi
  const m02 = sinPhi * sinPsi + cosPhi * sinTheta * cosPsi

  const m10 = cosTheta * sinPsi
  const m11 = cosPhi * cosPsi + sinPhi * sinTheta * sinPsi
  const m12 = -sinPhi * cosPsi + cosPhi * sinTheta * sinPsi

  const m20 = -sinTheta
  const m21 = sinPhi * cosTheta
  const m22 = cosPhi * cosTheta

  result.values[0] = m00
  result.values[1] = m10
  result.values[2] = m20
  result.values[3] = m01
  result.values[4] = m11
  result.values[5] = m21
  result.values[6] = m02
  result.values[7] = m12
  result.values[8] = m22

  return result
}
