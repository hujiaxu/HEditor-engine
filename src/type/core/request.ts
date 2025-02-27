export enum RequestState {
  /**
   * Initial unissued state.
   *
   * @type {number}
   * @constant
   */
  UNISSUED = 0,
  /**
   * Issued but not yet active. Will become active when open slots are available.
   *
   * @type {number}
   * @constant
   */
  ISSUED = 1,

  /**
   * Actual http request has been sent.
   *
   * @type {number}
   * @constant
   */
  ACTIVE = 2,

  /**
   * Request completed successfully.
   *
   * @type {number}
   * @constant
   */
  RECEIVED = 3,

  /**
   * Request was cancelled, either explicitly or automatically because of low priority.
   *
   * @type {number}
   * @constant
   */
  CANCELLED = 4,

  /**
   * Request failed.
   *
   * @type {number}
   * @constant
   */
  FAILED = 5
}

export enum RequestType {
  /**
   * Terrain request.
   *
   * @type {number}
   * @constant
   */
  TERRAIN = 0,

  /**
   * Imagery request.
   *
   * @type {number}
   * @constant
   */
  IMAGERY = 1,

  /**
   * 3D Tiles request.
   *
   * @type {number}
   * @constant
   */
  TILES3D = 2,

  /**
   * Other request.
   *
   * @type {number}
   * @constant
   */
  OTHER = 3
}

export interface RequestOptions {
  url: string
  requestFunction?: Function
  cancelFunction?: Function
  priorityFunction?: Function
  priority?: number
  throttle?: boolean
  throttleByServer?: boolean
  type?: RequestType
  serverKey?: string
}
