import Defined from './Defined'

export default class DeveloperError {
  message: string
  stack: string | undefined
  readonly name: string = 'DeveloperError'
  constructor(message: string) {
    this.message = message

    /**
     * The explanation for why this exception was thrown.
     * @type {string}
     * @readonly
     */
    this.message = message

    // Browsers such as IE don't have a stack property until you actually throw the error.
    let stack
    try {
      throw new Error()
    } catch (e) {
      stack = (e as Error).stack
    }

    /**
     * The stack trace of this exception, if available.
     * @type {string}
     * @readonly
     */
    this.stack = stack
  }

  throwInstantiationError() {
    throw new DeveloperError(
      'This function defines an interface and should not be called directly.'
    )
  }
}

if (Defined(Object.create)) {
  // DeveloperError.prototype = Object.create(Error.prototype)
  DeveloperError.prototype.constructor = DeveloperError
}

DeveloperError.prototype.toString = function () {
  let str = `${this.name}: ${this.message}`

  if (Defined(this.stack)) {
    str += `\n${this.stack.toString()}`
  }

  return str
}
