import { AssociativeArrayHash } from '../../type'

export default class AssociativeArray<T> {
  private _array: T[] = []
  private _hash: AssociativeArrayHash<T> = {}

  get values() {
    return this._array
  }

  get length() {
    return this._array.length
  }

  contains(key: string | number) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('key must be a string or number')
    }
    return this._hash[key] !== undefined
  }

  set(key: string | number, value: T) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('key must be a string or number')
    }
    const oldValue = this._hash[key]
    if (value !== oldValue) {
      this.remove(key)
      this._hash[key] = value
      this._array.push(value)
    }
  }

  get(key: string | number) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('key must be a string or number')
    }

    return this._hash[key]
  }

  remove(key: string | number) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('key must be a string or number')
    }

    const value = this._hash[key]
    const hasValue = value !== undefined
    if (hasValue) {
      const index = this._array.indexOf(value)
      if (index !== -1) {
        this._array.splice(index, 1)
        delete this._hash[key]
      }
    }

    return hasValue
  }

  removeAll() {
    this._array = []
    this._hash = {}
  }
}
