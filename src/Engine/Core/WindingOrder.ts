const WindingOrder = {
  /**
   * Vertices are in clockwise order.
   *
   * @type {number}
   * @constant
   */
  CLOCKWISE: WebGL2RenderingContext.CW,

  /**
   * Vertices are in counter-clockwise order.
   *
   * @type {number}
   * @constant
   */
  COUNTER_CLOCKWISE: WebGL2RenderingContext.CCW,

  validate(windingOrder: number) {
    return (
      windingOrder === WindingOrder.CLOCKWISE ||
      windingOrder === WindingOrder.COUNTER_CLOCKWISE
    )
  }
}

export default Object.freeze(WindingOrder)
