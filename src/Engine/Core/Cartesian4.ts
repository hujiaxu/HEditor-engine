import defined from './Defined'

export default class Cartesian4 {
  x: number
  y: number
  z: number
  w: number
  static UNIT_W: Cartesian4
  static clone: (cartesian: Cartesian4, result?: Cartesian4) => Cartesian4
  static fromElements: (
    x: number,
    y: number,
    z: number,
    w: number,
    result?: Cartesian4
  ) => Cartesian4
  static unpack: (
    array: number[],
    index: number,
    result?: Cartesian4
  ) => Cartesian4
  static unpackFloat: (packedFloat: Cartesian4) => number
  static equals: (left: Cartesian4, right: Cartesian4) => boolean
  static pack: (
    cartesian: Cartesian4,
    array?: number[] | Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>,
    startIndex?: number
  ) => number[] | Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>
  static packFloat: (float: number, result?: Cartesian4) => Cartesian4

  constructor(x?: number, y?: number, z?: number, w?: number) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
    this.w = w || 0
  }
}

Cartesian4.clone = (cartesian: Cartesian4, result?: Cartesian4) => {
  if (!defined(cartesian)) {
    throw new Error('cartesian is required.')
  }
  if (!defined(result)) {
    result = new Cartesian4()
  }
  result.x = cartesian.x
  result.y = cartesian.y
  result.z = cartesian.z
  result.w = cartesian.w
  return result
}
Cartesian4.fromElements = function (
  x: number,
  y: number,
  z: number,
  w: number,
  result?: Cartesian4
) {
  if (!defined(result)) {
    return new Cartesian4(x, y, z, w)
  }
  result.x = x
  result.y = y
  result.z = z
  result.w = w
  return result
}

Cartesian4.UNIT_W = Cartesian4.clone(new Cartesian4(0.0, 0.0, 0.0, 1.0))

Cartesian4.unpack = function (
  array: number[],
  index: number,
  result?: Cartesian4
) {
  if (!result) {
    result = new Cartesian4()
  }
  result.x = array[index]
  result.y = array[index + 1]
  result.z = array[index + 2]
  result.w = array[index + 3]
  return result
}
// scratchU8Array and scratchF32Array are views into the same buffer
const scratchF32Array = new Float32Array(1)
const scratchU8Array = new Uint8Array(scratchF32Array.buffer)

const testU32 = new Uint32Array([0x11223344])
const testU8 = new Uint8Array(testU32.buffer)
const littleEndian = testU8[0] === 0x44

Cartesian4.unpackFloat = function (packedFloat: Cartesian4) {
  // scratchU8Array and scratchF32Array are views into the same buffer
  if (littleEndian) {
    scratchU8Array[0] = packedFloat.x
    scratchU8Array[1] = packedFloat.y
    scratchU8Array[2] = packedFloat.z
    scratchU8Array[3] = packedFloat.w
  } else {
    // convert from little-endian to big-endian
    scratchU8Array[0] = packedFloat.w
    scratchU8Array[1] = packedFloat.z
    scratchU8Array[2] = packedFloat.y
    scratchU8Array[3] = packedFloat.x
  }
  return scratchF32Array[0]
}
Cartesian4.equals = function (left: Cartesian4, right: Cartesian4) {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.z === right.z &&
    left.w === right.w
  )
}
Cartesian4.pack = function (
  cartesian: Cartesian4,
  array?: number[] | Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>,
  startIndex?: number
) {
  if (!array) {
    array = []
  }
  startIndex = startIndex || 0
  array[startIndex] = cartesian.x
  array[startIndex + 1] = cartesian.y
  array[startIndex + 2] = cartesian.z
  array[startIndex + 3] = cartesian.w
  return array
}
Cartesian4.packFloat = function (float: number, result?: Cartesian4) {
  if (!result) {
    return new Cartesian4(float, float, float, 1.0)
  }

  // scratchU8Array and scratchF32Array are views into the same buffer
  scratchF32Array[0] = float

  if (littleEndian) {
    result.x = scratchU8Array[0]
    result.y = scratchU8Array[1]
    result.z = scratchU8Array[2]
    result.w = scratchU8Array[3]
  } else {
    result.x = scratchU8Array[3]
    result.y = scratchU8Array[2]
    result.z = scratchU8Array[1]
    result.w = scratchU8Array[0]
  }
  return result
}
