import Cartesian3 from './Cartesian3'
import defined from './Defined'
import HEditorMath from './Math'

export default class Plane {
  public normal: Cartesian3
  public distance: number
  static fromPointNormal: (
    point: Cartesian3,
    normal: Cartesian3,
    result?: Plane
  ) => Plane

  constructor(normal: Cartesian3 = Cartesian3.ZERO, distance: number = 0.0) {
    this.normal = Cartesian3.clone(normal)
    this.distance = distance
  }
}

Plane.fromPointNormal = function (
  point: Cartesian3,
  normal: Cartesian3,
  result?: Plane
) {
  if (
    !HEditorMath.equalsEpsilon(
      Cartesian3.magnitude(normal),
      1.0,
      HEditorMath.EPSILON6
    )
  ) {
    throw new Error('normal must be normalized.')
  }

  const distance = -Cartesian3.dot(normal, point)

  if (!defined(result)) {
    return new Plane(normal, distance)
  }

  Cartesian3.clone(normal, result.normal)
  result.distance = distance
  return result
}
