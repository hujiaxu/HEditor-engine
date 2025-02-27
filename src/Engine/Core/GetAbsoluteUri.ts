import * as Uri from 'urijs'
import defaultValue from './DefaultValue'
import defined from './Defined'
import DeveloperError from './DeveloperError'

/**
 * Given a relative Uri and a base Uri, returns the absolute Uri of the relative Uri.
 * @function
 *
 * @param {string} relative The relative Uri.
 * @param {string} [base] The base Uri.
 * @returns {string} The absolute Uri of the given relative Uri.
 *
 * @example
 * //absolute Uri will be "https://test.com/awesome.png";
 * const absoluteUri = Cesium.getAbsoluteUri('awesome.png', 'https://test.com');
 */
function getAbsoluteUri(relative: string, base?: string): string {
  let documentObject
  if (typeof document !== 'undefined') {
    documentObject = document
  }

  return getAbsoluteUri._implementation(relative, base, documentObject)
}

getAbsoluteUri._implementation = function (
  relative: string,
  base?: string,
  documentObject?: { baseURI: string; location: { href: string } }
) {
  // >>includeStart('debug', pragmas.debug);
  if (!defined(relative)) {
    throw new DeveloperError('relative uri is required.')
  }
  // >>includeEnd('debug');

  if (!defined(base)) {
    if (typeof documentObject === 'undefined') {
      return relative
    }
    base = defaultValue(documentObject.baseURI, documentObject.location.href)
  }

  const relativeUri = new Uri(relative)
  if (relativeUri.scheme() !== '') {
    return relativeUri.toString()
  }
  return relativeUri.absoluteTo(base).toString()
}
export default getAbsoluteUri
