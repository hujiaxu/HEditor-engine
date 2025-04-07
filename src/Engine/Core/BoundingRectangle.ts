import Defined from './Defined'

export default class BoundingRectangle {
  x: number
  y: number
  width: number
  height: number
  static clone: (
    rectangle: BoundingRectangle,
    result?: BoundingRectangle
  ) => BoundingRectangle

  constructor(
    x: number = 0.0,
    y: number = 0.0,
    width: number = 0.0,
    height: number = 0.0
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

BoundingRectangle.clone = function (
  rectangle: BoundingRectangle,
  result?: BoundingRectangle
) {
  if (!Defined(result)) {
    return new BoundingRectangle(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height
    )
  }
  result.x = rectangle.x
  result.y = rectangle.y
  result.width = rectangle.width
  result.height = rectangle.height
  return result
}
