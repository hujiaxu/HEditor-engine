import defaultValue from './DefaultValue'
import Defined from './Defined'

interface CombineObject {
  [x: string]: unknown
}

function combine(object1: any, object2: any, deep: boolean = false) {
  deep = defaultValue(deep, false)

  const result: { [x: string]: unknown } = {}

  const object1Defined = Defined(object1)
  const object2Defined = Defined(object2)
  let property
  let object1Value
  let object2Value
  if (object1Defined) {
    for (property in object1) {
      if (object1.hasOwnProperty(property)) {
        object1Value = object1[property]
        if (
          object2Defined &&
          deep &&
          typeof object1Value === 'object' &&
          object2.hasOwnProperty(property)
        ) {
          object2Value = object2[property]
          if (typeof object2Value === 'object') {
            result[property] = combine(
              object1Value as CombineObject,
              object2Value as CombineObject,
              deep
            )
          } else {
            result[property] = object1Value
          }
        } else {
          result[property] = object1Value
        }
      }
    }
  }
  if (object2Defined) {
    for (property in object2) {
      if (
        object2.hasOwnProperty(property) &&
        !result.hasOwnProperty(property)
      ) {
        object2Value = object2[property]
        result[property] = object2Value
      }
    }
  }
  return result
}
export default combine
