import Defined from './Defined'
import DeveloperError from './DeveloperError'
import getAbsoluteUri from './GetAbsoluteUri'
import Resource from './Resource'

/* global CESIUM_BASE_URL,define,require*/

const cesiumScriptRegex = /((?:.*\/)|^)Cesium\.js(?:\?|\#|$)/
function getBaseUrlFromCesiumScript() {
  const scripts = document.getElementsByTagName('script')
  for (let i = 0, len = scripts.length; i < len; ++i) {
    const src = scripts[i].getAttribute('src')
    const result = cesiumScriptRegex.exec(src!)
    if (result !== null) {
      return result[1]
    }
  }
  return undefined
}

let a: HTMLAnchorElement | undefined
function tryMakeAbsolute(url: string) {
  if (typeof document === 'undefined') {
    // Node.js and Web Workers. In both cases, the URL will already be absolute.
    return url
  }

  if (!Defined(a)) {
    a = document.createElement('a')
  }
  a.href = url
  return a.href
}

let baseResource: Resource
function getCesiumBaseUrl() {
  if (Defined(baseResource)) {
    return baseResource
  }
  let baseUrlString
  // @ts-expect-error global
  if (typeof CESIUM_BASE_URL !== 'undefined') {
    // @ts-expect-error global
    baseUrlString = CESIUM_BASE_URL
  } else if (Defined(import.meta.url)) {
    // ESM
    baseUrlString = getAbsoluteUri('.', import.meta.url)
  } else if (
    // @ts-expect-error global
    typeof define === 'object' &&
    // @ts-expect-error global
    Defined(define.amd) &&
    // @ts-expect-error global
    !define.amd.toUrlUndefined &&
    // @ts-expect-error global
    Defined(require.toUrl)
  ) {
    // RequireJS
    baseUrlString = getAbsoluteUri(
      '..',
      buildModuleUrl('Core/buildModuleUrl.js')
    )
  } else {
    // IIFE
    baseUrlString = getBaseUrlFromCesiumScript()
  }

  // >>includeStart('debug', pragmas.debug);
  if (!Defined(baseUrlString)) {
    throw new DeveloperError(
      'Unable to determine Cesium base URL automatically, try defining a global variable called CESIUM_BASE_URL.'
    )
  }
  // >>includeEnd('debug');

  baseResource = new Resource({
    url: tryMakeAbsolute(baseUrlString)
  })
  baseResource.appendForwardSlash()

  return baseResource
}
function buildModuleUrlFromRequireToUrl(moduleID: string) {
  // moduleID will be non-relative, so require it relative to this module, in Core.
  // @ts-expect-error Node module
  return tryMakeAbsolute(require.toUrl(`../${moduleID}`))
}

function buildModuleUrlFromBaseUrl(moduleID: string) {
  const resource = getCesiumBaseUrl().getDerivedResource({
    url: moduleID
  })
  return resource.url
}

let implementation: Function
export default function buildModuleUrl(relativeUrl?: string) {
  if (!Defined(implementation)) {
    // select implementation
    if (
      // @ts-expect-error global
      typeof define === 'object' &&
      // @ts-expect-error global
      Defined(define.amd) &&
      // @ts-expect-error global
      !define.amd.toUrlUndefined &&
      // @ts-expect-error global
      Defined(require.toUrl)
    ) {
      implementation = buildModuleUrlFromRequireToUrl
    } else {
      implementation = buildModuleUrlFromBaseUrl
    }
  }
  const url = implementation(relativeUrl)
  return url
}
/**
 * Gets the base URL for resolving modules.
 *
 * @function
 * @returns {string} The configured base URL
 */
buildModuleUrl.getCesiumBaseUrl = getCesiumBaseUrl
