export default class Rectangle {
  west: number
  south: number
  east: number
  north: number

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
