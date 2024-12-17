export default class Rectangle {
  west: number
  south: number
  east: number
  north: number
  static fromDegrees: (
    west: number,
    south: number,
    east: number,
    north: number,
    result?: Rectangle | undefined
  ) => Rectangle

  constructor(
    west: number = 0.0,
    south: number = 0.0,
    east: number = 0.0,
    north: number = 0.0
  ) {
    this.west = west
    this.south = south
    this.east = east
    this.north = north
  }
}
Rectangle.fromDegrees = function (
  west: number,
  south: number,
  east: number,
  north: number,
  result: Rectangle = new Rectangle()
) {
  result.east = east
  result.south = south
  result.west = west
  result.north = north
  return new Rectangle(west, south, east, north)
}
