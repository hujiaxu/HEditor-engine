import Cartesian3 from './Cartesian3'
import defined from './Defined'
import HEditorMath from './Math'

const scaleToGeodeticSurfaceIntersection = new Cartesian3()
const scaleToGeodeticSurfaceGradient = new Cartesian3()

const scaleToGeodeticSurface = (
  cartesian: Cartesian3,
  oneOverRadii: Cartesian3,
  oneOverRadiiSquared: Cartesian3,
  centerToleranceSquared: number,
  result: Cartesian3 = new Cartesian3()
) => {
  if (!defined(cartesian)) {
    throw new Error('cartesian is required.')
  }
  if (!defined(oneOverRadii)) {
    throw new Error('onOverRadii is required.')
  }
  if (!defined(oneOverRadiiSquared)) {
    throw new Error('onOverRadiiSquared is required.')
  }
  if (!defined(centerToleranceSquared)) {
    throw new Error('centerToleranceSquared is required.')
  }

  const positionX = cartesian.x
  const positionY = cartesian.y
  const positionZ = cartesian.z

  const oneOverRadiiX = oneOverRadii.x
  const oneOverRadiiY = oneOverRadii.y
  const oneOverRadiiZ = oneOverRadii.z
  /*
    based on equation (x / a)² + (y / b)² + (z / c)² = 1
  */
  const x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX
  const y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY
  const z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ

  const squaredNorm = x2 + y2 + z2

  /*
    if there is one value called 'ratio' present, it is this equation that holds.
    (x * ratio / a)² + (y * ratio / b)² + (z * ratio / c)² = 1
    so ratio² * (x / a)² + ratio² * (y / b)² + ratio² * (z / c)² = 1
    and then ratio² * ((x / a)² + (y / b)² + (z / c)²) = 1
    and then ratio² * squaredNorm = 1
    so ratio = Math.sqrt(1.0 / squaredNorm)

    and then use ratio multiply cartesian to get a point close to surface
  */
  const ratio = Math.sqrt(1.0 / squaredNorm)

  const intersection = Cartesian3.multiplyByScalar(
    cartesian,
    ratio,
    scaleToGeodeticSurfaceIntersection
  )

  /*
    centerToleranceSquared = 0.1

    squaredNorm = 0 means that this point is at the center of the ellipse,
    squaredNorm = 1 indicates that the point is one the surface,
    squaredNorm > 1 means the point is outside the ellipse
  */
  if (squaredNorm < centerToleranceSquared) {
    return !isFinite(ratio) ? undefined : Cartesian3.clone(intersection, result)
  }

  /*
    Newton‘s iterative method is used below, by gradually adjusting the correction factor lambda to more precisely find the projection point of the input point one the surface of the ellisoid.
    
    equation: Xnew = Xcurrent - f(Xcurrent) / f'(Xcurrent)

    Xn: is the current approximation of the NTH iteration
    f(Xn): is the function value of the current approximation
    f′(Xn): the derivative of the function (also called the gradient or slope)

    f(lambda) = 0, lambda is the correction factor
    so func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0

    ** grandient: 梯度, 偏导数, 描述函数在某一点变化的方向和速度的向量, 基于 intersection 这个表面点的偏导数
  */
  const oneOverRadiiSquaredX = oneOverRadiiSquared.x
  const oneOverRadiiSquaredY = oneOverRadiiSquared.y
  const oneOverRadiiSquaredZ = oneOverRadiiSquared.z

  const grandient = scaleToGeodeticSurfaceGradient
  grandient.x = intersection.x * oneOverRadiiSquaredX * 2.0
  grandient.y = intersection.y * oneOverRadiiSquaredY * 2.0
  grandient.z = intersection.z * oneOverRadiiSquaredZ * 2.0

  /*
    1.0 - ratio: 距离椭球表面的归一化误差, ratio 越接近 1.0, 则表示cartesian越接近椭圆表面
    Cartesian3.magnitude(cartesian): 距离椭球表面的距离
    Cartesian3.magnitude(grandient): 此梯度的变化率, 表示目标函数相对于空间位置的变化率

    lambda: 牛顿迭代的初始步长, 误差距离 / (梯度速率 * 0.5), 为什么乘以0.5还没想明白, 有可能是为了矫正上面计算偏导数乘以 2.0 的

    ((1.0 - ratio) * Cartesian3.magnitude(cartesian)): 估算的误差距离, 也就是 cartesian 需要移动多远才能到椭球表面上
  */
  let lambda =
    ((1.0 - ratio) * Cartesian3.magnitude(cartesian)) /
    (0.5 * Cartesian3.magnitude(grandient))
  let correction = 0.0

  let func
  let denominator
  let xMultiplier
  let yMultiplier
  let zMultiplier
  let xMultiplier2
  let yMultiplier2
  let zMultiplier2
  let xMultiplier3
  let yMultiplier3
  let zMultiplier3

  /*
    1, 什么是径向缩放
    径向缩放: 是指沿着从椭球中心指向某个点的方向, 对该点的距离进行调整, 从而使其在空间中的位置发生变化.
            可以想象这是沿着一条从椭球中心出发, 穿过点的射线进行拉伸或压缩的过程.

            具体来说, 径向 是指从椭球的中心指向输入点的方向. 在椭球体上进行投影时, 我们希望将输入点在这个方向上调整, 使其恰好落在椭球的表面上, 而这个调整过程就叫做 径向缩放.

    2, 为什么需要径向缩放
      在处理椭球投影问题时, 输入点可能位于椭球体的外部或内部, 二我们的目标是将这个点移动到椭球表面上. 因此, 我们需要找到一种方法来调整点的位置.

      考虑到椭球的复杂性(例如它在各个方向上的半径不相等), 我们不能简单地沿着轴方向拉伸或压缩, 而是需要沿着从中心指向点的径向方向进行调整, 以确保点最终落在椭球的表面上.

    3, 椭球的径向缩放公式
      假设我们有一个输入点(x, y, z), 我们需要沿着径向方向调整它的位置. 为了使点沿着径向方向靠近或远离椭球表面, 引入了一个缩放因子, 新的位置坐标可以表示为
      (x', y', z') = (x / (1 + λ * 1 / a²), y / (1 + λ * 1 / b²), z / (1 + λ * 1 / c²)) = (x * xMultiplier, y * yMultiplier, z * zMultiplier)
      
      xMultiplier = 1 / (1 + λ * 1 / a²) = 1 / (1 + lambda * 1 / a²)
      yMultiplier = 1 / (1 + λ * 1 / b²) = 1 / (1 + lambda * 1 / b²)
      zMultiplier = 1 / (1 + λ * 1 / c²) = 1 / (1 + lambda * 1 / c²)
      其中λ是一个步长参数, 用于控制径向缩放的程度.

      (x', y', z') = (x * xMultiplier, y * yMultiplier, z * zMultiplier) = (x / (1 + λ * 1 / a²), y / (1 + λ * 1 / b²), z / (1 + λ * 1 / c²))

      代入椭圆公式：(x * xMultiplier / a)² + (y * yMultiplier / b)² + (z * zMultiplier / c)²
                = (x / a)² * xMultiplier² + (y / b)² * yMultiplier² + (z / c)² * zMultiplier²
                = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2
                = 1.0
      func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0

      denominator: func 的 偏导数, 因为求偏导数的时候会乘以一个 2, 所以 denominator = 2 * denominator
  */

  do {
    lambda -= correction

    xMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredX)
    yMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredY)
    zMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredZ)

    xMultiplier2 = xMultiplier * xMultiplier
    yMultiplier2 = yMultiplier * yMultiplier
    zMultiplier2 = zMultiplier * zMultiplier

    xMultiplier3 = xMultiplier2 * xMultiplier
    yMultiplier3 = yMultiplier2 * yMultiplier
    zMultiplier3 = zMultiplier2 * zMultiplier

    func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0

    denominator =
      x2 * xMultiplier3 * oneOverRadiiSquaredX +
      y2 * yMultiplier3 * oneOverRadiiSquaredY +
      z2 * zMultiplier3 * oneOverRadiiSquaredZ

    const derivative = -2.0 * denominator

    correction = func / derivative
  } while (Math.abs(func) > HEditorMath.EPSILON12)

  result.x = positionX * xMultiplier
  result.y = positionY * yMultiplier
  result.z = positionZ * zMultiplier
  return result
}

export default scaleToGeodeticSurface
