import defaultValue from './DefaultValue'

const scratchArrayBuffer = new ArrayBuffer(4)
const scratchUint32Array = new Uint32Array(scratchArrayBuffer)
const scratchUint8Array = new Uint8Array(scratchArrayBuffer)

export default class Color {
  static floatToByte: (f: number) => number

  red: number
  green: number
  blue: number
  alpha: number
  static byteToFloat: (b: number) => number
  static fromBytes: (
    r: number,
    g: number,
    b: number,
    a: number,
    result?: Color
  ) => Color
  static fromRgba: (rgba: number, result?: Color) => Color

  constructor(red?: number, green?: number, blue?: number, alpha?: number) {
    this.red = defaultValue(red, 0.0)
    this.green = defaultValue(green, 0.0)
    this.blue = defaultValue(blue, 0.0)
    this.alpha = defaultValue(alpha, 1.0)
  }
}

Color.floatToByte = function (f: number) {
  return f === 1.0 ? 255.0 : (f * 255.0) | 0
}
Color.byteToFloat = function (b: number) {
  return b / 255.0
}
Color.fromBytes = function (
  r: number,
  g: number,
  b: number,
  a: number,
  result?: Color
) {
  result = result || new Color()
  result.red = Color.byteToFloat(defaultValue(r, 255.0))
  result.green = Color.byteToFloat(defaultValue(g, 255.0))
  result.blue = Color.byteToFloat(defaultValue(b, 255.0))
  result.alpha = Color.byteToFloat(defaultValue(a, 255.0))
  return result
}
Color.fromRgba = function (rgba: number, result?: Color) {
  scratchUint32Array[0] = rgba

  return Color.fromBytes(
    scratchUint8Array[0],
    scratchUint8Array[1],
    scratchUint8Array[2],
    scratchUint8Array[3],
    result
  )
}
