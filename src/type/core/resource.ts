import { Resource, Request, Proxy } from '../../Engine'

export type ResourceUrlType = string | Resource
export interface ResourceOptions {
  url: ResourceUrlType
  headers?: Object
  request?: Request
  proxy?: Proxy
  retryCallback?: Function
  retryAttempts?: number
  parseUrl?: boolean
  credits?: string
  queryParameters?: Object
  templateValues?: Object
}

export interface DerivedResourceOptions {
  url?: ResourceUrlType
  queryParameters?: Object
  templateValues?: Object
  headers?: Object

  proxy?: Proxy
  retryCallback?: Function
  request?: Request
  preserveQueryParameters?: boolean
  retryAttempts?: number
}

export interface FetchOptions {
  responseType?: string
  headers?: Object
  overrideMimeType?: string
  method?: string
  data?: string
}

export interface ImageBitmapFromBlobOptions {
  preferImageBitmap?: boolean
  flipY?: boolean
  skipColorSpaceConversion?: boolean
  premultiplyAlpha?: boolean
}

export interface ResourceFetchImageOptions extends ImageBitmapFromBlobOptions {
  preferBlob?: boolean
}
export interface FetchImageOptions extends ImageBitmapFromBlobOptions {
  resource: Resource
}
