import BoundingRectangle from './BoundingRectangle'
import Cartesian3 from './Cartesian3'
import Cartesian4 from './Cartesian4'
import defaultValue from './DefaultValue'
import defined from './Defined'
import HEditorMath from './Math'
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
  static inverse: (matrix: Matrix4, result?: Matrix4) => Matrix4 | undefined
  static getMatrix3: (matrix: Matrix4, result?: Matrix3) => Matrix3
  static getRow: (
    matrix: Matrix4,
    index: number,
    result?: Cartesian4
  ) => Cartesian4
  static getScale: (matrix: Matrix4, result?: Cartesian3) => Cartesian3
  static getMaximumScale: (matrix: Matrix4) => number
  static multiplyTransformation: (
    matrix: Matrix4,
    transformation: Matrix4,
    result?: Matrix4
  ) => Matrix4

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

const scratchInverseRotation = new Matrix3()
const scratchMatrix3Zero = new Matrix3()
const scratchBottomRow = new Cartesian4()
const scratchExpectedBottomRow = new Cartesian4(0.0, 0.0, 0.0, 1.0)

Matrix4.inverse = function (matrix: Matrix4, result?: Matrix4) {
  if (!result) {
    result = new Matrix4()
  }

  const src0 = matrix.values[0]
  const src1 = matrix.values[4]
  const src2 = matrix.values[8]
  const src3 = matrix.values[12]
  const src4 = matrix.values[1]
  const src5 = matrix.values[5]
  const src6 = matrix.values[9]
  const src7 = matrix.values[13]
  const src8 = matrix.values[2]
  const src9 = matrix.values[6]
  const src10 = matrix.values[10]
  const src11 = matrix.values[14]
  const src12 = matrix.values[3]
  const src13 = matrix.values[7]
  const src14 = matrix.values[11]
  const src15 = matrix.values[15]

  // calculate pairs for first 8 elements (cofactors)
  let tmp0 = src10 * src15
  let tmp1 = src11 * src14
  let tmp2 = src9 * src15
  let tmp3 = src11 * src13
  let tmp4 = src9 * src14
  let tmp5 = src10 * src13
  let tmp6 = src8 * src15
  let tmp7 = src11 * src12
  let tmp8 = src8 * src14
  let tmp9 = src10 * src12
  let tmp10 = src8 * src13
  let tmp11 = src9 * src12

  // calculate first 8 elements (cofactors)
  const dst0 =
    tmp0 * src5 +
    tmp3 * src6 +
    tmp4 * src7 -
    (tmp1 * src5 + tmp2 * src6 + tmp5 * src7)
  const dst1 =
    tmp1 * src4 +
    tmp6 * src6 +
    tmp9 * src7 -
    (tmp0 * src4 + tmp7 * src6 + tmp8 * src7)
  const dst2 =
    tmp2 * src4 +
    tmp7 * src5 +
    tmp10 * src7 -
    (tmp3 * src4 + tmp6 * src5 + tmp11 * src7)
  const dst3 =
    tmp5 * src4 +
    tmp8 * src5 +
    tmp11 * src6 -
    (tmp4 * src4 + tmp9 * src5 + tmp10 * src6)
  const dst4 =
    tmp1 * src1 +
    tmp2 * src2 +
    tmp5 * src3 -
    (tmp0 * src1 + tmp3 * src2 + tmp4 * src3)
  const dst5 =
    tmp0 * src0 +
    tmp7 * src2 +
    tmp8 * src3 -
    (tmp1 * src0 + tmp6 * src2 + tmp9 * src3)
  const dst6 =
    tmp3 * src0 +
    tmp6 * src1 +
    tmp11 * src3 -
    (tmp2 * src0 + tmp7 * src1 + tmp10 * src3)
  const dst7 =
    tmp4 * src0 +
    tmp9 * src1 +
    tmp10 * src2 -
    (tmp5 * src0 + tmp8 * src1 + tmp11 * src2)

  // calculate pairs for second 8 elements (cofactors)
  tmp0 = src2 * src7
  tmp1 = src3 * src6
  tmp2 = src1 * src7
  tmp3 = src3 * src5
  tmp4 = src1 * src6
  tmp5 = src2 * src5
  tmp6 = src0 * src7
  tmp7 = src3 * src4
  tmp8 = src0 * src6
  tmp9 = src2 * src4
  tmp10 = src0 * src5
  tmp11 = src1 * src4

  // calculate second 8 elements (cofactors)
  const dst8 =
    tmp0 * src13 +
    tmp3 * src14 +
    tmp4 * src15 -
    (tmp1 * src13 + tmp2 * src14 + tmp5 * src15)
  const dst9 =
    tmp1 * src12 +
    tmp6 * src14 +
    tmp9 * src15 -
    (tmp0 * src12 + tmp7 * src14 + tmp8 * src15)
  const dst10 =
    tmp2 * src12 +
    tmp7 * src13 +
    tmp10 * src15 -
    (tmp3 * src12 + tmp6 * src13 + tmp11 * src15)
  const dst11 =
    tmp5 * src12 +
    tmp8 * src13 +
    tmp11 * src14 -
    (tmp4 * src12 + tmp9 * src13 + tmp10 * src14)
  const dst12 =
    tmp2 * src10 +
    tmp5 * src11 +
    tmp1 * src9 -
    (tmp4 * src11 + tmp0 * src9 + tmp3 * src10)
  const dst13 =
    tmp8 * src11 +
    tmp0 * src8 +
    tmp7 * src10 -
    (tmp6 * src10 + tmp9 * src11 + tmp1 * src8)
  const dst14 =
    tmp6 * src9 +
    tmp11 * src11 +
    tmp3 * src8 -
    (tmp10 * src11 + tmp2 * src8 + tmp7 * src9)
  const dst15 =
    tmp10 * src10 +
    tmp4 * src8 +
    tmp9 * src9 -
    (tmp8 * src9 + tmp11 * src10 + tmp5 * src8)

  // calculate determinant
  let det = src0 * dst0 + src1 * dst1 + src2 * dst2 + src3 * dst3

  if (Math.abs(det) < HEditorMath.EPSILON21) {
    // Special case for a zero scale matrix that can occur, for example,
    // when a model's node has a [0, 0, 0] scale.
    if (
      Matrix3.equalsEpsilon(
        Matrix4.getMatrix3(matrix, scratchInverseRotation),
        scratchMatrix3Zero,
        HEditorMath.EPSILON7
      ) &&
      Cartesian4.equals(
        Matrix4.getRow(matrix, 3, scratchBottomRow),
        scratchExpectedBottomRow
      )
    ) {
      result.values[0] = 0.0
      result.values[1] = 0.0
      result.values[2] = 0.0
      result.values[3] = 0.0
      result.values[4] = 0.0
      result.values[5] = 0.0
      result.values[6] = 0.0
      result.values[7] = 0.0
      result.values[8] = 0.0
      result.values[9] = 0.0
      result.values[10] = 0.0
      result.values[11] = 0.0
      result.values[12] = -matrix.values[12]
      result.values[13] = -matrix.values[13]
      result.values[14] = -matrix.values[14]
      result.values[15] = 1.0
      return result
    }

    throw new Error('matrix is not invertible because its determinate is zero.')
  }

  // calculate matrix inverse
  det = 1.0 / det

  result.values[0] = dst0 * det
  result.values[1] = dst1 * det
  result.values[2] = dst2 * det
  result.values[3] = dst3 * det
  result.values[4] = dst4 * det
  result.values[5] = dst5 * det
  result.values[6] = dst6 * det
  result.values[7] = dst7 * det
  result.values[8] = dst8 * det
  result.values[9] = dst9 * det
  result.values[10] = dst10 * det
  result.values[11] = dst11 * det
  result.values[12] = dst12 * det
  result.values[13] = dst13 * det
  result.values[14] = dst14 * det
  result.values[15] = dst15 * det
  return result
}
Matrix4.getMatrix3 = function (matrix: Matrix4, result?: Matrix3) {
  if (!result) {
    result = new Matrix3()
  }
  result.values[0] = matrix.values[0]
  result.values[1] = matrix.values[1]
  result.values[2] = matrix.values[2]
  result.values[3] = matrix.values[4]
  result.values[4] = matrix.values[5]
  result.values[5] = matrix.values[6]
  result.values[6] = matrix.values[8]
  result.values[7] = matrix.values[9]
  result.values[8] = matrix.values[10]
  return result
}
Matrix4.getRow = function (
  matrix: Matrix4,
  index: number,
  result?: Cartesian4
) {
  if (!result) {
    result = new Cartesian4()
  }
  result.x = matrix.values[index]
  result.y = matrix.values[index + 4]
  result.z = matrix.values[index + 8]
  result.w = matrix.values[index + 12]
  return result
}

// 局部坐标系下的基向量的长度, 相对于单位坐标系下的缩放
Matrix4.getScale = function (matrix: Matrix4, result?: Cartesian3) {
  if (!result) {
    result = new Cartesian3()
  }
  result.x = Cartesian3.magnitude(
    Cartesian3.fromElements(
      matrix.values[0],
      matrix.values[1],
      matrix.values[2]
    )
  )
  result.y = Cartesian3.magnitude(
    Cartesian3.fromElements(
      matrix.values[4],
      matrix.values[5],
      matrix.values[6]
    )
  )
  result.z = Cartesian3.magnitude(
    Cartesian3.fromElements(
      matrix.values[8],
      matrix.values[9],
      matrix.values[10]
    )
  )
  return result
}

const scaleScratch3 = new Cartesian3()

Matrix4.getMaximumScale = function (matrix: Matrix4) {
  Matrix4.getScale(matrix, scaleScratch3)
  return Cartesian3.maximumComponent(scaleScratch3)
}

// 目的: 快速计算两个仿射变换的乘积, 结果是一个仿射变换, 仿射变换矩阵的最后一行固定 [0, 0, 0, 1]
Matrix4.multiplyTransformation = function (
  left: Matrix4,
  right: Matrix4,
  result?: Matrix4
) {
  if (!result) {
    result = new Matrix4()
  }

  const left0 = left.values[0]
  const left1 = left.values[1]
  const left2 = left.values[2]
  const left4 = left.values[4]
  const left5 = left.values[5]
  const left6 = left.values[6]
  const left8 = left.values[8]
  const left9 = left.values[9]
  const left10 = left.values[10]
  const left12 = left.values[12]
  const left13 = left.values[13]
  const left14 = left.values[14]

  const right0 = right.values[0]
  const right1 = right.values[1]
  const right2 = right.values[2]
  const right4 = right.values[4]
  const right5 = right.values[5]
  const right6 = right.values[6]
  const right8 = right.values[8]
  const right9 = right.values[9]
  const right10 = right.values[10]
  const right12 = right.values[12]
  const right13 = right.values[13]
  const right14 = right.values[14]

  const column0Row0 = left0 * right0 + left4 * right1 + left8 * right2
  const column0Row1 = left1 * right0 + left5 * right1 + left9 * right2
  const column0Row2 = left2 * right0 + left6 * right1 + left10 * right2

  const column1Row0 = left0 * right4 + left4 * right5 + left8 * right6
  const column1Row1 = left1 * right4 + left5 * right5 + left9 * right6
  const column1Row2 = left2 * right4 + left6 * right5 + left10 * right6

  const column2Row0 = left0 * right8 + left4 * right9 + left8 * right10
  const column2Row1 = left1 * right8 + left5 * right9 + left9 * right10
  const column2Row2 = left2 * right8 + left6 * right9 + left10 * right10

  const column3Row0 =
    left0 * right12 + left4 * right13 + left8 * right14 + left12
  const column3Row1 =
    left1 * right12 + left5 * right13 + left9 * right14 + left13
  const column3Row2 =
    left2 * right12 + left6 * right13 + left10 * right14 + left14

  result.values[0] = column0Row0
  result.values[1] = column0Row1
  result.values[2] = column0Row2
  result.values[3] = 0.0
  result.values[4] = column1Row0
  result.values[5] = column1Row1
  result.values[6] = column1Row2
  result.values[7] = 0.0
  result.values[8] = column2Row0
  result.values[9] = column2Row1
  result.values[10] = column2Row2
  result.values[11] = 0.0
  result.values[12] = column3Row0
  result.values[13] = column3Row1
  result.values[14] = column3Row2
  result.values[15] = 1.0
  return result
}
