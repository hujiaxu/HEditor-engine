const defaultValue = <T>(a: T | undefined, b: T) => {
  if (a !== undefined && a !== null) {
    return a
  }
  return b
}

defaultValue.EMPTY_OBJECT = Object.freeze({})
export default defaultValue
