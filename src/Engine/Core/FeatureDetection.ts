import { defined } from './Defined'

interface Navigator {
  userAgent: string
  appVersion: string
  pointerEnabled?: boolean
  appName: string
}
const originalNavigator = {
  userAgent: '',
  appVersion: '',
  pointerEnabled: false,
  appName: ''
}

let theNavigator: Navigator = originalNavigator
if (typeof navigator !== 'undefined') {
  theNavigator = navigator
} else {
  theNavigator = originalNavigator
}

const extractVersion = (str: string) => {
  const parts: (string | number)[] = str.split('.')
  for (let i = 0; i < parts.length; i++) {
    parts[i] = parseInt(parts[i] as string, 10)
  }

  return parts
}

let isEdgeResult = false
let edgeVersionResult: number[] = []
const isEdge = () => {
  if (!defined(isEdgeResult)) {
    isEdgeResult = false
    // eslint-disable-next-line no-useless-escape
    const fields = /Edg\/([\.0-9]+)/.exec(theNavigator.userAgent)
    if (fields !== null) {
      isEdgeResult = true
      edgeVersionResult = extractVersion(fields[1]) as number[]
    }
  }
  return isEdgeResult
}
const edgeVersion = () => {
  return isEdge() && edgeVersionResult
}

let isChromeResult = false
let chromeVersionResult: number[] = []

const isChrome = () => {
  if (!defined(isChromeResult)) {
    isChromeResult = false

    if (!isEdge()) {
      // eslint-disable-next-line no-useless-escape
      const fields = /Chrome\/([\.0-9]+)/.exec(theNavigator.userAgent)
      if (fields !== null) {
        isChromeResult = true
        chromeVersionResult = extractVersion(fields[1]) as number[]
      }
    }
  }

  return isChromeResult
}

const chromeVersion = () => {
  return isChrome() && chromeVersionResult
}

let isSafariResult = false
let safariVersionResult: number[] = []

const isSafari = () => {
  if (!defined(isSafariResult)) {
    isSafariResult = false
    if (
      !isChrome() &&
      !isEdge() &&
      // eslint-disable-next-line no-useless-escape
      / Safari\/[\.0-9]+/.test(theNavigator.userAgent)
    ) {
      // eslint-disable-next-line no-useless-escape
      const fields = /Version\/([\.0-9]+)/.exec(theNavigator.userAgent)
      if (fields !== null) {
        isSafariResult = true
        safariVersionResult = extractVersion(fields[1]) as number[]
      }
    }
  }
  return isSafariResult
}

const safariVersion = () => {
  return isSafari() && safariVersionResult
}

let isWebkitResult = false
let webkitVersionResult: (number | boolean)[] = []

const isWebkit = () => {
  if (!defined(isWebkitResult)) {
    isWebkitResult = false
    // eslint-disable-next-line no-useless-escape
    const fields = /AppleWebKit\/([\.0-9]+)(\+?)/.exec(theNavigator.userAgent)
    if (fields !== null) {
      isWebkitResult = true
      webkitVersionResult = extractVersion(fields[1]) as number[]
      if (fields[2]) {
        webkitVersionResult.push(!!fields[2])
      }
    }
  }
  return isWebkitResult
}

const webkitVersion = () => {
  return isWebkit() && webkitVersionResult
}

let isFirefoxResult = false
let firefoxVersionResult: number[] = []

const isFirefox = () => {
  if (!defined(isFirefoxResult)) {
    isFirefoxResult = false
    // eslint-disable-next-line no-useless-escape
    const fields = /Firefox\/([\.0-9]+)/.exec(theNavigator.userAgent)
    if (fields !== null) {
      isFirefoxResult = true
      firefoxVersionResult = extractVersion(fields[1]) as number[]
    }
  }
  return isFirefoxResult
}

const firefoxVersion = () => {
  return isFirefox() && firefoxVersionResult
}

let isWindowsResult = false
const isWindows = () => {
  if (!defined(isWindowsResult)) {
    isWindowsResult = /Windows/i.test(theNavigator.appVersion)
  }
  return isWindowsResult
}

let isIPadOrIOSResult = false
const isIPadOrIOS = () => {
  if (!defined(isIPadOrIOSResult)) {
    isIPadOrIOSResult =
      navigator.platform === 'iPhone' ||
      navigator.platform === 'iPod' ||
      navigator.platform === 'iPad'
  }
  return isIPadOrIOSResult
}

let hasPointerEvents = false
const supportsPointerEvents = () => {
  if (!defined(hasPointerEvents)) {
    hasPointerEvents =
      !isFirefox() &&
      typeof PointerEvent !== 'undefined' &&
      (!defined(theNavigator.pointerEnabled) || theNavigator.pointerEnabled)
  }
  return hasPointerEvents
}

let isInternetExplorerResult = false
let internetExplorerVersionResult: number[] = []
const isInternetExplorer = () => {
  if (!defined(isInternetExplorerResult)) {
    isInternetExplorerResult = false

    let fields
    if (theNavigator.appName === 'Microsoft Internet Explorer') {
      // eslint-disable-next-line no-useless-escape
      fields = /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(theNavigator.userAgent)
      if (fields !== null) {
        isInternetExplorerResult = true
        internetExplorerVersionResult = extractVersion(fields[1]) as number[]
      }
    } else if (theNavigator.appName === 'Netscape') {
      // eslint-disable-next-line no-useless-escape
      fields = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(
        theNavigator.userAgent
      )
      if (fields !== null) {
        isInternetExplorerResult = true
        internetExplorerVersionResult = extractVersion(fields[1]) as number[]
      }
    }
  }
  return isInternetExplorerResult
}

const internetExplorerVersion = () => {
  return isInternetExplorer() && internetExplorerVersionResult
}

const FeatureDetection = {
  isChrome: isChrome,
  chromeVersion: chromeVersion,
  isSafari: isSafari,
  safariVersion: safariVersion,
  isWebkit: isWebkit,
  webkitVersion: webkitVersion,
  isFirefox: isFirefox,
  firefoxVersion: firefoxVersion,
  isEdge: isEdge,
  edgeVersion: edgeVersion,
  isWindows: isWindows,
  isIPadOrIOS: isIPadOrIOS,
  supportsPointerEvents: supportsPointerEvents,
  internetExplorerVersion: internetExplorerVersion,
  isInternetExplorer: isInternetExplorer
}

export default FeatureDetection
