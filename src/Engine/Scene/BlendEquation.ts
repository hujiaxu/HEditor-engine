/**
 * Determines how two pixels' values are combined.
 *
 * @enum {number}
 */

enum BlendEquation {
  /**
   * Pixel values are added componentwise.  This is used in additive blending for translucency.
   *
   * @type {number}
   * @constant
   */
  ADD = WebGL2RenderingContext.FUNC_ADD,

  /**
   * Pixel values are subtracted componentwise (source - destination).  This is used in alpha blending for translucency.
   *
   * @type {number}
   * @constant
   */
  SUBTRACT = WebGL2RenderingContext.FUNC_SUBTRACT,

  /**
   * Pixel values are subtracted componentwise (destination - source).
   *
   * @type {number}
   * @constant
   */
  REVERSE_SUBTRACT = WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT,

  /**
   * Pixel values are given to the minimum function (min(source, destination)).
   *
   * This equation operates on each pixel color component.
   *
   * @type {number}
   * @constant
   */
  MIN = WebGL2RenderingContext.MIN,

  /**
   * Pixel values are given to the maximum function (max(source, destination)).
   *
   * This equation operates on each pixel color component.
   *
   * @type {number}
   * @constant
   */
  MAX = WebGL2RenderingContext.MAX
}

export default BlendEquation
