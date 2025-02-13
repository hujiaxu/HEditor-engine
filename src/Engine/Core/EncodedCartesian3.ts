import Defined from "./Defined"
interface EncodeResult {
  high: number
  low: number
}

export default class EncodedCartesian3 {
  static encode: (value: number, result?: EncodeResult) => EncodeResult
}

EncodedCartesian3.encode = function (value: number, result?: EncodeResult) {
  if (!Defined(result)) {
    result = {
      high: 0.0,
      low: 0.0
    }
  }
  let doubleHigh;
  if (value >= 0.0) {
    doubleHigh = Math.floor(value / 65536.0) * 65536.0;
    result.high = doubleHigh;
    result.low = value - doubleHigh;
  } else {
    doubleHigh = Math.floor(-value / 65536.0) * 65536.0;
    result.high = -doubleHigh;
    result.low = value + doubleHigh;
  }
  return result;
}
