/**
 * Determines how blending factors are computed.
 *
 * @enum {number}
 */

enum BlendFunction {
  /**
   * The blend factor is zero.
   *
   * @type {number}
   * @constant
   */
  ZERO = WebGL2RenderingContext.ZERO,

  /**
   * The blend factor is one.
   *
   * @type {number}
   * @constant
   */
  ONE = WebGL2RenderingContext.ONE,

  /**
   * The blend factor is the source color.
   *
   * @type {number}
   * @constant
   */
  SOURCE_COLOR = WebGL2RenderingContext.SRC_COLOR,

  /**
   * The blend factor is one minus the source color.
   *
   * @type {number}
   * @constant
   */
  ONE_MINUS_SOURCE_COLOR = WebGL2RenderingContext.ONE_MINUS_SRC_COLOR,

  /**
   * The blend factor is the destination color.
   *
   * @type {number}
   * @constant
   */
  DESTINATION_COLOR = WebGL2RenderingContext.DST_COLOR,

  /**
   * The blend factor is one minus the destination color.
   *
   * @type {number}
   * @constant
   */
  ONE_MINUS_DESTINATION_COLOR = WebGL2RenderingContext.ONE_MINUS_DST_COLOR,

  /**
   * The blend factor is the source alpha.
   *
   * @type {number}
   * @constant
   */
  SOURCE_ALPHA = WebGL2RenderingContext.SRC_ALPHA,

  /**
   * The blend factor is one minus the source alpha.
   *
   * @type {number}
   * @constant
   */
  ONE_MINUS_SOURCE_ALPHA = WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,

  /**
   * The blend factor is the destination alpha.
   *
   * @type {number}
   * @constant
   */
  DESTINATION_ALPHA = WebGL2RenderingContext.DST_ALPHA,

  /**
   * The blend factor is one minus the destination alpha.
   *
   * @type {number}
   * @constant
   */
  ONE_MINUS_DESTINATION_ALPHA = WebGL2RenderingContext.ONE_MINUS_DST_ALPHA,

  /**
   * The blend factor is the constant color.
   *
   * @type {number}
   * @constant
   */
  CONSTANT_COLOR = WebGL2RenderingContext.CONSTANT_COLOR,

  /**
   * The blend factor is one minus the constant color.
   *
   * @type {number}
   * @constant
   */
  ONE_MINUS_CONSTANT_COLOR = WebGL2RenderingContext.ONE_MINUS_CONSTANT_COLOR,

  /**
   * The blend factor is the constant alpha.
   *
   * @type {number}
   * @constant
   */
  CONSTANT_ALPHA = WebGL2RenderingContext.CONSTANT_ALPHA,

  /**
   * The blend factor is one minus the constant alpha.
   *
   * @type {number}
   * @constant
   */
  ONE_MINUS_CONSTANT_ALPHA = WebGL2RenderingContext.ONE_MINUS_CONSTANT_ALPHA,

  /**
   * The blend factor is the saturated source alpha.
   *
   * @type {number}
   * @constant
   */
  SOURCE_ALPHA_SATURATE = WebGL2RenderingContext.SRC_ALPHA_SATURATE
}

export default BlendFunction
