import {
  Blending,
  ColorMask,
  Cull,
  DepthRange,
  DepthTest,
  PolygonOffset,
  RenderStateOptions,
  SampleCoverage,
  ScissorTest,
  StencilTest
} from '../../type'
import BoundingRectangle from '../Core/BoundingRectangle'
import Color from '../Core/Color'
import defaultValue from '../Core/DefaultValue'
import Defined from '../Core/Defined'
import DeveloperError from '../Core/DeveloperError'
import WebGLConstants from '../Core/WebGLConstants'
import WindingOrder from '../Core/WindingOrder'
import ContextLimits from './ContextLimits'
import freezeRenderState from './freezeRenderState'

function validateStencilFunction(stencilFunction: number) {
  return (
    stencilFunction === WebGLConstants.NEVER ||
    stencilFunction === WebGLConstants.LESS ||
    stencilFunction === WebGLConstants.EQUAL ||
    stencilFunction === WebGLConstants.LEQUAL ||
    stencilFunction === WebGLConstants.GREATER ||
    stencilFunction === WebGLConstants.NOTEQUAL ||
    stencilFunction === WebGLConstants.GEQUAL ||
    stencilFunction === WebGLConstants.ALWAYS
  )
}

function validateStencilOperation(stencilOperation: number) {
  return (
    stencilOperation === WebGLConstants.ZERO ||
    stencilOperation === WebGLConstants.KEEP ||
    stencilOperation === WebGLConstants.REPLACE ||
    stencilOperation === WebGLConstants.INCR ||
    stencilOperation === WebGLConstants.DECR ||
    stencilOperation === WebGLConstants.INVERT ||
    stencilOperation === WebGLConstants.INCR_WRAP ||
    stencilOperation === WebGLConstants.DECR_WRAP
  )
}

function validateBlendEquation(blendEquation: number) {
  return (
    blendEquation === WebGLConstants.FUNC_ADD ||
    blendEquation === WebGLConstants.FUNC_SUBTRACT ||
    blendEquation === WebGLConstants.FUNC_REVERSE_SUBTRACT ||
    blendEquation === WebGLConstants.MIN ||
    blendEquation === WebGLConstants.MAX
  )
}
function validateBlendFunction(blendFunction: number) {
  return (
    blendFunction === WebGLConstants.ZERO ||
    blendFunction === WebGLConstants.ONE ||
    blendFunction === WebGLConstants.SRC_COLOR ||
    blendFunction === WebGLConstants.ONE_MINUS_SRC_COLOR ||
    blendFunction === WebGLConstants.DST_COLOR ||
    blendFunction === WebGLConstants.ONE_MINUS_DST_COLOR ||
    blendFunction === WebGLConstants.SRC_ALPHA ||
    blendFunction === WebGLConstants.ONE_MINUS_SRC_ALPHA ||
    blendFunction === WebGLConstants.DST_ALPHA ||
    blendFunction === WebGLConstants.ONE_MINUS_DST_ALPHA ||
    blendFunction === WebGLConstants.CONSTANT_COLOR ||
    blendFunction === WebGLConstants.ONE_MINUS_CONSTANT_COLOR ||
    blendFunction === WebGLConstants.CONSTANT_ALPHA ||
    blendFunction === WebGLConstants.ONE_MINUS_CONSTANT_ALPHA ||
    blendFunction === WebGLConstants.SRC_ALPHA_SATURATE
  )
}
function validateCullFace(cullFace: number = -1) {
  return (
    cullFace === WebGLConstants.FRONT ||
    cullFace === WebGLConstants.BACK ||
    cullFace === WebGLConstants.FRONT_AND_BACK
  )
}
function validateDepthFunction(depthFunction: number) {
  return (
    depthFunction === WebGLConstants.NEVER ||
    depthFunction === WebGLConstants.LESS ||
    depthFunction === WebGLConstants.EQUAL ||
    depthFunction === WebGLConstants.LEQUAL ||
    depthFunction === WebGLConstants.GREATER ||
    depthFunction === WebGLConstants.NOTEQUAL ||
    depthFunction === WebGLConstants.GEQUAL ||
    depthFunction === WebGLConstants.ALWAYS
  )
}

/**
 * Validates and then finds or creates an immutable render state, which defines the pipeline
 * state for a {@link DrawCommand} or {@link ClearCommand}.  All inputs states are optional.  Omitted states
 * use the defaults shown in the example below.
 *
 * @param {object} [renderState] The states defining the render state as shown in the example below.
 *
 * @exception {RuntimeError} renderState.lineWidth is out of range.
 * @exception {DeveloperError} Invalid renderState.frontFace.
 * @exception {DeveloperError} Invalid renderState.cull.face.
 * @exception {DeveloperError} scissorTest.rectangle.width and scissorTest.rectangle.height must be greater than or equal to zero.
 * @exception {DeveloperError} renderState.depthRange.near can't be greater than renderState.depthRange.far.
 * @exception {DeveloperError} renderState.depthRange.near must be greater than or equal to zero.
 * @exception {DeveloperError} renderState.depthRange.far must be less than or equal to zero.
 * @exception {DeveloperError} Invalid renderState.depthTest.func.
 * @exception {DeveloperError} renderState.blending.color components must be greater than or equal to zero and less than or equal to one
 * @exception {DeveloperError} Invalid renderState.blending.equationRgb.
 * @exception {DeveloperError} Invalid renderState.blending.equationAlpha.
 * @exception {DeveloperError} Invalid renderState.blending.functionSourceRgb.
 * @exception {DeveloperError} Invalid renderState.blending.functionSourceAlpha.
 * @exception {DeveloperError} Invalid renderState.blending.functionDestinationRgb.
 * @exception {DeveloperError} Invalid renderState.blending.functionDestinationAlpha.
 * @exception {DeveloperError} Invalid renderState.stencilTest.frontFunction.
 * @exception {DeveloperError} Invalid renderState.stencilTest.backFunction.
 * @exception {DeveloperError} Invalid renderState.stencilTest.frontOperation.fail.
 * @exception {DeveloperError} Invalid renderState.stencilTest.frontOperation.zFail.
 * @exception {DeveloperError} Invalid renderState.stencilTest.frontOperation.zPass.
 * @exception {DeveloperError} Invalid renderState.stencilTest.backOperation.fail.
 * @exception {DeveloperError} Invalid renderState.stencilTest.backOperation.zFail.
 * @exception {DeveloperError} Invalid renderState.stencilTest.backOperation.zPass.
 * @exception {DeveloperError} renderState.viewport.width must be greater than or equal to zero.
 * @exception {DeveloperError} renderState.viewport.width must be less than or equal to the maximum viewport width.
 * @exception {DeveloperError} renderState.viewport.height must be greater than or equal to zero.
 * @exception {DeveloperError} renderState.viewport.height must be less than or equal to the maximum viewport height.
 *
 *
 * @example
 * const defaults = {
 *     frontFace : WindingOrder.COUNTER_CLOCKWISE,
 *     cull : {
 *         enabled : false,
 *         face : CullFace.BACK
 *     },
 *     lineWidth : 1,
 *     polygonOffset : {
 *         enabled : false,
 *         factor : 0,
 *         units : 0
 *     },
 *     scissorTest : {
 *         enabled : false,
 *         rectangle : {
 *             x : 0,
 *             y : 0,
 *             width : 0,
 *             height : 0
 *         }
 *     },
 *     depthRange : {
 *         near : 0,
 *         far : 1
 *     },
 *     depthTest : {
 *         enabled : false,
 *         func : DepthFunction.LESS
 *      },
 *     colorMask : {
 *         red : true,
 *         green : true,
 *         blue : true,
 *         alpha : true
 *     },
 *     depthMask : true,
 *     stencilMask : ~0,
 *     blending : {
 *         enabled : false,
 *         color : {
 *             red : 0.0,
 *             green : 0.0,
 *             blue : 0.0,
 *             alpha : 0.0
 *         },
 *         equationRgb : BlendEquation.ADD,
 *         equationAlpha : BlendEquation.ADD,
 *         functionSourceRgb : BlendFunction.ONE,
 *         functionSourceAlpha : BlendFunction.ONE,
 *         functionDestinationRgb : BlendFunction.ZERO,
 *         functionDestinationAlpha : BlendFunction.ZERO
 *     },
 *     stencilTest : {
 *         enabled : false,
 *         frontFunction : StencilFunction.ALWAYS,
 *         backFunction : StencilFunction.ALWAYS,
 *         reference : 0,
 *         mask : ~0,
 *         frontOperation : {
 *             fail : StencilOperation.KEEP,
 *             zFail : StencilOperation.KEEP,
 *             zPass : StencilOperation.KEEP
 *         },
 *         backOperation : {
 *             fail : StencilOperation.KEEP,
 *             zFail : StencilOperation.KEEP,
 *             zPass : StencilOperation.KEEP
 *         }
 *     },
 *     sampleCoverage : {
 *         enabled : false,
 *         value : 1.0,
 *         invert : false
 *      }
 * };
 *
 * const rs = RenderState.fromCache(defaults);
 *
 * @see DrawCommand
 * @see ClearCommand
 *
 * @private
 */

export default class RenderState {
  public frontFace: number
  public cull: Cull
  public lineWidth: number
  public polygonOffset: PolygonOffset
  public scissorTest: ScissorTest
  public depthRange: DepthRange
  public depthTest: DepthTest
  public colorMask: ColorMask
  public depthMask: boolean
  public stencilMask: number
  public blending: Blending
  public stencilTest: StencilTest
  public sampleCoverage: SampleCoverage
  public viewport: BoundingRectangle | undefined
  id: number
  private _applyFunctions: Function[]
  static fromCache: (renderState: RenderState) => RenderState
  constructor(renderState?: RenderStateOptions) {
    const rs = defaultValue(renderState, defaultValue.EMPTY_OBJECT)
    const cull = defaultValue(rs.cull, defaultValue.EMPTY_OBJECT)
    const polygonOffset = defaultValue(
      rs.polygonOffset,
      defaultValue.EMPTY_OBJECT
    )
    const scissorTest = defaultValue(rs.scissorTest, defaultValue.EMPTY_OBJECT)
    const scissorTestRectangle = defaultValue(
      scissorTest.rectangle,
      defaultValue.EMPTY_OBJECT
    )
    const depthRange = defaultValue(rs.depthRange, defaultValue.EMPTY_OBJECT)
    const depthTest = defaultValue(rs.depthTest, defaultValue.EMPTY_OBJECT)
    const colorMask = defaultValue(rs.colorMask, defaultValue.EMPTY_OBJECT)
    const blending = defaultValue(rs.blending, defaultValue.EMPTY_OBJECT)
    const blendingColor = defaultValue(
      blending.color,
      defaultValue.EMPTY_OBJECT
    )
    const stencilTest = defaultValue(rs.stencilTest, defaultValue.EMPTY_OBJECT)
    const stencilTestFrontOperation = defaultValue(
      stencilTest.frontOperation,
      defaultValue.EMPTY_OBJECT
    )
    const stencilTestBackOperation = defaultValue(
      stencilTest.backOperation,
      defaultValue.EMPTY_OBJECT
    )
    const sampleCoverage = defaultValue(
      rs.sampleCoverage,
      defaultValue.EMPTY_OBJECT
    )
    const viewport = rs.viewport

    this.frontFace = defaultValue(rs.frontFace, WindingOrder.COUNTER_CLOCKWISE)
    this.cull = {
      enabled: defaultValue(cull.enabled, false),
      face: defaultValue(cull.face, WebGLConstants.BACK)
    }
    this.lineWidth = defaultValue(rs.lineWidth, 1.0)
    this.polygonOffset = {
      enabled: defaultValue(polygonOffset.enabled, false),
      factor: defaultValue(polygonOffset.factor, 0),
      units: defaultValue(polygonOffset.units, 0)
    }
    this.scissorTest = {
      enabled: defaultValue(scissorTest.enabled, false),
      rectangle: BoundingRectangle.clone(scissorTestRectangle)
    }
    this.depthRange = {
      near: defaultValue(depthRange.near, 0),
      far: defaultValue(depthRange.far, 1)
    }
    this.depthTest = {
      enabled: defaultValue(depthTest.enabled, false),
      func: defaultValue(depthTest.func, WebGLConstants.LESS) // func, because function is a JavaScript keyword
    }
    this.colorMask = {
      red: defaultValue(colorMask.red, true),
      green: defaultValue(colorMask.green, true),
      blue: defaultValue(colorMask.blue, true),
      alpha: defaultValue(colorMask.alpha, true)
    }
    this.depthMask = defaultValue(rs.depthMask, true)
    this.stencilMask = defaultValue(rs.stencilMask, ~0)
    this.blending = {
      enabled: defaultValue(blending.enabled, false),
      color: new Color(
        defaultValue(blendingColor.red, 0.0),
        defaultValue(blendingColor.green, 0.0),
        defaultValue(blendingColor.blue, 0.0),
        defaultValue(blendingColor.alpha, 0.0)
      ),
      equationRgb: defaultValue(blending.equationRgb, WebGLConstants.FUNC_ADD),
      equationAlpha: defaultValue(
        blending.equationAlpha,
        WebGLConstants.FUNC_ADD
      ),
      functionSourceRgb: defaultValue(
        blending.functionSourceRgb,
        WebGLConstants.ONE
      ),
      functionSourceAlpha: defaultValue(
        blending.functionSourceAlpha,
        WebGLConstants.ONE
      ),
      functionDestinationRgb: defaultValue(
        blending.functionDestinationRgb,
        WebGLConstants.ZERO
      ),
      functionDestinationAlpha: defaultValue(
        blending.functionDestinationAlpha,
        WebGLConstants.ZERO
      )
    }
    this.stencilTest = {
      enabled: defaultValue(stencilTest.enabled, false),
      frontFunction: defaultValue(
        stencilTest.frontFunction,
        WebGLConstants.ALWAYS
      ),
      backFunction: defaultValue(
        stencilTest.backFunction,
        WebGLConstants.ALWAYS
      ),
      reference: defaultValue(stencilTest.reference, 0),
      mask: defaultValue(stencilTest.mask, ~0),
      frontOperation: {
        fail: defaultValue(stencilTestFrontOperation.fail, WebGLConstants.KEEP),
        zFail: defaultValue(
          stencilTestFrontOperation.zFail,
          WebGLConstants.KEEP
        ),
        zPass: defaultValue(
          stencilTestFrontOperation.zPass,
          WebGLConstants.KEEP
        )
      },
      backOperation: {
        fail: defaultValue(stencilTestBackOperation.fail, WebGLConstants.KEEP),
        zFail: defaultValue(
          stencilTestBackOperation.zFail,
          WebGLConstants.KEEP
        ),
        zPass: defaultValue(stencilTestBackOperation.zPass, WebGLConstants.KEEP)
      }
    }
    this.sampleCoverage = {
      enabled: defaultValue(sampleCoverage.enabled, false),
      value: defaultValue(sampleCoverage.value, 1.0),
      invert: defaultValue(sampleCoverage.invert, false)
    }
    this.viewport = Defined(viewport)
      ? new BoundingRectangle(
          viewport.x,
          viewport.y,
          viewport.width,
          viewport.height
        )
      : undefined

    // >>includeStart('debug', pragmas.debug);
    if (
      this.lineWidth < ContextLimits.minimumAliasedLineWidth ||
      this.lineWidth > ContextLimits.maximumAliasedLineWidth
    ) {
      throw new DeveloperError(
        'renderState.lineWidth is out of range.  Check minimumAliasedLineWidth and maximumAliasedLineWidth.'
      )
    }
    if (!WindingOrder.validate(this.frontFace)) {
      throw new DeveloperError('Invalid renderState.frontFace.')
    }
    if (!validateCullFace(this.cull.face)) {
      throw new DeveloperError('Invalid renderState.cull.face.')
    }
    if (
      Defined(this.scissorTest.rectangle) &&
      (this.scissorTest.rectangle.width < 0 ||
        this.scissorTest.rectangle.height < 0)
    ) {
      throw new DeveloperError(
        'renderState.scissorTest.rectangle.width and renderState.scissorTest.rectangle.height must be greater than or equal to zero.'
      )
    }
    if (this.depthRange.near! > this.depthRange.far!) {
      // WebGL specific - not an error in GL ES
      throw new DeveloperError(
        'renderState.depthRange.near can not be greater than renderState.depthRange.far.'
      )
    }
    if (this.depthRange.near! < 0) {
      // Would be clamped by GL
      throw new DeveloperError(
        'renderState.depthRange.near must be greater than or equal to zero.'
      )
    }
    if (this.depthRange.far! > 1) {
      // Would be clamped by GL
      throw new DeveloperError(
        'renderState.depthRange.far must be less than or equal to one.'
      )
    }
    if (!validateDepthFunction(this.depthTest.func!)) {
      throw new DeveloperError('Invalid renderState.depthTest.func.')
    }
    if (
      Defined(this.blending.color) &&
      (this.blending.color.red < 0.0 ||
        this.blending.color.red > 1.0 ||
        this.blending.color.green < 0.0 ||
        this.blending.color.green > 1.0 ||
        this.blending.color.blue < 0.0 ||
        this.blending.color.blue > 1.0 ||
        this.blending.color.alpha < 0.0 ||
        this.blending.color.alpha > 1.0)
    ) {
      // Would be clamped by GL
      throw new DeveloperError(
        'renderState.blending.color components must be greater than or equal to zero and less than or equal to one.'
      )
    }
    if (!validateBlendEquation(this.blending.equationRgb!)) {
      throw new DeveloperError('Invalid renderState.blending.equationRgb.')
    }
    if (!validateBlendEquation(this.blending.equationAlpha!)) {
      throw new DeveloperError('Invalid renderState.blending.equationAlpha.')
    }
    if (!validateBlendFunction(this.blending.functionSourceRgb!)) {
      throw new DeveloperError(
        'Invalid renderState.blending.functionSourceRgb.'
      )
    }
    if (!validateBlendFunction(this.blending.functionSourceAlpha!)) {
      throw new DeveloperError(
        'Invalid renderState.blending.functionSourceAlpha.'
      )
    }
    if (!validateBlendFunction(this.blending.functionDestinationRgb!)) {
      throw new DeveloperError(
        'Invalid renderState.blending.functionDestinationRgb.'
      )
    }
    if (!validateBlendFunction(this.blending.functionDestinationAlpha!)) {
      throw new DeveloperError(
        'Invalid renderState.blending.functionDestinationAlpha.'
      )
    }
    if (!validateStencilFunction(this.stencilTest.frontFunction!)) {
      throw new DeveloperError('Invalid renderState.stencilTest.frontFunction.')
    }
    if (!validateStencilFunction(this.stencilTest.backFunction!)) {
      throw new DeveloperError('Invalid renderState.stencilTest.backFunction.')
    }
    if (!validateStencilOperation(this.stencilTest.frontOperation!.fail!)) {
      throw new DeveloperError(
        'Invalid renderState.stencilTest.frontOperation.fail.'
      )
    }
    if (!validateStencilOperation(this.stencilTest.backOperation!.zFail!)) {
      throw new DeveloperError(
        'Invalid renderState.stencilTest.backOperation.zFail.'
      )
    }
    if (!validateStencilOperation(this.stencilTest.backOperation!.zPass!)) {
      throw new DeveloperError(
        'Invalid renderState.stencilTest.backOperation.zPass.'
      )
    }

    if (Defined(this.viewport)) {
      if (this.viewport.width < 0) {
        throw new DeveloperError(
          'renderState.viewport.width must be greater than or equal to zero.'
        )
      }
      if (this.viewport.height < 0) {
        throw new DeveloperError(
          'renderState.viewport.height must be greater than or equal to zero.'
        )
      }

      if (this.viewport.width > ContextLimits.maximumViewportWidth) {
        throw new DeveloperError(
          `renderState.viewport.width must be less than or equal to the maximum viewport width (${ContextLimits.maximumViewportWidth.toString()}).  Check maximumViewportWidth.`
        )
      }
      if (this.viewport.height > ContextLimits.maximumViewportHeight) {
        throw new DeveloperError(
          `renderState.viewport.height must be less than or equal to the maximum viewport height (${ContextLimits.maximumViewportHeight.toString()}).  Check maximumViewportHeight.`
        )
      }
    }
    // >>includeEnd('debug');

    this.id = 0
    this._applyFunctions = []
  }
}

interface CacheState {
  [key: string]: {
    state: RenderState
    referenceCount: number
  }
}
let nextRenderStateId = 0
const renderStateCache: CacheState = {}
RenderState.fromCache = function (renderState: RenderState) {
  const partialKey = JSON.stringify(renderState)
  let cachedState = renderStateCache[partialKey]
  if (Defined(cachedState)) {
    ++cachedState.referenceCount
    return cachedState.state
  }

  // Cache miss.  Fully define render state and try again.
  let states = new RenderState(renderState)
  const fullKey = JSON.stringify(states)
  cachedState = renderStateCache[fullKey]
  if (!Defined(cachedState)) {
    states.id = nextRenderStateId++
    // >>includeStart('debug', pragmas.debug);
    states = freezeRenderState(states) as RenderState
    // >>includeEnd('debug');
    cachedState = {
      referenceCount: 0,
      state: states
    }

    // Cache full render state.  Multiple partially defined render states may map to this.
    renderStateCache[fullKey] = cachedState
  }

  ++cachedState.referenceCount

  // Cache partial render state so we can skip validation on a cache hit for a partially defined render state
  renderStateCache[partialKey] = {
    referenceCount: 1,
    state: cachedState.state
  }

  return cachedState.state
}
