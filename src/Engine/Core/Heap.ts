import { ComparatorType, HeapOptions } from '../../type'
import Check from './Check'
import Defined from './Defined'
import Request from './Request'

type ArrayType = (Request | undefined)[]
function swap(array: ArrayType, a: number, b: number) {
  const temp = array[a]
  array[a] = array[b]
  array[b] = temp
}
export default class Heap {
  private _comparator: ComparatorType
  private _array: ArrayType
  private _length: number
  private _maximumLength: number | undefined

  public get length() {
    return this._length
  }
  public get internalArray() {
    return this._array
  }
  public get maximumLength() {
    return this._maximumLength!
  }
  public set maximumLength(value: number) {
    // >>includeStart('debug', pragmas.debug);
    Check.typeOf.number.greaterThanOrEquals('maximumLength', value, 0)
    // >>includeEnd('debug');
    const originalLength = this._length
    if (value < originalLength) {
      const array = this._array
      // Remove trailing references
      for (let i = value; i < originalLength; ++i) {
        array[i] = undefined
      }
      this._length = value
      array.length = value
    }
    this._maximumLength = value
  }

  get comparator() {
    return this._comparator
  }
  constructor(options: HeapOptions) {
    // >>includeStart('debug', pragmas.debug);
    Check.typeOf.object('options', options)
    Check.defined('options.comparator', options.comparator)
    // >>includeEnd('debug');

    this._comparator = options.comparator
    this._array = []
    this._length = 0
    this._maximumLength = undefined
  }

  /**
   * Insert an element into the heap. If the length would grow greater than maximumLength
   * of the heap, extra elements are removed.
   *
   * @param {*} element The element to insert
   *
   * @return {*} The element that was removed from the heap if the heap is at full capacity.
   */
  public insert(element: Request) {
    // >>includeStart('debug', pragmas.debug);
    Check.defined('element', element)
    // >>includeEnd('debug');

    const array = this._array
    const comparator = this._comparator
    const maximumLength = this._maximumLength

    let index = this._length++
    if (index < array.length) {
      array[index] = element
    } else {
      array.push(element)
    }

    while (index !== 0) {
      const parent = Math.floor((index - 1) / 2)
      if (comparator(array[index]!, array[parent]!) < 0) {
        swap(array, index, parent)
        index = parent
      } else {
        break
      }
    }
    let removedElement

    if (Defined(maximumLength) && this._length > maximumLength) {
      removedElement = array[maximumLength]
      this._length = maximumLength
    }

    return removedElement
  }
}
