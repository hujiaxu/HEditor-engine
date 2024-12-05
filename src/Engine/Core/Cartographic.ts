export default class Cartographic {
  longitude: number
  latitude: number
  height: number

  constructor(
    longitude: number = 0.0,
    latitude: number = 0.0,
    height: number = 0.0
  ) {
    this.longitude = longitude
    this.latitude = latitude
    this.height = height
  }
}
