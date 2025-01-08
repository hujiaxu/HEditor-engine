import Cartesian3 from './Cartesian3'
import Matrix4 from './Matrix4'

export default class BoundingSphere {
  center: Cartesian3
  radius: number
  static clone: (sphere: BoundingSphere) => BoundingSphere
  static transform: (sphere: BoundingSphere, transform: Matrix4, result?: BoundingSphere) => BoundingSphere

  constructor(center: Cartesian3 = new Cartesian3(), radius: number = 0.0) {
    this.center = center
    this.radius = radius
  }
}

BoundingSphere.clone = function (sphere: BoundingSphere) {
  return new BoundingSphere(sphere.center, sphere.radius)
}

BoundingSphere.transform = function (
  sphere: BoundingSphere,
  transform: Matrix4,
  result: BoundingSphere = new BoundingSphere()
) {

  result.center = Matrix4.multiplyByPoint(
    transform,
    sphere.center,
    result.center,
  );

  result.radius = Matrix4.getMaximumScale(transform) * sphere.radius;

  return result
}
