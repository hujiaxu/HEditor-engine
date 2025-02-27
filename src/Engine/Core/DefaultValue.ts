const defaultValue = <T>(a: T | undefined, b: T) => {
  if (a !== undefined && a !== null) {
    return a
  }
  return b
}

defaultValue.EMPTY_OBJECT = Object.create({})
export default defaultValue
