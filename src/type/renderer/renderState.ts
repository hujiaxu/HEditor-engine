import { BoundingRectangle, Color, WebGLConstants } from '../../Engine'

export enum CullFace {
  FRONT = WebGLConstants.FRONT,
  BACK = WebGLConstants.BACK,
  FRONT_AND_BACK = WebGLConstants.FRONT_AND_BACK
}
export enum DepthFunction {
  /**
   * The depth test never passes.
   *
   * @type {number}
   * @constant
   */
  NEVER = WebGLConstants.NEVER,

  /**
   * The depth test passes if the incoming depth is less than the stored depth.
   *
   * @type {number}
   * @constant
   */
  LESS = WebGLConstants.LESS,

  /**
   * The depth test passes if the incoming depth is equal to the stored depth.
   *
   * @type {number}
   * @constant
   */
  EQUAL = WebGLConstants.EQUAL,

  /**
   * The depth test passes if the incoming depth is less than or equal to the stored depth.
   *
   * @type {number}
   * @constant
   */
  LEQUAL = WebGLConstants.LEQUAL,

  /**
   * The depth test passes if the incoming depth is greater than the stored depth.
   *
   * @type {number}
   * @constant
   */
  GREATER = WebGLConstants.GREATER,

  /**
   * The depth test passes if the incoming depth is not equal to the stored depth.
   *
   * @type {number}
   * @constant
   */
  NOT_EQUAL = WebGLConstants.NOTEQUAL,

  /**
   * The depth test passes if the incoming depth is greater than or equal to the stored depth.
   *
   * @type {number}
   * @constant
   */
  GREATER_OR_EQUAL = WebGLConstants.GEQUAL,

  /**
   * The depth test always passes.
   *
   * @type {number}
   * @constant
   */
  ALWAYS = WebGLConstants.ALWAYS
}

export interface Cull {
  enabled?: boolean
  face?: number
}
export interface PolygonOffset {
  enabled?: boolean
  factor?: number
  units?: number
}
export interface ScissorTest {
  enabled?: boolean
  rectangle?: BoundingRectangle
}

export interface DepthRange {
  near?: number
  far?: number
}

export interface DepthTest {
  enabled?: boolean
  func?: number
}
export interface ColorMask {
  red?: boolean
  green?: boolean
  blue?: boolean
  alpha?: boolean
}

export interface Blending {
  enabled?: boolean
  color?: Color
  equationRgb?: number
  equationAlpha?: number
  functionSourceRgb?: number
  functionSourceAlpha?: number
  functionDestinationRgb?: number
  functionDestinationAlpha?: number
}

export interface StencilTest {
  enabled?: boolean
  frontFunction?: number
  backFunction?: number
  reference?: number
  mask?: number
  frontOperation?: {
    fail?: number
    zFail?: number
    zPass?: number
  }
  backOperation?: {
    fail?: number
    zFail?: number
    zPass?: number
  }
}

export interface SampleCoverage {
  enabled?: boolean
  value?: number
  invert?: boolean
}

export interface RenderStateOptions {
  cull?: Cull

  lineWidth?: number

  polygonOffset?: PolygonOffset

  scissorTest?: ScissorTest

  depthRange?: DepthRange

  depthTest?: DepthTest

  colorMask?: ColorMask

  depthMask?: boolean

  stencilMask?: number

  blending?: Blending

  stencilTest?: StencilTest

  sampleCoverage?: SampleCoverage

  viewport?: BoundingRectangle
}
