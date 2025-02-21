import Cartesian3 from './Cartesian3'
import Defined from './Defined'
interface EncodeResult {
  high: number
  low: number
}

export default class EncodedCartesian3 {
  public high: Cartesian3
  public low: Cartesian3
  static fromCartesian: (
    cartesian: Cartesian3,
    result?: EncodedCartesian3
  ) => EncodedCartesian3

  constructor(
    high: Cartesian3 = new Cartesian3(),
    low: Cartesian3 = new Cartesian3()
  ) {
    this.high = high
    this.low = low
  }
  static encode: (value: number, result?: EncodeResult) => EncodeResult
}

EncodedCartesian3.encode = function (value: number, result?: EncodeResult) {
  if (!Defined(result)) {
    result = {
      high: 0.0,
      low: 0.0
    }
  }
  let doubleHigh
  if (value >= 0.0) {
    doubleHigh = Math.floor(value / 65536.0) * 65536.0
    result.high = doubleHigh
    result.low = value - doubleHigh
  } else {
    doubleHigh = Math.floor(-value / 65536.0) * 65536.0
    result.high = -doubleHigh
    result.low = value + doubleHigh
  }
  return result
}

const scratchEncode = {
  high: 0.0,
  low: 0.0
}
EncodedCartesian3.fromCartesian = function (
  cartesian: Cartesian3,
  result: EncodedCartesian3 = new EncodedCartesian3()
) {
  const high = result.high
  const low = result.low

  EncodedCartesian3.encode(cartesian.x, scratchEncode)
  high.x = scratchEncode.high
  low.x = scratchEncode.low

  EncodedCartesian3.encode(cartesian.y, scratchEncode)
  high.y = scratchEncode.high
  low.y = scratchEncode.low

  EncodedCartesian3.encode(cartesian.z, scratchEncode)
  high.z = scratchEncode.high
  low.z = scratchEncode.low

  return result
}
