import {
  DeferResult,
  DerivedResourceOptions,
  ResourceFetchImageOptions,
  FetchOptions,
  RequestState,
  ResourceOptions,
  ResourceUrlType,
  FetchImageOptions,
  ImageBitmapFromBlobOptions
} from '../../type'
import clone from './Clone'
import defaultValue from './DefaultValue'
import Defined from './Defined'
import Request from './Request'
import Proxy from './Proxy'
import * as Uri from 'urijs'
import queryToObject from './QuerytoObject'
import combine from './Combine'
import getAbsoluteUri from './GetAbsoluteUri'
import defer from './Defer'
import RuntimeError from './RuntimeError'
import DeveloperError from './DeveloperError'
import RequestErrorEvent from './RequestErrorEvent'
import TrustedServers from './TrustedServers'
import RequestScheduler from './RequestScheduler'
import appendForwardSlash from './appendForwardSlash'
import isDataUri from './isDataUri'
import isBlobUri from './isBlobUri'
import getImagePixels from './getImagePixels'
import isCrossOriginUrl from './isCrossOriginUrl'
import Check from './Check'

const xhrBlobSupported = (function () {
  try {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '#', true)
    xhr.responseType = 'blob'
    return xhr.responseType === 'blob'
  } catch (e) {
    return false
  }
})()

/**
 * Clones a value if it is defined, otherwise returns the default value
 *
 * @param {object} [value] The value to clone.
 * @param {object} [defaultValue] The default value.
 *
 * @returns {object} A clone of value or the defaultValue.
 *
 * @private
 */
function defaultClone(value: any, defaultValue: {}) {
  return Defined(value) ? clone(value) : defaultValue
}

/**
 * Parses a query string and returns the object equivalent.
 *
 * @param {string} queryString The query string
 * @returns {object}
 *
 * @private
 */
function parseQueryString(queryString: string) {
  if (queryString.length === 0) {
    return {}
  }

  // Special case where the querystring is just a string, not key/value pairs
  if (queryString.indexOf('=') === -1) {
    return { [queryString]: undefined }
  }

  return queryToObject(queryString)
}

/**
 * This combines a map of query parameters.
 *
 * @param {object} q1 The first map of query parameters. Values in this map will take precedence if preserveQueryParameters is false.
 * @param {object} q2 The second map of query parameters.
 * @param {boolean} preserveQueryParameters If true duplicate parameters will be concatenated into an array. If false, keys in q1 will take precedence.
 *
 * @returns {object} The combined map of query parameters.
 *
 * @example
 * const q1 = {
 *   a: 1,
 *   b: 2
 * };
 * const q2 = {
 *   a: 3,
 *   c: 4
 * };
 * const q3 = {
 *   b: [5, 6],
 *   d: 7
 * }
 *
 * // Returns
 * // {
 * //   a: [1, 3],
 * //   b: 2,
 * //   c: 4
 * // };
 * combineQueryParameters(q1, q2, true);
 *
 * // Returns
 * // {
 * //   a: 1,
 * //   b: 2,
 * //   c: 4
 * // };
 * combineQueryParameters(q1, q2, false);
 *
 * // Returns
 * // {
 * //   a: 1,
 * //   b: [2, 5, 6],
 * //   d: 7
 * // };
 * combineQueryParameters(q1, q3, true);
 *
 * // Returns
 * // {
 * //   a: 1,
 * //   b: 2,
 * //   d: 7
 * // };
 * combineQueryParameters(q1, q3, false);
 *
 * @private
 */
function combineQueryParameters(
  q1: Object,
  q2: Object,
  preserveQueryParameters: boolean
) {
  if (!preserveQueryParameters) {
    return combine(q1, q2)
  }

  const result = clone(q1, true)
  for (const param in q2) {
    if (q2.hasOwnProperty(param)) {
      let value = result[param]
      // @ts-expect-error Type 'string' is not assignable to type 'string | undefined'.
      const q2Value = q2[param]
      if (Defined(value)) {
        if (!Array.isArray(value)) {
          value = result[param] = [value]
        }

        result[param] = value.concat(q2Value)
      } else {
        result[param] = Array.isArray(q2Value) ? q2Value.slice() : q2Value
      }
    }
  }

  return result
}

/**
 * Checks to make sure the Resource isn't already being requested.
 *
 * @param {Request} request The request to check.
 *
 * @private
 */
function checkAndResetRequest(request: Request) {
  if (
    request.state === RequestState.ISSUED ||
    request.state === RequestState.ACTIVE
  ) {
    throw new RuntimeError('The Resource is already being fetched.')
  }

  request.state = RequestState.UNISSUED
  request.deferred = undefined
}

/**
 * Fetches an image and returns a promise to it.
 *
 * @param {object} [options] An object with the following properties.
 * @param {Resource} [options.resource] Resource object that points to an image to fetch.
 * @param {boolean} [options.preferImageBitmap] If true, image will be decoded during fetch and an <code>ImageBitmap</code> is returned.
 * @param {boolean} [options.flipY] If true, image will be vertically flipped during decode. Only applies if the browser supports <code>createImageBitmap</code>.
 * @param {boolean} [options.skipColorSpaceConversion=false] If true, any custom gamma or color profiles in the image will be ignored. Only applies if the browser supports <code>createImageBitmap</code>.
 * @private
 */
function fetchImage(options: FetchImageOptions) {
  const resource = options.resource
  const flipY = options.flipY
  const skipColorSpaceConversion = options.skipColorSpaceConversion
  const preferImageBitmap = options.preferImageBitmap

  const request = resource.request
  request.url = resource.url

  request.requestFunction = function () {
    let crossOrigin = false

    // data URIs can't have crossorigin set.
    if (!resource.isDataUri && !resource.isBlobUri) {
      crossOrigin = resource.isCrossOriginUrl
    }

    const deferred = defer()
    Resource._Implementations.createImage(
      request,
      crossOrigin,
      deferred,
      flipY,
      skipColorSpaceConversion,
      preferImageBitmap
    )

    return deferred.promise
  }

  const promise = RequestScheduler.request(request)
  if (!Defined(promise)) {
    return
  }
  return promise.catch(function (e: RequestErrorEvent) {
    // Don't retry cancelled or otherwise aborted requests
    if (request.state !== RequestState.FAILED) {
      return Promise.reject(e)
    }
    return resource.retryOnError(e).then(function (retry) {
      if (retry) {
        // Reset request so it can try again
        request.state = RequestState.UNISSUED
        request.deferred = undefined

        return fetchImage({
          resource: resource,
          flipY: flipY,
          skipColorSpaceConversion: skipColorSpaceConversion,
          preferImageBitmap: preferImageBitmap
        })
      }
      return Promise.reject(e)
    })
  })
}

export default class Resource {
  public headers: Object
  public request: Request
  proxy: Proxy | undefined
  retryCallback: Function | undefined
  retryAttempts: number
  private _retryCount: number
  private _url!: ResourceUrlType
  private _credits: string | undefined
  private _templateValues: Object
  private _queryParameters: Object
  static createIfNeeded: (resource: Resource | string) => Resource
  static _Implementations: any
  static fetchArrayBuffer: (options: string | ResourceOptions) => any
  static supportsImageBitmapOptions: () => Promise<boolean>
  static fetchBlob: (options: string | ResourceOptions) => any
  static createImageBitmapFromBlob: (
    blob: ImageBitmapSource,
    options: ImageBitmapFromBlobOptions
  ) => Promise<ImageBitmap>

  public get credits() {
    return this._credits
  }
  public get url() {
    return this._url
  }
  public get retryCount() {
    return this._retryCount
  }
  public get templateValues() {
    return this._templateValues
  }
  public get queryParameters() {
    return this._queryParameters
  }
  /**
   * True if the Resource refers to a data URI.
   *
   * @memberof Resource.prototype
   * @type {boolean}
   */
  public get isDataUri() {
    return isDataUri(this._url as string)
  }

  /**
   * True if the Resource refers to a blob URI.
   *
   * @memberof Resource.prototype
   * @type {boolean}
   */
  public get isBlobUri() {
    return isBlobUri(this._url as string)
  }

  /**
   * True if the Resource has request headers. This is equivalent to checking if the headers property has any keys.
   *
   * @memberof Resource.prototype
   * @type {boolean}
   */
  public get hasHeaders() {
    return Object.keys(this.headers).length > 0
  }

  public get isCrossOriginUrl() {
    return isCrossOriginUrl(this._url as string)
  }
  constructor(options: ResourceOptions | string) {
    if (typeof options === 'string') {
      options = {
        url: options
      }
    }
    this._url = options.url
    this._templateValues = defaultClone(options.templateValues, {})
    this._queryParameters = defaultClone(options.queryParameters, {})

    /**
     * Additional HTTP headers that will be sent with the request.
     *
     * @type {object}
     */
    this.headers = defaultClone(options.headers, {})

    /**
     * A Request object that will be used. Intended for internal use only.
     *
     * @type {Request}
     */
    this.request = defaultValue(
      options.request,
      new Request({
        url: options.url as string
      })
    )

    /**
     * A proxy to be used when loading the resource.
     *
     * @type {Proxy}
     */
    this.proxy = options.proxy

    /**
     * Function to call when a request for this resource fails. If it returns true or a Promise that resolves to true, the request will be retried.
     *
     * @type {Function}
     */
    this.retryCallback = options.retryCallback

    /**
     * The number of times the retryCallback should be called before giving up.
     *
     * @type {number}
     */
    this.retryAttempts = defaultValue(options.retryAttempts, 0)
    this._retryCount = 0

    const parseUrl = defaultValue(options.parseUrl, true)
    if (parseUrl) {
      this.parseUrl(options.url, true, true)
    } else {
      this._url = options.url
    }

    this._credits = options.credits
  }

  public clone(result?: Resource) {
    if (!Defined(result)) {
      return new Resource({
        url: this._url,
        queryParameters: this.queryParameters,
        templateValues: this.templateValues,
        headers: this.headers,
        proxy: this.proxy,
        retryCallback: this.retryCallback,
        retryAttempts: this.retryAttempts,
        request: this.request.clone(),
        parseUrl: false,
        credits: Defined(this.credits) ? this.credits.slice() : undefined
      })
    }
    result._url = this._url
    result._queryParameters = clone(this._queryParameters)
    result._templateValues = clone(this._templateValues)
    result.headers = clone(this.headers)
    result.proxy = this.proxy
    result.retryCallback = this.retryCallback
    result.retryAttempts = this.retryAttempts
    result._retryCount = 0
    result.request = this.request.clone()

    return result
  }

  public parseUrl(
    url: ResourceUrlType,
    merge: boolean,
    preserveQuery: boolean,
    baseUrl?: ResourceUrlType
  ) {
    let uri = new Uri(url)
    const query = parseQueryString(uri.query())

    this._queryParameters = merge
      ? combineQueryParameters(query, this.queryParameters, preserveQuery)
      : query

    // Remove unneeded info from the Uri
    uri.search('')
    uri.fragment('')

    if (Defined(baseUrl) && uri.scheme() === '') {
      uri = uri.absoluteTo(getAbsoluteUri(baseUrl as string))
    }
    this._url = uri.toString()
  }

  public getDerivedResource(options: DerivedResourceOptions) {
    const resource = this.clone()!
    resource._retryCount = 0

    if (Defined(options.url)) {
      const preserveQuery = defaultValue(options.preserveQueryParameters, false)
      resource.parseUrl(options.url, true, preserveQuery, this._url)
    }

    if (Defined(options.queryParameters)) {
      resource._queryParameters = combine(
        options.queryParameters,
        resource.queryParameters
      )
    }
    if (Defined(options.templateValues)) {
      resource._templateValues = combine(
        options.templateValues,
        resource.templateValues
      )
    }
    if (Defined(options.headers)) {
      resource.headers = combine(options.headers, resource.headers)
    }
    if (Defined(options.proxy)) {
      resource.proxy = options.proxy
    }
    if (Defined(options.request)) {
      resource.request = options.request
    }
    if (Defined(options.retryCallback)) {
      resource.retryCallback = options.retryCallback
    }
    if (Defined(options.retryAttempts)) {
      resource.retryAttempts = options.retryAttempts
    }

    return resource
  }

  public fetchArrayBuffer() {
    return this.fetch({
      responseType: 'arraybuffer'
    })
  }

  public fetch(options: FetchOptions) {
    options = defaultClone(options, {})
    options.method = 'GET'

    return this._makeRequest(options)
  }

  /**
   * Asynchronously loads the given image resource.  Returns a promise that will resolve to
   * an {@link https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap|ImageBitmap} if <code>preferImageBitmap</code> is true and the browser supports <code>createImageBitmap</code> or otherwise an
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|Image} once loaded, or reject if the image failed to load.
   *
   * @param {object} [options] An object with the following properties.
   * @param {boolean} [options.preferBlob=false] If true, we will load the image via a blob.
   * @param {boolean} [options.preferImageBitmap=false] If true, image will be decoded during fetch and an <code>ImageBitmap</code> is returned.
   * @param {boolean} [options.flipY=false] If true, image will be vertically flipped during decode. Only applies if the browser supports <code>createImageBitmap</code>.
   * @param {boolean} [options.skipColorSpaceConversion=false] If true, any custom gamma or color profiles in the image will be ignored. Only applies if the browser supports <code>createImageBitmap</code>.
   * @returns {Promise<ImageBitmap|HTMLImageElement>|undefined} a promise that will resolve to the requested data when loaded. Returns undefined if <code>request.throttle</code> is true and the request does not have high enough priority.
   *
   *
   * @example
   * // load a single image asynchronously
   * resource.fetchImage().then(function(image) {
   *     // use the loaded image
   * }).catch(function(error) {
   *     // an error occurred
   * });
   *
   * // load several images in parallel
   * Promise.all([resource1.fetchImage(), resource2.fetchImage()]).then(function(images) {
   *     // images is an array containing all the loaded images
   * });
   *
   * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
   * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
   */
  public fetchImage(options: ResourceFetchImageOptions = {}) {
    const preferImageBitmap = defaultValue(options.preferImageBitmap, false)
    const preferBlob = defaultValue(options.preferBlob, false)
    const flipY = defaultValue(options.flipY, false)
    const skipColorSpaceConversion = defaultValue(
      options.skipColorSpaceConversion,
      false
    )

    checkAndResetRequest(this.request)
    // We try to load the image normally if
    // 1. Blobs aren't supported
    // 2. It's a data URI
    // 3. It's a blob URI
    // 4. It doesn't have request headers and we preferBlob is false
    if (
      !xhrBlobSupported ||
      this.isDataUri ||
      this.isBlobUri ||
      (!this.hasHeaders && !preferBlob)
    ) {
      return fetchImage({
        resource: this,
        flipY: flipY,
        skipColorSpaceConversion: skipColorSpaceConversion,
        preferImageBitmap: preferImageBitmap
      })
    }

    const blobPromise = this.fetchBlob()
    if (!Defined(blobPromise)) {
      return
    }

    let supportsImageBitmap
    let useImageBitmap: boolean
    let generatedBlobResource: Resource
    let generatedBlob: any
    return Resource.supportsImageBitmapOptions()
      .then((result) => {
        supportsImageBitmap = result
        useImageBitmap = preferImageBitmap && supportsImageBitmap
        return blobPromise
      })
      .then((blob) => {
        if (!Defined(blob)) {
          return
        }
        generatedBlob = blob
        if (useImageBitmap) {
          return Resource.createImageBitmapFromBlob(blob, {
            flipY: flipY,
            premultiplyAlpha: false,
            skipColorSpaceConversion: skipColorSpaceConversion
          })
        }
        const blobUrl = window.URL.createObjectURL(blob)
        generatedBlobResource = new Resource({
          url: blobUrl
        })

        return fetchImage({
          resource: generatedBlobResource,
          flipY: flipY,
          skipColorSpaceConversion: skipColorSpaceConversion,
          preferImageBitmap: false
        })
      })
      .then((image) => {
        if (!Defined(image)) {
          return
        }

        // The blob object may be needed for use by a TileDiscardPolicy,
        // so attach it to the image.
        image.blob = generatedBlob

        if (useImageBitmap) {
          return image
        }
        window.URL.revokeObjectURL(generatedBlobResource.url as string)
        return image
      })
      .catch((error) => {
        if (Defined(generatedBlobResource)) {
          window.URL.revokeObjectURL(generatedBlobResource.url as string)
        }
        // If the blob load succeeded but the image decode failed, attach the blob
        // to the error object for use by a TileDiscardPolicy.
        // In particular, BingMapsImageryProvider uses this to detect the
        // zero-length response that is returned when a tile is not available.
        error.blob = generatedBlob

        return Promise.reject(error)
      })
  }

  /**
   * Asynchronously loads the given resource as a blob.  Returns a promise that will resolve to
   * a Blob once loaded, or reject if the resource failed to load.  The data is loaded
   * using XMLHttpRequest, which means that in order to make requests to another origin,
   * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
   *
   * @returns {Promise<Blob>|undefined} a promise that will resolve to the requested data when loaded. Returns undefined if <code>request.throttle</code> is true and the request does not have high enough priority.
   *
   * @example
   * // load a single URL asynchronously
   * resource.fetchBlob().then(function(blob) {
   *     // use the data
   * }).catch(function(error) {
   *     // an error occurred
   * });
   *
   * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
   * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
   */
  public fetchBlob() {
    return this.fetch({
      responseType: 'blob'
    })
  }

  /**
   * Called when a resource fails to load. This will call the retryCallback function if defined until retryAttempts is reached.
   *
   * @param {RequestErrorEvent} [error] The error that was encountered.
   *
   * @returns {Promise<boolean>} A promise to a boolean, that if true will cause the resource request to be retried.
   *
   * @private
   */
  public retryOnError(error: RequestErrorEvent): Promise<boolean> {
    const retryCallback = this.retryCallback
    if (
      typeof retryCallback !== 'function' ||
      this._retryCount >= this.retryAttempts
    ) {
      return Promise.resolve(false)
    }

    const that = this
    return Promise.resolve(retryCallback(this, error)).then(function (result) {
      ++that._retryCount

      return result
    })
  }

  public appendForwardSlash() {
    this._url = appendForwardSlash(this._url as string)
  }

  private _makeRequest(options: FetchOptions) {
    const resource = this
    checkAndResetRequest(resource.request)

    const request = resource.request
    const url = resource.url
    request.url = url

    request.requestFunction = function () {
      const responseType = options.responseType
      const headers = combine(options.headers, resource.headers)
      const overrideMimeType = options.overrideMimeType
      const method = options.method
      const data = options.data
      const deferred = defer()
      const xhr = Resource._Implementations.loadWithXhr(
        url,
        responseType,
        method,
        data,
        headers,
        deferred,
        overrideMimeType
      )
      if (Defined(xhr) && Defined(xhr.abort)) {
        request.cancelFunction = function () {
          xhr.abort()
        }
      }
      return deferred.promise
    }

    const promise = RequestScheduler.request(request)
    if (!Defined(promise)) {
      return
    }

    return promise
      .then(function (data: any) {
        // explicitly set to undefined to ensure GC of request response data. See #8843
        request.cancelFunction = undefined
        return data
      })
      .catch(function (e: RequestErrorEvent) {
        request.cancelFunction = undefined
        if (request.state !== RequestState.FAILED) {
          return Promise.reject(e)
        }

        return resource
          .retryOnError(e as RequestErrorEvent)
          .then(function (retry) {
            if (retry) {
              // Reset request so it can try again
              request.state = RequestState.UNISSUED
              request.deferred = undefined

              return resource.fetch(options)
            }

            return Promise.reject(e)
          })
      })
  }
}

Resource.createIfNeeded = (resource: Resource | string) => {
  if (resource instanceof Resource) {
    // Keep existing request object. This function is used internally to duplicate a Resource, so that it can't
    //  be modified outside of a class that holds it (eg. an imagery or terrain provider). Since the Request objects
    //  are managed outside of the providers, by the tile loading code, we want to keep the request property the same so if it is changed
    //  in the underlying tiling code the requests for this resource will use it.
    return resource.getDerivedResource({
      request: resource.request
    })
  }
  if (typeof resource !== 'string') {
    return resource
  }

  return new Resource({
    url: resource
  })
}

const dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/

function decodeDataUriText(isBase64: boolean, data: string) {
  const result = decodeURIComponent(data)
  if (isBase64) {
    return atob(result)
  }
  return result
}
function decodeDataUriArrayBuffer(isBase64: boolean, data: string) {
  const byteString = decodeDataUriText(isBase64, data)
  const buffer = new ArrayBuffer(byteString.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < byteString.length; i++) {
    view[i] = byteString.charCodeAt(i)
  }
  return buffer
}
function decodeDataUri(
  dataUriRegexResult: RegExpExecArray,
  responseType: string
) {
  responseType = defaultValue(responseType, '')
  const mimeType = dataUriRegexResult[1]
  const isBase64 = !!dataUriRegexResult[2]
  const data = dataUriRegexResult[3]
  let buffer
  let parser

  switch (responseType) {
    case '':
    case 'text':
      return decodeDataUriText(isBase64, data)
    case 'arraybuffer':
      return decodeDataUriArrayBuffer(isBase64, data)
    case 'blob':
      buffer = decodeDataUriArrayBuffer(isBase64, data)
      return new Blob([buffer], {
        type: mimeType
      })
    case 'document':
      parser = new DOMParser()
      return parser.parseFromString(
        decodeDataUriText(isBase64, data),
        mimeType as DOMParserSupportedType
      )
    case 'json':
      return JSON.parse(decodeDataUriText(isBase64, data))
    default:
      // >>includeStart('debug', pragmas.debug);
      throw new DeveloperError(`Unhandled responseType: ${responseType}`)
    // >>includeEnd('debug');
  }
}

function loadWithHttpRequest(
  url: string,
  responseType: string,
  method: string,
  data: string,
  headers: { [key: string]: string },
  deferred: DeferResult,
  overrideMimeType: string
) {
  // Note: only the 'json' and 'text' responseTypes transforms the loaded buffer
  fetch(url, {
    method,
    headers
  })
    .then(async (response) => {
      if (!response.ok) {
        const responseHeaders: { [key: string]: string } = {}
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value
        })
        deferred.reject(
          new RequestErrorEvent(response.status, response, responseHeaders)
        )
        return
      }

      switch (responseType) {
        case 'text':
          deferred.resolve(response.text())
          break
        case 'json':
          deferred.resolve(response.json())
          break
        default:
          deferred.resolve(new Uint8Array(await response.arrayBuffer()).buffer)
          break
      }
    })
    .catch(() => {
      deferred.reject(new RequestErrorEvent())
    })
}
const noXMLHttpRequest = typeof XMLHttpRequest === 'undefined'
Resource._Implementations.loadWithXhr = function (
  url: string,
  responseType: XMLHttpRequestResponseType,
  method: string,
  data: string,
  headers: { [key: string]: string },
  deferred: DeferResult,
  overrideMimeType: string
) {
  const dataUriRegexResult = dataUriRegex.exec(url)
  if (dataUriRegexResult !== null) {
    deferred.resolve(decodeDataUri(dataUriRegexResult, responseType))
    return
  }
  if (noXMLHttpRequest) {
    loadWithHttpRequest(
      url,
      responseType,
      method,
      data,
      headers,
      deferred,
      overrideMimeType
    )
    return
  }

  const xhr = new XMLHttpRequest()

  if (TrustedServers.contains(url)) {
    xhr.withCredentials = true
  }
  xhr.open(method, url, true)

  if (Defined(overrideMimeType) && Defined(xhr.overrideMimeType)) {
    xhr.overrideMimeType(overrideMimeType)
  }

  if (Defined(headers)) {
    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key])
      }
    }
  }
  if (Defined(responseType)) {
    xhr.responseType = responseType
  }

  // While non-standard, file protocol always returns a status of 0 on success
  let localFile = false
  if (typeof url === 'string') {
    localFile =
      url.indexOf('file://') === 0 ||
      (typeof window !== 'undefined' && window.location.origin === 'file://')
  }

  xhr.onload = function () {
    if (
      (xhr.status < 200 || xhr.status >= 300) &&
      !(localFile && xhr.status === 0)
    ) {
      deferred.reject(
        new RequestErrorEvent(
          xhr.status,
          xhr.response,
          xhr.getAllResponseHeaders()
        )
      )
      return
    }

    const response = xhr.response
    const browserResponseType = xhr.responseType
    if (method === 'HEAD' || method === 'OPTIONS') {
      const responseHeaderString = xhr.getAllResponseHeaders()
      const splitHeaders = responseHeaderString.trim().split(/[\r\n]+/)

      const responseHeaders: { [key: string]: string } = {}
      splitHeaders.forEach(function (line) {
        const parts = line.split(': ')
        const header = parts.shift()!
        responseHeaders[header] = parts.join(': ')
      })

      deferred.resolve(responseHeaders)
      return
    }

    // All modern browsers will go into either the first or second if block or last else block.
    // Other code paths support older browsers that either do not support the supplied responseType
    // or do not support the xhr.response property.
    if (xhr.status === 204) {
      // accept no content
      deferred.resolve(undefined)
    } else if (
      Defined(response) &&
      (!Defined(responseType) || browserResponseType === responseType)
    ) {
      deferred.resolve(response)
    } else if (responseType === 'json' && typeof response === 'string') {
      try {
        deferred.resolve(JSON.parse(response))
      } catch (e) {
        deferred.reject(e)
      }
    } else if (
      (browserResponseType === '' || browserResponseType === 'document') &&
      Defined(xhr.responseXML) &&
      xhr.responseXML.hasChildNodes()
    ) {
      deferred.resolve(xhr.responseXML)
    } else if (
      (browserResponseType === '' || browserResponseType === 'text') &&
      Defined(xhr.responseText)
    ) {
      deferred.resolve(xhr.responseText)
    } else {
      deferred.reject(new RuntimeError('Invalid XMLHttpRequest response type.'))
    }
  }

  xhr.onerror = function (e) {
    deferred.reject(new RequestErrorEvent())
  }

  xhr.send(data)

  return xhr
}

Resource.fetchArrayBuffer = function (options: string | ResourceOptions) {
  const resource = new Resource(options)
  return resource.fetchArrayBuffer()
}

Resource.fetchBlob = function (options: string | ResourceOptions) {
  const resource = new Resource(options)
  return resource.fetchBlob()
}

let supportsImageBitmapOptionsPromise: Promise<boolean>
/**
 * A helper function to check whether createImageBitmap supports passing ImageBitmapOptions.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if this browser supports creating an ImageBitmap with options.
 *
 * @private
 */
Resource.supportsImageBitmapOptions = function () {
  // Until the HTML folks figure out what to do about this, we need to actually try loading an image to
  // know if this browser supports passing options to the createImageBitmap function.
  // https://github.com/whatwg/html/pull/4248
  //
  // We also need to check whether the colorSpaceConversion option is supported.
  // We do this by loading a PNG with an embedded color profile, first with
  // colorSpaceConversion: "none" and then with colorSpaceConversion: "default".
  // If the pixel color is different then we know the option is working.
  // As of Webkit 17612.3.6.1.6 the createImageBitmap promise resolves but the
  // option is not actually supported.

  if (Defined(supportsImageBitmapOptionsPromise)) {
    return supportsImageBitmapOptionsPromise
  }

  if (typeof createImageBitmap !== 'function') {
    supportsImageBitmapOptionsPromise = Promise.resolve(false)
    return supportsImageBitmapOptionsPromise
  }

  const imageDataUri =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAABGdBTUEAAE4g3rEiDgAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAADElEQVQI12Ng6GAAAAEUAIngE3ZiAAAAAElFTkSuQmCC'

  supportsImageBitmapOptionsPromise = Resource.fetchBlob({
    url: imageDataUri
  })
    .then(function (blob: ImageBitmapSource) {
      const imageBitmapOptions: ImageBitmapOptions = {
        imageOrientation: 'flipY', // default is "none"
        premultiplyAlpha: 'none', // default is "default"
        colorSpaceConversion: 'none' // default is "default"
      }
      return Promise.all([
        createImageBitmap(blob, imageBitmapOptions),
        createImageBitmap(blob)
      ])
    })
    .then(function (imageBitmaps: ImageBitmap[]) {
      // Check whether the colorSpaceConversion option had any effect on the green channel
      const colorWithOptions = getImagePixels(imageBitmaps[0])
      const colorWithDefaults = getImagePixels(imageBitmaps[1])
      return colorWithOptions[1] !== colorWithDefaults[1]
    })
    .catch(function () {
      return false
    })

  return supportsImageBitmapOptionsPromise
}

Resource.createImageBitmapFromBlob = function (
  blob: ImageBitmapSource,
  options: ImageBitmapFromBlobOptions
) {
  Check.defined('options', options)
  Check.typeOf.bool('options.flipY', options.flipY)
  Check.typeOf.bool('options.premultiplyAlpha', options.premultiplyAlpha)
  Check.typeOf.bool(
    'options.skipColorSpaceConversion',
    options.skipColorSpaceConversion
  )

  return createImageBitmap(blob, {
    imageOrientation: options.flipY ? 'flipY' : 'none',
    premultiplyAlpha: options.premultiplyAlpha ? 'premultiply' : 'none',
    colorSpaceConversion: options.skipColorSpaceConversion ? 'none' : 'default'
  })
}
