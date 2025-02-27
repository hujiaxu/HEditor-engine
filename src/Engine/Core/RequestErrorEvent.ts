import Defined from './Defined'
import parseResponseHeaders from './ParseResponseHeaders'

export default class RequestErrorEvent {
  statusCode: number | undefined
  response: object | undefined
  responseHeaders: string | object | undefined
  constructor(
    statusCode?: number,
    response?: object,
    responseHeaders?: object | string
  ) {
    /**
     * The HTTP error status code, such as 404.  If the error does not have a particular
     * HTTP code, this property will be undefined.
     *
     * @type {number}
     */
    this.statusCode = statusCode

    /**
     * The response included along with the error.  If the error does not include a response,
     * this property will be undefined.
     *
     * @type {object}
     */
    this.response = response

    /**
     * The headers included in the response, represented as an object literal of key/value pairs.
     * If the error does not include any headers, this property will be undefined.
     *
     * @type {object}
     */
    this.responseHeaders = responseHeaders

    if (typeof this.responseHeaders === 'string') {
      this.responseHeaders = parseResponseHeaders(this.responseHeaders)
    }
  }

  public toString() {
    let str = 'Request has failed.'
    if (Defined(this.statusCode)) {
      str += ` Status Code: ${this.statusCode}`
    }
    return str
  }
}
