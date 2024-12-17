import { defined } from './Defined';
const originalNavigator = {
    userAgent: '',
    appVersion: '',
    pointerEnabled: false,
    appName: ''
};
let theNavigator = originalNavigator;
if (typeof navigator !== 'undefined') {
    theNavigator = navigator;
}
else {
    theNavigator = originalNavigator;
}
const extractVersion = (str) => {
    const parts = str.split('.');
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parseInt(parts[i], 10);
    }
    return parts;
};
let isEdgeResult = false;
let edgeVersionResult = [];
const isEdge = () => {
    if (!defined(isEdgeResult)) {
        isEdgeResult = false;
        // eslint-disable-next-line no-useless-escape
        const fields = /Edg\/([\.0-9]+)/.exec(theNavigator.userAgent);
        if (fields !== null) {
            isEdgeResult = true;
            edgeVersionResult = extractVersion(fields[1]);
        }
    }
    return isEdgeResult;
};
const edgeVersion = () => {
    return isEdge() && edgeVersionResult;
};
let isChromeResult = false;
let chromeVersionResult = [];
const isChrome = () => {
    if (!defined(isChromeResult)) {
        isChromeResult = false;
        if (!isEdge()) {
            // eslint-disable-next-line no-useless-escape
            const fields = /Chrome\/([\.0-9]+)/.exec(theNavigator.userAgent);
            if (fields !== null) {
                isChromeResult = true;
                chromeVersionResult = extractVersion(fields[1]);
            }
        }
    }
    return isChromeResult;
};
const chromeVersion = () => {
    return isChrome() && chromeVersionResult;
};
let isSafariResult = false;
let safariVersionResult = [];
const isSafari = () => {
    if (!defined(isSafariResult)) {
        isSafariResult = false;
        if (!isChrome() &&
            !isEdge() &&
            // eslint-disable-next-line no-useless-escape
            / Safari\/[\.0-9]+/.test(theNavigator.userAgent)) {
            // eslint-disable-next-line no-useless-escape
            const fields = /Version\/([\.0-9]+)/.exec(theNavigator.userAgent);
            if (fields !== null) {
                isSafariResult = true;
                safariVersionResult = extractVersion(fields[1]);
            }
        }
    }
    return isSafariResult;
};
const safariVersion = () => {
    return isSafari() && safariVersionResult;
};
let isWebkitResult = false;
let webkitVersionResult = [];
const isWebkit = () => {
    if (!defined(isWebkitResult)) {
        isWebkitResult = false;
        // eslint-disable-next-line no-useless-escape
        const fields = /AppleWebKit\/([\.0-9]+)(\+?)/.exec(theNavigator.userAgent);
        if (fields !== null) {
            isWebkitResult = true;
            webkitVersionResult = extractVersion(fields[1]);
            if (fields[2]) {
                webkitVersionResult.push(!!fields[2]);
            }
        }
    }
    return isWebkitResult;
};
const webkitVersion = () => {
    return isWebkit() && webkitVersionResult;
};
let isFirefoxResult = false;
let firefoxVersionResult = [];
const isFirefox = () => {
    if (!defined(isFirefoxResult)) {
        isFirefoxResult = false;
        // eslint-disable-next-line no-useless-escape
        const fields = /Firefox\/([\.0-9]+)/.exec(theNavigator.userAgent);
        if (fields !== null) {
            isFirefoxResult = true;
            firefoxVersionResult = extractVersion(fields[1]);
        }
    }
    return isFirefoxResult;
};
const firefoxVersion = () => {
    return isFirefox() && firefoxVersionResult;
};
let isWindowsResult = false;
const isWindows = () => {
    if (!defined(isWindowsResult)) {
        isWindowsResult = /Windows/i.test(theNavigator.appVersion);
    }
    return isWindowsResult;
};
let isIPadOrIOSResult = false;
const isIPadOrIOS = () => {
    if (!defined(isIPadOrIOSResult)) {
        isIPadOrIOSResult =
            navigator.platform === 'iPhone' ||
                navigator.platform === 'iPod' ||
                navigator.platform === 'iPad';
    }
    return isIPadOrIOSResult;
};
let hasPointerEvents = false;
const supportsPointerEvents = () => {
    if (!defined(hasPointerEvents)) {
        hasPointerEvents =
            !isFirefox() &&
                typeof PointerEvent !== 'undefined' &&
                (!defined(theNavigator.pointerEnabled) || theNavigator.pointerEnabled);
    }
    return hasPointerEvents;
};
let isInternetExplorerResult = false;
let internetExplorerVersionResult = [];
const isInternetExplorer = () => {
    if (!defined(isInternetExplorerResult)) {
        isInternetExplorerResult = false;
        let fields;
        if (theNavigator.appName === 'Microsoft Internet Explorer') {
            // eslint-disable-next-line no-useless-escape
            fields = /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(theNavigator.userAgent);
            if (fields !== null) {
                isInternetExplorerResult = true;
                internetExplorerVersionResult = extractVersion(fields[1]);
            }
        }
        else if (theNavigator.appName === 'Netscape') {
            // eslint-disable-next-line no-useless-escape
            fields = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(theNavigator.userAgent);
            if (fields !== null) {
                isInternetExplorerResult = true;
                internetExplorerVersionResult = extractVersion(fields[1]);
            }
        }
    }
    return isInternetExplorerResult;
};
const internetExplorerVersion = () => {
    return isInternetExplorer() && internetExplorerVersionResult;
};
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
};
export default FeatureDetection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmVhdHVyZURldGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9GZWF0dXJlRGV0ZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFRbkMsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixTQUFTLEVBQUUsRUFBRTtJQUNiLFVBQVUsRUFBRSxFQUFFO0lBQ2QsY0FBYyxFQUFFLEtBQUs7SUFDckIsT0FBTyxFQUFFLEVBQUU7Q0FDWixDQUFBO0FBRUQsSUFBSSxZQUFZLEdBQWMsaUJBQWlCLENBQUE7QUFDL0MsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLEVBQUUsQ0FBQztJQUNyQyxZQUFZLEdBQUcsU0FBUyxDQUFBO0FBQzFCLENBQUM7S0FBTSxDQUFDO0lBQ04sWUFBWSxHQUFHLGlCQUFpQixDQUFBO0FBQ2xDLENBQUM7QUFFRCxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFO0lBQ3JDLE1BQU0sS0FBSyxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBO0FBRUQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFBO0FBQ3hCLElBQUksaUJBQWlCLEdBQWEsRUFBRSxDQUFBO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtJQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENB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