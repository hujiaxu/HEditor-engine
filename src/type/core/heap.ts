import Request from '../../Engine/Core/Request'

export type ComparatorType = <T extends Request>(a: T, b: T) => number
export interface HeapOptions {
  comparator: ComparatorType
}
