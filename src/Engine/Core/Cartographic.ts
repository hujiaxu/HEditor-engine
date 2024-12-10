import { defined } from './Defined'

export default class Cartographic {
  longitude: number
  latitude: number
  height: number
  static clone: (
    cartographic: Cartographic,
    result?: Cartographic
  ) => Cartographic

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
Cartographic.clone = (cartographic: Cartographic, result?: Cartographic) => {
  if (!defined(cartographic)) {
    throw new Error('cartographic is required.')
  }
  if (!defined(result)) {
    result = new Cartographic()
  }
  result.longitude = cartographic.longitude
  result.latitude = cartographic.latitude
  result.height = cartographic.height
  return result
}
