import { PickObject, PickObjects } from '../../type'
import Color from './Color'

export default class PickId {
  private _pickObjects: PickObjects
  public readonly key: number
  public readonly color: Color

  get pickObject() {
    return this._pickObjects[this.key]
  }

  set pickObject(pickObject: PickObject) {
    this._pickObjects[this.key] = pickObject
  }

  constructor(pickObjects: PickObjects, key: number, color: Color) {
    this._pickObjects = pickObjects
    this.key = key
    this.color = color
  }
}
