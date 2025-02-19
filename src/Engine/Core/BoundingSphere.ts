import Cartesian3 from './Cartesian3'
import Matrix4 from './Matrix4'

export default class BoundingSphere {
  center: Cartesian3
  radius: number
  static transform: (sphere: BoundingSphere, transform: Matrix4, result?: BoundingSphere) => BoundingSphere
  static union: (left: BoundingSphere, right: BoundingSphere, result?: BoundingSphere) => BoundingSphere
  static clone: (sphere: BoundingSphere, result?: BoundingSphere) => BoundingSphere

  constructor(center: Cartesian3 = new Cartesian3(), radius: number = 0.0) {
    this.center = center
    this.radius = radius
  }
}

BoundingSphere.clone = (sphere: BoundingSphere, result: BoundingSphere = new BoundingSphere()) => {
  result.center = sphere.center
  result.radius = sphere.radius
  return result
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

const unionScratch = new Cartesian3();
const unionScratchCenter = new Cartesian3();
BoundingSphere.union = (left: BoundingSphere, right: BoundingSphere, result?: BoundingSphere) => {
  if (!result) {
    result = new BoundingSphere()
  }
  const leftCenter = left.center;
  const leftRadius = left.radius;
  const rightCenter = right.center;
  const rightRadius = right.radius;

  const toRightCenter = Cartesian3.subtract(
    rightCenter,
    leftCenter,
    unionScratch,
  );
  const centerSeparation = Cartesian3.magnitude(toRightCenter);

  if (leftRadius >= centerSeparation + rightRadius) {
    // Left sphere wins.
    // left.clone(result);
    BoundingSphere.clone(left, result)
    return result;
  }

  if (rightRadius >= centerSeparation + leftRadius) {
    // Right sphere wins.
    // right.clone(result);
    BoundingSphere.clone(right, result)
    return result;
  }

  // There are two tangent points, one on far side of each sphere.
  const halfDistanceBetweenTangentPoints =
    (leftRadius + centerSeparation + rightRadius) * 0.5;

  // Compute the center point halfway between the two tangent points.

  // 新球体的中心必须位于左球体和右球体中心连线的某个位置。数学上，这个位置满足从左球中心到新球中心的距离恰好等于 新球半径减去左球半径。距离=newRadius−leftRadius
  // 1, 方向向量与比例因子：
  //    toRightCenter 是从左球中心指向右球中心的向量，其长度为 centerSeparation
  //    (-leftRadius + halfDistanceBetweenTangentPoints) 实际上就是 halfDistanceBetweenTangentPoints - leftRadius，也就是新球半径减去左球半径，代表了从左球中心到新球中心应前进的距离
  //    将这个距离除以 centerSeparation 得到一个比例因子，表示应沿着 toRightCenter 这个方向前进多远（相对于两球中心的总距离）。
  //2, 计算偏移量
  //    使用 Cartesian3.multiplyByScalar，代码将 toRightCenter 乘以这个比例因子，得到了一个偏移向量，这个向量表示从左球中心到新球中心的偏移。
  //3,  求和得到新中心：
  //    通过 Cartesian3.add(center, leftCenter, center); 将左球中心加上偏移向量，得到了新球体的中心坐标。

  const center = Cartesian3.multiplyByScalar(
    toRightCenter,
    (-leftRadius + halfDistanceBetweenTangentPoints) / centerSeparation,
    unionScratchCenter,
  );
  Cartesian3.add(center, leftCenter, center);
  Cartesian3.clone(center, result.center);
  result.radius = halfDistanceBetweenTangentPoints;

  return result;
}
