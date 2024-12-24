import defined from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmVhdHVyZURldGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9GZWF0dXJlRGV0ZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQVEvQixNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLFNBQVMsRUFBRSxFQUFFO0lBQ2IsVUFBVSxFQUFFLEVBQUU7SUFDZCxjQUFjLEVBQUUsS0FBSztJQUNyQixPQUFPLEVBQUUsRUFBRTtDQUNaLENBQUE7QUFFRCxJQUFJLFlBQVksR0FBYyxpQkFBaUIsQ0FBQTtBQUMvQyxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRSxDQUFDO0lBQ3JDLFlBQVksR0FBRyxTQUFTLENBQUE7QUFDMUIsQ0FBQztLQUFNLENBQUM7SUFDTixZQUFZLEdBQUcsaUJBQWlCLENBQUE7QUFDbEMsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7SUFDckMsTUFBTSxLQUFLLEdBQXdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDakQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN0QyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUE7QUFDZCxDQUFDLENBQUE7QUFFRCxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUE7QUFDeEIsSUFBSSxpQkFBaUIsR0FBYSxFQUFFLENBQUE7QUFDcEMsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO0lBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztRQUMzQixZ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