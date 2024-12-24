import Cartesian3 from './Cartesian3';
import defined from './Defined';
import HEditorMath from './Math';
const scaleToGeodeticSurfaceIntersection = new Cartesian3();
const scaleToGeodeticSurfaceGradient = new Cartesian3();
const scaleToGeodeticSurface = (cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared, result = new Cartesian3()) => {
    if (!defined(cartesian)) {
        throw new Error('cartesian is required.');
    }
    if (!defined(oneOverRadii)) {
        throw new Error('onOverRadii is required.');
    }
    if (!defined(oneOverRadiiSquared)) {
        throw new Error('onOverRadiiSquared is required.');
    }
    if (!defined(centerToleranceSquared)) {
        throw new Error('centerToleranceSquared is required.');
    }
    const positionX = cartesian.x;
    const positionY = cartesian.y;
    const positionZ = cartesian.z;
    const oneOverRadiiX = oneOverRadii.x;
    const oneOverRadiiY = oneOverRadii.y;
    const oneOverRadiiZ = oneOverRadii.z;
    /*
      based on equation (x / a)² + (y / b)² + (z / c)² = 1
    */
    const x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX;
    const y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY;
    const z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ;
    const squaredNorm = x2 + y2 + z2;
    /*
      if there is one value called 'ratio' present, it is this equation that holds.
      (x * ratio / a)² + (y * ratio / b)² + (z * ratio / c)² = 1
      so ratio² * (x / a)² + ratio² * (y / b)² + ratio² * (z / c)² = 1
      and then ratio² * ((x / a)² + (y / b)² + (z / c)²) = 1
      and then ratio² * squaredNorm = 1
      so ratio = Math.sqrt(1.0 / squaredNorm)
  
      and then use ratio multiply cartesian to get a point close to surface
    */
    const ratio = Math.sqrt(1.0 / squaredNorm);
    const intersection = Cartesian3.multiplyByScalar(cartesian, ratio, scaleToGeodeticSurfaceIntersection);
    /*
      centerToleranceSquared = 0.1
  
      squaredNorm = 0 means that this point is at the center of the ellipse,
      squaredNorm = 1 indicates that the point is one the surface,
      squaredNorm > 1 means the point is outside the ellipse
    */
    if (squaredNorm < centerToleranceSquared) {
        return !isFinite(ratio) ? undefined : Cartesian3.clone(intersection, result);
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
    const oneOverRadiiSquaredX = oneOverRadiiSquared.x;
    const oneOverRadiiSquaredY = oneOverRadiiSquared.y;
    const oneOverRadiiSquaredZ = oneOverRadiiSquared.z;
    const grandient = scaleToGeodeticSurfaceGradient;
    grandient.x = intersection.x * oneOverRadiiSquaredX * 2.0;
    grandient.y = intersection.y * oneOverRadiiSquaredY * 2.0;
    grandient.z = intersection.z * oneOverRadiiSquaredZ * 2.0;
    /*
      1.0 - ratio: 距离椭球表面的归一化误差, ratio 越接近 1.0, 则表示cartesian越接近椭圆表面
      Cartesian3.magnitude(cartesian): 距离椭球表面的距离
      Cartesian3.magnitude(grandient): 此梯度的变化率, 表示目标函数相对于空间位置的变化率
  
      lambda: 牛顿迭代的初始步长, 误差距离 / (梯度速率 * 0.5), 为什么乘以0.5还没想明白, 有可能是为了矫正上面计算偏导数乘以 2.0 的
  
      ((1.0 - ratio) * Cartesian3.magnitude(cartesian)): 估算的误差距离, 也就是 cartesian 需要移动多远才能到椭球表面上
    */
    let lambda = ((1.0 - ratio) * Cartesian3.magnitude(cartesian)) /
        (0.5 * Cartesian3.magnitude(grandient));
    let correction = 0.0;
    let func;
    let denominator;
    let xMultiplier;
    let yMultiplier;
    let zMultiplier;
    let xMultiplier2;
    let yMultiplier2;
    let zMultiplier2;
    let xMultiplier3;
    let yMultiplier3;
    let zMultiplier3;
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
        lambda -= correction;
        xMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredX);
        yMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredY);
        zMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredZ);
        xMultiplier2 = xMultiplier * xMultiplier;
        yMultiplier2 = yMultiplier * yMultiplier;
        zMultiplier2 = zMultiplier * zMultiplier;
        xMultiplier3 = xMultiplier2 * xMultiplier;
        yMultiplier3 = yMultiplier2 * yMultiplier;
        zMultiplier3 = zMultiplier2 * zMultiplier;
        func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0;
        denominator =
            x2 * xMultiplier3 * oneOverRadiiSquaredX +
                y2 * yMultiplier3 * oneOverRadiiSquaredY +
                z2 * zMultiplier3 * oneOverRadiiSquaredZ;
        const derivative = -2.0 * denominator;
        correction = func / derivative;
    } while (Math.abs(func) > HEditorMath.EPSILON12);
    result.x = positionX * xMultiplier;
    result.y = positionY * yMultiplier;
    result.z = positionZ * zMultiplier;
    return result;
};
export default scaleToGeodeticSurface;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NhbGV0b0dlb2RldGljU3VyZmFjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9TY2FsZXRvR2VvZGV0aWNTdXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxXQUFXLE1BQU0sUUFBUSxDQUFBO0FBRWhDLE1BQU0sa0NBQWtDLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtBQUMzRCxNQUFNLDhCQUE4QixHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7QUFFdkQsTUFBTSxzQkFBc0IsR0FBRyxDQUM3QixTQUFxQixFQUNyQixZQUF3QixFQUN4QixtQkFBK0IsRUFDL0Isc0JBQThCLEVBQzlCLFNBQXFCLElBQUksVUFBVSxFQUFFLEVBQ3JDLEVBQUU7SUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0lBQzNDLENBQUM7SUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztRQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFBO0lBQzdCLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFFN0IsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQTtJQUNwQyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFBO0lBQ3BDLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFDcEM7O01BRUU7SUFDRixNQUFNLEVBQUUsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLGFBQWEsR0FBRyxhQUFhLENBQUE7SUFDaEUsTUFBTSxFQUFFLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFBO0lBQ2hFLE1BQU0sRUFBRSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsYUFBYSxHQUFHLGFBQWEsQ0FBQTtJQUVoRSxNQUFNLFdBQVcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtJQUVoQzs7Ozs7Ozs7O01BU0U7SUFDRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQTtJQUUxQyxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQzlDLFNBQVMsRUFDVCxLQUFLLEVBQ0wsa0NBQWtDLENBQ25DLENBQUE7SUFFRDs7Ozs7O01BTUU7SUFDRixJQUFJLFdBQVcsR0FBRyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDOUUsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O01BYUU7SUFDRixNQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQTtJQUNsRCxNQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQTtJQUNsRCxNQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQTtJQUVsRCxNQUFNLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQTtJQUNoRCxTQUFTLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsb0JBQW9CLEdBQUcsR0FBRyxDQUFBO0lBQ3pELFNBQVMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxvQkFBb0IsR0FBRyxHQUFHLENBQUE7SUFDekQsU0FBUyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLG9CQUFvQixHQUFHLEdBQUcsQ0FBQTtJQUV6RDs7Ozs7Ozs7TUFRRTtJQUNGLElBQUksTUFBTSxHQUNSLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDekMsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFBO0lBRXBCLElBQUksSUFBSSxDQUFBO0lBQ1IsSUFBSSxXQUFXLENBQUE7SUFDZixJQUFJLFdBQVcsQ0FBQTtJQUNmLElBQUksV0FBVyxDQUFBO0lBQ2YsSUFBSSxXQUFXLENBQUE7SUFDZixJQUFJLFlBQVksQ0FBQTtJQUNoQixJQUFJLFlBQVksQ0FBQTtJQUNoQixJQUFJLFlBQVksQ0FBQTtJQUNoQixJQUFJLFlBQVksQ0FBQTtJQUNoQixJQUFJLFlBQVksQ0FBQTtJQUNoQixJQUFJLFlBQVksQ0FBQTtJQUVoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BOEJFO0lBRUYsR0FBRyxDQUFDO1FBQ0YsTUFBTSxJQUFJLFVBQVUsQ0FBQTtRQUVwQixXQUFXLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ3pELFdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxHQUFHLG9CQUFvQixDQUFDLENBQUE7UUFDekQsV0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLEdBQUcsb0JBQW9CLENBQUMsQ0FBQTtRQUV6RCxZQUFZLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQTtRQUN4QyxZQUFZLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQTtRQUN4QyxZQUFZLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQTtRQUV4QyxZQUFZLEdBQUcsWUFBWSxHQUFHLFdBQVcsQ0FBQTtRQUN6QyxZQUFZLEdBQUcsWUFBWSxHQUFHLFdBQVcsQ0FBQTtRQUN6QyxZQUFZLEdBQUcsWUFBWSxHQUFHLFdBQVcsQ0FBQTtRQUV6QyxJQUFJLEdBQUcsRUFBRSxHQUFHLFlBQVksR0FBRyxFQUFFLEdBQUcsWUFBWSxHQUFHLEVBQUUsR0FBRyxZQUFZLEdBQUcsR0FBRyxDQUFBO1FBRXRFLFdBQVc7WUFDVCxFQUFFLEdBQUcsWUFBWSxHQUFHLG9CQUFvQjtnQkFDeEMsRUFBRSxHQUFHLFlBQVksR0FBRyxvQkFBb0I7Z0JBQ3hDLEVBQUUsR0FBRyxZQUFZLEdBQUcsb0JBQW9CLENBQUE7UUFFMUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFBO1FBRXJDLFVBQVUsR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFBO0lBQ2hDLENBQUMsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUM7SUFFaEQsTUFBTSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFBO0lBQ2xDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQTtJQUNsQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxXQUFXLENBQUE7SUFDbEMsT0FBTyxNQUFNLENBQUE7QUFDZixDQUFDLENBQUE7QUFFRCxlQUFlLHNCQUFzQixDQUFBIn0=