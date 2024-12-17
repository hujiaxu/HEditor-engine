declare const FeatureDetection: {
    isChrome: () => boolean;
    chromeVersion: () => false | number[];
    isSafari: () => boolean;
    safariVersion: () => false | number[];
    isWebkit: () => boolean;
    webkitVersion: () => false | (number | boolean)[];
    isFirefox: () => boolean;
    firefoxVersion: () => false | number[];
    isEdge: () => boolean;
    edgeVersion: () => false | number[];
    isWindows: () => boolean;
    isIPadOrIOS: () => boolean;
    supportsPointerEvents: () => boolean;
    internetExplorerVersion: () => false | number[];
    isInternetExplorer: () => boolean;
};
export default FeatureDetection;
