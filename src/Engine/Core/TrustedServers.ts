import Defined from './Defined'
import DeveloperError from './DeveloperError'
import * as Uri from 'urijs'

function getAuthority(url: string) {
  const uri = new Uri(url)
  uri.normalize()

  // Removes username:password@ so we just have host[:port]
  let authority = uri.authority()
  if (authority.length === 0) {
    return undefined // Relative URL
  }
  uri.authority(authority)

  if (authority.indexOf('@') !== -1) {
    const parts = authority.split('@')
    authority = parts[1]
  }

  // If the port is missing add one based on the scheme
  if (authority.indexOf(':') === -1) {
    let scheme = uri.scheme()
    if (scheme.length === 0) {
      scheme = window.location.protocol
      scheme = scheme.substring(0, scheme.length - 1)
    }
    if (scheme === 'http') {
      authority += ':80'
    } else if (scheme === 'https') {
      authority += ':443'
    } else {
      return undefined
    }
  }
  return authority
}

export default class TrustedServers {
  static contains: (url: string) => boolean
}
const _servers: { [authority: string]: boolean } = {}

TrustedServers.contains = (url: string) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(url)) {
    throw new DeveloperError('url is required.')
  }
  // >>includeEnd('debug');
  const authority = getAuthority(url)
  if (Defined(authority) && Defined(_servers[authority])) {
    return true
  }

  return false
}
