import Defined from './Defined'

function compareNumber(a: number, b: number) {
  return b - a
}
export default class Event {
  private _listeners: Function[]
  private _scopes: Function[]
  private _toRemove: number[]
  private _insideRaiseEvent: boolean

  public get numberOfListeners() {
    return this._listeners.length - this._toRemove.length
  }

  constructor() {
    this._listeners = []
    this._scopes = []
    this._toRemove = []
    this._insideRaiseEvent = false
  }

  public raiseEvent(error?: any) {
    this._insideRaiseEvent = true

    let i
    const listeners = this._listeners
    const scopes = this._scopes
    let length = listeners.length

    for (i = 0; i < length; i++) {
      const listener = listeners[i]
      if (Defined(listener)) {
        listeners[i].apply(scopes[i], arguments)
      }
    }

    // Actually remove items removed in removeEventListener.
    const toRemove = this._toRemove
    length = toRemove.length
    if (length > 0) {
      toRemove.sort(compareNumber)
      for (i = 0; i < length; i++) {
        const index = toRemove[i]
        listeners.splice(index, 1)
        scopes.splice(index, 1)
      }
      toRemove.length = 0
    }

    this._insideRaiseEvent = false
  }
}
