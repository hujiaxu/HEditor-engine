import { RequestState, ResourceUrlType } from '../../type'
import Check from './Check'
import isBlobUri from './isBlobUri'
import isDataUri from './isDataUri'
import Request from './Request'
import Event from './Event'
import Defined from './Defined'
import * as Uri from 'urijs'
import defaultValue from './DefaultValue'
import defer from './Defer'
import Heap from './Heap'

function sortRequests(a: Request, b: Request) {
  return a.priority - b.priority
}
function cancelRequest(request: Request) {
  const active = request.state === RequestState.ACTIVE
  request.state = RequestState.CANCELLED
  ++statistics.numberOfCancelledRequests
  // check that deferred has not been cleared since cancelRequest can be called
  // on a finished request, e.g. by clearForSpecs during tests
  if (Defined(request.deferred)) {
    const deferred = request.deferred
    request.deferred = undefined
    deferred.reject()
  }

  if (active) {
    --statistics.numberOfActiveRequests
    --numberOfActiveRequestsByServer[request.serverKey!]
    ++statistics.numberOfCancelledActiveRequests
  }

  if (Defined(request.cancelFunction)) {
    request.cancelFunction()
  }
}
const statistics = {
  numberOfAttemptedRequests: 0,
  numberOfActiveRequests: 0,
  numberOfCancelledRequests: 0,
  numberOfCancelledActiveRequests: 0,
  numberOfFailedRequests: 0,
  numberOfActiveRequestsEver: 0,
  lastNumberOfActiveRequests: 0
}
const pageUri =
  typeof document !== 'undefined' ? new Uri(document.location.href) : new Uri()
const numberOfActiveRequestsByServer: { [serverKey: string]: number } = {}
const requestCompletedEvent = new Event()

const requestHeap = new Heap({
  comparator: sortRequests
})
const activeRequests: Request[] = []

function issueRequest(request: Request) {
  if (request.state === RequestState.UNISSUED) {
    request.state = RequestState.ISSUED
    request.deferred = defer()
  }
  return request.deferred!.promise
}

function startRequest(request: Request) {
  const promise = issueRequest(request)
  request.state = RequestState.ACTIVE
  activeRequests.push(request)
  ++statistics.numberOfActiveRequests
  ++statistics.numberOfActiveRequestsEver
  ++numberOfActiveRequestsByServer[request.serverKey!]
  request.requestFunction!()
    .then(getRequestReceivedFunction(request))
    .catch(getRequestFailedFunction(request))
  return promise
}

function getRequestReceivedFunction(request: Request) {
  return function (results: any) {
    if (request.state === RequestState.CANCELLED) {
      // If the data request comes back but the request is cancelled, ignore it.
      return
    }
    // explicitly set to undefined to ensure GC of request response data. See #8843
    const deferred = request.deferred

    --statistics.numberOfActiveRequests
    --numberOfActiveRequestsByServer[request.serverKey!]
    requestCompletedEvent.raiseEvent()
    request.state = RequestState.RECEIVED
    request.deferred = undefined

    deferred!.resolve(results)
  }
}

function getRequestFailedFunction(request: Request) {
  return function (error: any) {
    if (request.state === RequestState.CANCELLED) {
      // If the data request comes back but the request is cancelled, ignore it.
      return
    }
    ++statistics.numberOfFailedRequests
    --statistics.numberOfActiveRequests
    --numberOfActiveRequestsByServer[request.serverKey!]
    requestCompletedEvent.raiseEvent()
    request.state = RequestState.FAILED
    request.deferred!.reject(error)
  }
}

function updatePriority(request: Request) {
  if (Defined(request.priorityFunction)) {
    request.priority = request.priorityFunction()
  }
}

export default class RequestScheduler {
  static throttleRequests: boolean
  static requestsByServer: { [serverKey: string]: number }
  static maximumRequests: number
  static maximumRequestsPerServer: number
  static serverHasOpenSlots: (
    serverKey: string,
    desiredRequests?: number
  ) => boolean
  static request: (request: Request) => any
  static getServerKey(url: ResourceUrlType): string | undefined {
    throw new Error('Method not implemented.')
  }
}

/**
 * The maximum number of simultaneous active requests. Un-throttled requests do not observe this limit.
 * @type {number}
 * @default 50
 */
RequestScheduler.maximumRequests = 50

/**
 * The maximum number of simultaneous active requests per server. Un-throttled requests or servers specifically
 * listed in {@link requestsByServer} do not observe this limit.
 * @type {number}
 * @default 18
 */
RequestScheduler.maximumRequestsPerServer = 18

RequestScheduler.getServerKey = (url: string) => {
  // >>includeStart('debug', pragmas.debug);
  Check.typeOf.string('url', url)
  // >>includeEnd('debug');

  let uri = new Uri(url)
  if (uri.scheme() === '') {
    uri = uri.absoluteTo(pageUri)
    uri.normalize()
  }

  let serverKey = uri.authority()

  if (!/:/.test(serverKey)) {
    // If the authority does not contain a port number, add port 443 for https or port 80 for http
    serverKey = `${serverKey}:${uri.scheme() === 'https' ? '443' : '80'}`
  }

  const length = numberOfActiveRequestsByServer[serverKey]
  if (!Defined(length)) {
    numberOfActiveRequestsByServer[serverKey] = 0
  }

  return serverKey
}

/**
 * Specifies if the request scheduler should throttle incoming requests, or let the browser queue requests under its control.
 * @type {boolean}
 * @default true
 */
RequestScheduler.throttleRequests = true

/**
 * A per server key list of overrides to use for throttling instead of <code>maximumRequestsPerServer</code>.
 * Useful when streaming data from a known HTTP/2 or HTTP/3 server.
 * @type {object}
 *
 * @example
 * RequestScheduler.requestsByServer["myserver.com:443"] = 18;
 *
 * @example
 * RequestScheduler.requestsByServer = {
 *   "api.cesium.com:443": 18,
 *   "assets.cesium.com:443": 18,
 * };
 */
RequestScheduler.requestsByServer = {}
/**
 * Check if there are open slots for a particular server key. If desiredRequests is greater than 1, this checks if the queue has room for scheduling multiple requests.
 * @param {string} serverKey The server key returned by {@link RequestScheduler.getServerKey}.
 * @param {number} [desiredRequests=1] How many requests the caller plans to request
 * @return {boolean} True if there are enough open slots for <code>desiredRequests</code> more requests.
 * @private
 */
RequestScheduler.serverHasOpenSlots = function (
  serverKey: string,
  desiredRequests = 1
) {
  desiredRequests = defaultValue(desiredRequests, 1)

  const maxRequests = defaultValue(
    RequestScheduler.requestsByServer[serverKey],
    RequestScheduler.maximumRequestsPerServer
  )
  const hasOpenSlotsServer =
    numberOfActiveRequestsByServer[serverKey] + desiredRequests <= maxRequests

  return hasOpenSlotsServer
}

RequestScheduler.request = (request: Request) => {
  // >>includeStart('debug', pragmas.debug);
  Check.typeOf.object('request', request)
  Check.typeOf.string('request.url', request.url)
  Check.typeOf.func('request.requestFunction', request.requestFunction)
  // >>includeEnd('debug');

  if (isDataUri(request.url as string) || isBlobUri(request.url as string)) {
    requestCompletedEvent.raiseEvent()
    request.state = RequestState.RECEIVED
    return request.requestFunction!()
  }

  ++statistics.numberOfAttemptedRequests

  if (!Defined(request.serverKey)) {
    request.serverKey = RequestScheduler.getServerKey(request.url)
  }

  if (
    RequestScheduler.throttleRequests &&
    request.throttleByServer &&
    !RequestScheduler.serverHasOpenSlots(request.serverKey!)
  ) {
    // Server is saturated. Try again later.
    return undefined
  }

  if (!RequestScheduler.throttleRequests || !request.throttle) {
    return startRequest(request)
  }

  if (activeRequests.length >= RequestScheduler.maximumRequests) {
    // Active requests are saturated. Try again later.
    return undefined
  }

  // Insert into the priority heap and see if a request was bumped off. If this request is the lowest
  // priority it will be returned.
  updatePriority(request)
  const removedRequest = requestHeap.insert(request)

  if (Defined(removedRequest)) {
    if (removedRequest === request) {
      // Request does not have high enough priority to be issued
      return undefined
    }
    // A previously issued request has been bumped off the priority heap, so cancel it
    cancelRequest(removedRequest)
  }

  return issueRequest(request)
}
