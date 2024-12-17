import BoundingRectangle from './BoundingRectangle'
import Cartesian3 from './Cartesian3'
import Cartesian4 from './Cartesian4'
import defaultValue from './DefaultValue'
import { defined } from './Defined'
import Matrix3 from './Matrix3'

export default class Matrix4 {
  static toArray: (m4: Matrix4) => number[]

  private _values: number[]

  static packedLength: number
  static pack: (
    matrix4: Matrix4,
    array?: number[],
    startIndex?: number
  ) => number[]
  static setValue: (m4: Matrix4, index: number, value: number) => void
  static clone: (m4: Matrix4, result?: Matrix4) => Matrix4
  static unpack: (
    array: number[],
    startIndex?: number,
    result?: Matrix4
  ) => Matrix4
  static fromArray: (
    array: number[],
    startIndex?: number,
    result?: Matrix4
  ) => Matrix4
  static fromColumnMajorArray: (values: number[], result?: Matrix4) => Matrix4
  static fromRowMajorArray: (values: number[], result?: Matrix4) => Matrix4
  static fromRotationTranslation: (
    rotation: Matrix3,
    translation: Cartesian3,
    result?: Matrix4
  ) => Matrix4
  static IDENTITY: Matrix4
  static fromTranslation: (translation: Cartesian3, result?: Matrix4) => Matrix4
  static fromScale: (scale: Cartesian3, result?: Matrix4) => Matrix4
  static fromUniformScale: (scale: number, result?: Matrix4) => Matrix4
  static fromRotation: (rotation: Matrix3, result?: Matrix4) => Matrix4
  static computePerspectiveOffCenter: (
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
    result?: Matrix4
  ) => Matrix4
  static computePerspectiveFiledOfView: (
    fovy: number,
    aspect: number,
    near: number,
    far: number,
    result?: Matrix4
  ) => Matrix4
  static computeOrthographicOffCenter: (
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
    result?: Matrix4
  ) => Matrix4
  static computeView: (
    position: Cartesian3,
    direction: Cartesian3,
    up: Cartesian3,
    right: Cartesian3,
    result?: Matrix4
  ) => Matrix4
  static equals: (left: Matrix4, right: Matrix4) => boolean
  static multiply: (left: Matrix4, right: Matrix4, result?: Matrix4) => Matrix4
  static multiplyByPoint: (
    matrix: Matrix4,
    cartesian: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static multiplyByPointAsVector: (
    matrix: Matrix4,
    cartesian: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3
  static inverseTransformation: (matrix: Matrix4, result?: Matrix4) => Matrix4
  static multiplyByVector: (
    matrix: Matrix4,
    cartesian: Cartesian4,
    result?: Cartesian4
  ) => Cartesian4
  static computeViewportTransformation: (
    viewport: BoundingRectangle,
    nearDepthRange: number,
    farDepthRange: number,
    result?: Matrix4
  ) => Matrix4
  static transpose: (matrix: Matrix4, result?: Matrix4) => Matrix4

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
    column3Row0: number = 0.0,
    column0Row1: number = 0.0,
    column1Row1: number = 0.0,
    column2Row1: number = 0.0,
    column3Row1: number = 0.0,
    column0Row2: number = 0.0,
    column1Row2: number = 0.0,
    column2Row2: number = 0.0,
    column3Row2: number = 0.0,
    column0Row3: number = 0.0,
    column1Row3: number = 0.0,
    column2Row3: number = 0.0,
    column3Row3: number = 0.0
  ) {
    this._values = [
      column0Row0,
      column0Row1,
      column0Row2,
      column0Row3,
      column1Row0,
      column1Row1,
      column1Row2,
      column1Row3,
      column2Row0,
      column2Row1,
      column2Row2,
      column2Row3,
      column3Row0,
      column3Row1,
      column3Row2,
      column3Row3
    ]
  }

  setValue(index: number, value: number) {
    this._values[index] = value
  }
}
Matrix4.packedLength = 16
Matrix4.toArray = function (matrix4: Matrix4) {
  return matrix4.values
}
Matrix4.pack = function (
  matrix4: Matrix4,
  array?: number[],
  startIndex?: number
) {
  if (!array) {
    array = []
  }
  startIndex = startIndex || 0
  for (let i = startIndex; i < 16; ++i) {
    array[i] = matrix4.values[i]
  }
  return array
}
Matrix4.unpack = function (
  array: number[],
  startIndex?: number,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }
  startIndex = startIndex || 0
  for (let i = startIndex; i < 16; ++i) {
    result.setValue(i, array[i])
  }
  return result
}
Matrix4.clone = function (m4: Matrix4, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }
  for (let i = 0; i < Matrix4.packedLength; ++i) {
    result.setValue(i, m4.values[i])
  }
  return result
}
Matrix4.IDENTITY = Matrix4.clone(
  new Matrix4(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  )
)
Matrix4.fromArray = Matrix4.unpack
Matrix4.fromColumnMajorArray = function (values: number[], result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }
  return Matrix4.unpack(values, 0, result)
}
/**
 * Creates a Matrix4 instance from an array of numbers in row-major order.
 * If a result matrix is provided, it will be populated with the values
 * from the array; otherwise, a new Matrix4 will be created.
 *
 * @param values - An array of 16 numbers representing the matrix in row-major order.
 * @param result - An optional Matrix4 instance to store the result.
 * @returns The resulting Matrix4 instance populated with the values.
 */
Matrix4.fromRowMajorArray = function (values: number[], result?: Matrix4) {
  if (!result) {
    return (result = new Matrix4(...values))
  }
  result.setValue(0, values[0])
  result.setValue(1, values[4])
  result.setValue(2, values[8])
  result.setValue(3, values[12])
  result.setValue(4, values[1])
  result.setValue(5, values[5])
  result.setValue(6, values[9])
  result.setValue(7, values[13])
  result.setValue(8, values[2])
  result.setValue(9, values[6])
  result.setValue(10, values[10])
  result.setValue(11, values[14])
  result.setValue(12, values[3])
  result.setValue(13, values[7])
  result.setValue(14, values[11])
  result.setValue(15, values[15])
  return result
}
Matrix4.fromRotationTranslation = function (
  rotation: Matrix3,
  translation: Cartesian3,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }
  result.setValue(0, rotation.values[0])
  result.setValue(1, rotation.values[1])
  result.setValue(2, rotation.values[2])
  result.setValue(3, 0.0)
  result.setValue(4, rotation.values[3])
  result.setValue(5, rotation.values[4])
  result.setValue(6, rotation.values[5])
  result.setValue(7, 0.0)
  result.setValue(8, rotation.values[6])
  result.setValue(9, rotation.values[7])
  result.setValue(10, rotation.values[8])
  result.setValue(11, 0.0)
  result.setValue(12, translation.x)
  result.setValue(13, translation.y)
  result.setValue(14, translation.z)
  result.setValue(15, 1.0)
  return result
}
Matrix4.fromTranslation = function (translation: Cartesian3, result?: Matrix4) {
  return Matrix4.fromRotationTranslation(Matrix3.IDENTITY, translation, result)
}
Matrix4.fromScale = function (scale: Cartesian3, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }
  result.setValue(0, scale.x)
  result.setValue(1, 0.0)
  result.setValue(2, 0.0)
  result.setValue(3, 0.0)
  result.setValue(4, 0.0)
  result.setValue(5, scale.y)
  result.setValue(6, 0.0)
  result.setValue(7, 0.0)
  result.setValue(8, 0.0)
  result.setValue(9, 0.0)
  result.setValue(10, scale.z)
  result.setValue(11, 0.0)
  result.setValue(12, 0.0)
  result.setValue(13, 0.0)
  result.setValue(14, 0.0)
  result.setValue(15, 1.0)
  return result
}
Matrix4.fromUniformScale = function (scale: number, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }
  result.setValue(0, scale)
  result.setValue(1, 0.0)
  result.setValue(2, 0.0)
  result.setValue(3, 0.0)
  result.setValue(4, 0.0)
  result.setValue(5, scale)
  result.setValue(6, 0.0)
  result.setValue(7, 0.0)
  result.setValue(8, 0.0)
  result.setValue(9, 0.0)
  result.setValue(10, scale)
  result.setValue(11, 0.0)
  result.setValue(12, 0.0)
  result.setValue(13, 0.0)
  result.setValue(14, 0.0)
  result.setValue(15, 1.0)
  return result
}
Matrix4.fromRotation = function (rotation: Matrix3, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }

  result.setValue(0, rotation.values[0])
  result.setValue(1, rotation.values[1])
  result.setValue(2, rotation.values[2])
  result.setValue(3, 0.0)
  result.setValue(4, rotation.values[3])
  result.setValue(5, rotation.values[4])
  result.setValue(6, rotation.values[5])
  result.setValue(7, 0.0)
  result.setValue(8, rotation.values[6])
  result.setValue(9, rotation.values[7])
  result.setValue(10, rotation.values[8])
  result.setValue(11, 0.0)
  result.setValue(12, 0.0)
  result.setValue(13, 0.0)
  result.setValue(14, 0.0)
  result.setValue(15, 1.0)
  return result
}
Matrix4.computePerspectiveOffCenter = function (
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }
  const column0Row0 = (2.0 * near) / (right - left)
  const column1Row1 = (2.0 * near) / (top - bottom)
  const column2Row0 = (right + left) / (right - left)
  const column2Row1 = (top + bottom) / (top - bottom)
  const column2Row2 = -(far + near) / (far - near)
  const column2Row3 = -1.0
  const column3Row2 = -(2.0 * far * near) / (far - near)
  result.setValue(0, column0Row0)
  result.setValue(1, 0.0)
  result.setValue(2, 0.0)
  result.setValue(3, 0.0)
  result.setValue(4, 0.0)
  result.setValue(5, column1Row1)
  result.setValue(6, 0.0)
  result.setValue(7, 0.0)
  result.setValue(8, column2Row0)
  result.setValue(9, column2Row1)
  result.setValue(10, column2Row2)
  result.setValue(11, column2Row3)
  result.setValue(12, 0.0)
  result.setValue(13, 0.0)
  result.setValue(14, column3Row2)
  result.setValue(15, 0.0)
  return result
}
Matrix4.computePerspectiveFiledOfView = function (
  fovy: number,
  aspect: number,
  near: number,
  far: number,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }

  const bottom = Math.tan(fovy * 0.5)
  const column1Row1 = 1.0 / bottom
  const column0Row0 = column1Row1 / aspect
  const column2Row2 = (far + near) / (near - far)
  const column2Row3 = -1.0
  const column3Row2 = (2.0 * far * near) / (far - near)
  result.setValue(0, column0Row0)
  result.setValue(1, 0.0)
  result.setValue(2, 0.0)
  result.setValue(3, 0.0)
  result.setValue(4, 0.0)
  result.setValue(5, column1Row1)
  result.setValue(6, 0.0)
  result.setValue(7, 0.0)
  result.setValue(8, 0.0)
  result.setValue(9, 0.0)
  result.setValue(10, column2Row2)
  result.setValue(11, column2Row3)
  result.setValue(12, 0.0)
  result.setValue(13, 0.0)
  result.setValue(14, column3Row2)
  result.setValue(15, 0.0)
  return result
}
Matrix4.computeOrthographicOffCenter = function (
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }
  const column0Row0 = 2.0 / (right - left)
  const column1Row1 = 2.0 / (top - bottom)
  const column2Row2 = -2.0 / (far - near)
  const column3Row0 = -(right + left) / (right - left)
  const column3Row1 = -(top + bottom) / (top - bottom)
  const column3Row2 = -(far + near) / (far - near)
  result.setValue(0, column0Row0)
  result.setValue(1, 0.0)
  result.setValue(2, 0.0)
  result.setValue(3, 0.0)
  result.setValue(4, 0.0)
  result.setValue(5, column1Row1)
  result.setValue(6, 0.0)
  result.setValue(7, 0.0)
  result.setValue(8, 0.0)
  result.setValue(9, 0.0)
  result.setValue(10, column2Row2)
  result.setValue(11, 0.0)
  result.setValue(12, column3Row0)
  result.setValue(13, column3Row1)
  result.setValue(14, column3Row2)
  result.setValue(15, 1.0)
  return result
}

Matrix4.computeView = function (
  position: Cartesian3,
  direction: Cartesian3,
  up: Cartesian3,
  right: Cartesian3,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }
  // console.log(position, direction, up, right)
  result.setValue(0, right.x)
  result.setValue(1, up.x)
  result.setValue(2, -direction.x)
  result.setValue(3, 0.0)
  result.setValue(4, right.y)
  result.setValue(5, up.y)
  result.setValue(6, -direction.y)
  result.setValue(7, 0.0)
  result.setValue(8, right.z)
  result.setValue(9, up.z)
  result.setValue(10, -direction.z)
  result.setValue(11, 0.0)
  result.setValue(12, -Cartesian3.dot(right, position))
  result.setValue(13, -Cartesian3.dot(up, position))
  result.setValue(14, Cartesian3.dot(direction, position))
  result.setValue(15, 1.0)
  return result
}
Matrix4.equals = function (left: Matrix4, right: Matrix4) {
  return (
    left.values[0] === right.values[0] &&
    left.values[1] === right.values[1] &&
    left.values[2] === right.values[2] &&
    left.values[3] === right.values[3] &&
    left.values[4] === right.values[4] &&
    left.values[5] === right.values[5] &&
    left.values[6] === right.values[6] &&
    left.values[7] === right.values[7] &&
    left.values[8] === right.values[8] &&
    left.values[9] === right.values[9] &&
    left.values[10] === right.values[10] &&
    left.values[11] === right.values[11] &&
    left.values[12] === right.values[12] &&
    left.values[13] === right.values[13] &&
    left.values[14] === right.values[14] &&
    left.values[15] === right.values[15]
  )
}
Matrix4.multiply = function (left: Matrix4, right: Matrix4, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }

  const column0Row0 =
    left.values[0] * right.values[0] +
    left.values[4] * right.values[1] +
    left.values[8] * right.values[2] +
    left.values[12] * right.values[3]
  const column0Row1 =
    left.values[1] * right.values[0] +
    left.values[5] * right.values[1] +
    left.values[9] * right.values[2] +
    left.values[13] * right.values[3]
  const column0Row2 =
    left.values[2] * right.values[0] +
    left.values[6] * right.values[1] +
    left.values[10] * right.values[2] +
    left.values[14] * right.values[3]
  const column0Row3 =
    left.values[3] * right.values[0] +
    left.values[7] * right.values[1] +
    left.values[11] * right.values[2] +
    left.values[15] * right.values[3]

  const column1Row0 =
    left.values[0] * right.values[4] +
    left.values[4] * right.values[5] +
    left.values[8] * right.values[6] +
    left.values[12] * right.values[7]
  const column1Row1 =
    left.values[1] * right.values[4] +
    left.values[5] * right.values[5] +
    left.values[9] * right.values[6] +
    left.values[13] * right.values[7]
  const column1Row2 =
    left.values[2] * right.values[4] +
    left.values[6] * right.values[5] +
    left.values[10] * right.values[6] +
    left.values[14] * right.values[7]
  const column1Row3 =
    left.values[3] * right.values[4] +
    left.values[7] * right.values[5] +
    left.values[11] * right.values[6] +
    left.values[15] * right.values[7]

  const column2Row0 =
    left.values[0] * right.values[8] +
    left.values[4] * right.values[9] +
    left.values[8] * right.values[10] +
    left.values[12] * right.values[11]
  const column2Row1 =
    left.values[1] * right.values[8] +
    left.values[5] * right.values[9] +
    left.values[9] * right.values[10] +
    left.values[13] * right.values[11]
  const column2Row2 =
    left.values[2] * right.values[8] +
    left.values[6] * right.values[9] +
    left.values[10] * right.values[10] +
    left.values[14] * right.values[11]
  const column2Row3 =
    left.values[3] * right.values[8] +
    left.values[7] * right.values[9] +
    left.values[11] * right.values[10] +
    left.values[15] * right.values[11]

  const column3Row0 =
    left.values[0] * right.values[12] +
    left.values[4] * right.values[13] +
    left.values[8] * right.values[14] +
    left.values[12] * right.values[15]
  const column3Row1 =
    left.values[1] * right.values[12] +
    left.values[5] * right.values[13] +
    left.values[9] * right.values[14] +
    left.values[13] * right.values[15]
  const column3Row2 =
    left.values[2] * right.values[12] +
    left.values[6] * right.values[13] +
    left.values[10] * right.values[14] +
    left.values[14] * right.values[15]
  const column3Row3 =
    left.values[3] * right.values[12] +
    left.values[7] * right.values[13] +
    left.values[11] * right.values[14] +
    left.values[15] * right.values[15]

  result.values[0] = column0Row0
  result.values[1] = column0Row1
  result.values[2] = column0Row2
  result.values[3] = column0Row3
  result.values[4] = column1Row0
  result.values[5] = column1Row1
  result.values[6] = column1Row2
  result.values[7] = column1Row3
  result.values[8] = column2Row0
  result.values[9] = column2Row1
  result.values[10] = column2Row2
  result.values[11] = column2Row3
  result.values[12] = column3Row0
  result.values[13] = column3Row1
  result.values[14] = column3Row2
  result.values[15] = column3Row3
  return result
}

Matrix4.multiplyByPoint = function (
  matrix: Matrix4,
  cartesian: Cartesian3,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  const x = cartesian.x
  const y = cartesian.y
  const z = cartesian.z
  result.x =
    matrix.values[0] * x +
    matrix.values[4] * y +
    matrix.values[8] * z +
    matrix.values[12]
  result.y =
    matrix.values[1] * x +
    matrix.values[5] * y +
    matrix.values[9] * z +
    matrix.values[13]
  result.z =
    matrix.values[2] * x +
    matrix.values[6] * y +
    matrix.values[10] * z +
    matrix.values[14]
  return result
}

Matrix4.multiplyByPointAsVector = function (
  matrix: Matrix4,
  cartesian: Cartesian3,
  result?: Cartesian3
) {
  if (!result) {
    result = new Cartesian3()
  }
  const x = cartesian.x
  const y = cartesian.y
  const z = cartesian.z
  result.x = matrix.values[0] * x + matrix.values[4] * y + matrix.values[8] * z
  result.y = matrix.values[1] * x + matrix.values[5] * y + matrix.values[9] * z
  result.z = matrix.values[2] * x + matrix.values[6] * y + matrix.values[10] * z
  return result
}
Matrix4.inverseTransformation = function (matrix: Matrix4, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }

  const matrix0 = matrix.values[0]
  const matrix1 = matrix.values[1]
  const matrix2 = matrix.values[2]

  const matrix4 = matrix.values[4]
  const matrix5 = matrix.values[5]
  const matrix6 = matrix.values[6]

  const matrix8 = matrix.values[8]
  const matrix9 = matrix.values[9]
  const matrix10 = matrix.values[10]

  const vX = matrix.values[12]
  const vY = matrix.values[13]
  const vZ = matrix.values[14]

  const x = -matrix0 * vX - matrix1 * vY - matrix2 * vZ
  const y = -matrix4 * vX - matrix5 * vY - matrix6 * vZ
  const z = -matrix8 * vX - matrix9 * vY - matrix10 * vZ

  result.values[0] = matrix0
  result.values[1] = matrix4
  result.values[2] = matrix8
  result.values[3] = 0.0
  result.values[4] = matrix1
  result.values[5] = matrix5
  result.values[6] = matrix9
  result.values[7] = 0.0
  result.values[8] = matrix2
  result.values[9] = matrix6
  result.values[10] = matrix10
  result.values[11] = 0.0
  result.values[12] = x
  result.values[13] = y
  result.values[14] = z
  result.values[15] = 1.0
  return result
}
Matrix4.multiplyByVector = function (
  matrix: Matrix4,
  cartesian: Cartesian4,
  result?: Cartesian4
) {
  if (!result) {
    result = new Cartesian4()
  }
  const x = cartesian.x
  const y = cartesian.y
  const z = cartesian.z
  const w = cartesian.w
  result.x =
    matrix.values[0] * x +
    matrix.values[4] * y +
    matrix.values[8] * z +
    matrix.values[12] * w
  result.y =
    matrix.values[1] * x +
    matrix.values[5] * y +
    matrix.values[9] * z +
    matrix.values[13] * w
  result.z =
    matrix.values[2] * x +
    matrix.values[6] * y +
    matrix.values[10] * z +
    matrix.values[14] * w
  result.w =
    matrix.values[3] * x +
    matrix.values[7] * y +
    matrix.values[11] * z +
    matrix.values[15] * w
  return result
}

Matrix4.computeViewportTransformation = function (
  viewport: BoundingRectangle,
  nearDepthRange: number,
  farDepthRange: number,
  result?: Matrix4
) {
  if (!defined(result)) {
    result = new Matrix4()
  }

  viewport = defaultValue(viewport, new BoundingRectangle())
  const x = viewport.x
  const y = viewport.y
  const width = viewport.width
  const height = viewport.height

  nearDepthRange = defaultValue(nearDepthRange, 0.0)
  farDepthRange = defaultValue(farDepthRange, 1.0)

  const halfWidth = width * 0.5
  const halfHeight = height * 0.5
  const halfDepth = (farDepthRange - nearDepthRange) * 0.5

  const column0Row0 = halfWidth
  const column1Row1 = halfHeight
  const column2Row2 = halfDepth
  const column3Row0 = x + halfWidth
  const column3Row1 = y + halfHeight
  const column3Row2 = nearDepthRange + halfDepth
  const column3Row3 = 1.0

  result.values[0] = column0Row0
  result.values[1] = 0.0
  result.values[2] = 0.0
  result.values[3] = 0.0
  result.values[4] = 0.0
  result.values[5] = column1Row1
  result.values[6] = 0.0
  result.values[7] = 0.0
  result.values[8] = 0.0
  result.values[9] = 0.0
  result.values[10] = column2Row2
  result.values[11] = 0.0
  result.values[12] = column3Row0
  result.values[13] = column3Row1
  result.values[14] = column3Row2
  result.values[15] = column3Row3
  return result
}
Matrix4.transpose = function (matrix: Matrix4, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }
  result.values[0] = matrix.values[0]
  result.values[1] = matrix.values[4]
  result.values[2] = matrix.values[8]
  result.values[3] = matrix.values[12]
  result.values[4] = matrix.values[1]
  result.values[5] = matrix.values[5]
  result.values[6] = matrix.values[9]
  result.values[7] = matrix.values[13]
  result.values[8] = matrix.values[2]
  result.values[9] = matrix.values[6]
  result.values[10] = matrix.values[10]
  result.values[11] = matrix.values[14]
  result.values[12] = matrix.values[3]
  result.values[13] = matrix.values[7]
  result.values[14] = matrix.values[11]
  result.values[15] = matrix.values[15]
  return result
}
