import Cartesian3 from './Cartesian3'
import Cartographic from './Cartographic'
import defaultValue from './DefaultValue'
import Defined from './Defined'
import Ellipsoid from './Ellipsoid'
import GeographicProjection from './GeographicProjection'
import { Intersect } from './IntersectionTests'
// import HEditorMath from './Math'
import Matrix4 from './Matrix4'
import Plane from './Plane'
import { Check } from '..'

export default class BoundingSphere {
  center: Cartesian3
  radius: number
  static transform: (
    sphere: BoundingSphere,
    transform: Matrix4,
    result?: BoundingSphere
  ) => BoundingSphere
  static union: (
    left: BoundingSphere,
    right: BoundingSphere,
    result?: BoundingSphere
  ) => BoundingSphere
  static clone: (
    sphere: BoundingSphere,
    result?: BoundingSphere
  ) => BoundingSphere
  static intersectPlane: (sphere: BoundingSphere, plane: Plane) => Intersect
  static fromPoints: (
    positions: Cartesian3[],
    result?: BoundingSphere
  ) => BoundingSphere
  static projectTo2D: (
    sphere: BoundingSphere,
    projection: GeographicProjection,
    result?: BoundingSphere
  ) => BoundingSphere

  constructor(center: Cartesian3 = new Cartesian3(), radius: number = 0.0) {
    this.center = center
    this.radius = radius
  }

  clone(result?: BoundingSphere) {
    return BoundingSphere.clone(this, result)
  }
}

BoundingSphere.clone = (
  sphere: BoundingSphere,
  result: BoundingSphere = new BoundingSphere()
) => {
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
    result.center
  )

  result.radius = Matrix4.getMaximumScale(transform) * sphere.radius

  return result
}

const unionScratch = new Cartesian3()
const unionScratchCenter = new Cartesian3()
BoundingSphere.union = (
  left: BoundingSphere,
  right: BoundingSphere,
  result?: BoundingSphere
) => {
  if (!result) {
    result = new BoundingSphere()
  }
  const leftCenter = left.center
  const leftRadius = left.radius
  const rightCenter = right.center
  const rightRadius = right.radius

  const toRightCenter = Cartesian3.subtract(
    rightCenter,
    leftCenter,
    unionScratch
  )
  const centerSeparation = Cartesian3.magnitude(toRightCenter)

  if (leftRadius >= centerSeparation + rightRadius) {
    // Left sphere wins.
    // left.clone(result);
    BoundingSphere.clone(left, result)
    return result
  }

  if (rightRadius >= centerSeparation + leftRadius) {
    // Right sphere wins.
    // right.clone(result);
    BoundingSphere.clone(right, result)
    return result
  }

  // There are two tangent points, one on far side of each sphere.
  const halfDistanceBetweenTangentPoints =
    (leftRadius + centerSeparation + rightRadius) * 0.5

  // Compute the center point halfway between the two tangent points.

  // 新球体的中心必须位于左球体和右球体中心连线的某个位置。数学上，这个位置满足从左球中心到新球中心的距离恰好等于 新球半径减去左球半径。距离=newRadius−leftRadius
  // 1, 方向向量与比例因子：
  //    toRightCenter 是从左球中心指向右球中心的向量，其长度为 centerSeparation
  //    (-leftRadius + halfDistanceBetweenTangentPoints) 实际上就是 halfDistanceBetweenTangentPoints - leftRadius，也就是新球半径减去左球半径，代表了从左球中心到新球中心应前进的距离
  //    将这个距离除以 centerSeparation 得到一个比例因子，表示应沿着 toRightCenter 这个方向前进多远（相对于两球中心的总距离）。
  // 2, 计算偏移量
  //    使用 Cartesian3.multiplyByScalar，代码将 toRightCenter 乘以这个比例因子，得到了一个偏移向量，这个向量表示从左球中心到新球中心的偏移。
  // 3,  求和得到新中心：
  //    通过 Cartesian3.add(center, leftCenter, center); 将左球中心加上偏移向量，得到了新球体的中心坐标。

  const center = Cartesian3.multiplyByScalar(
    toRightCenter,
    (-leftRadius + halfDistanceBetweenTangentPoints) / centerSeparation,
    unionScratchCenter
  )
  Cartesian3.add(center, leftCenter, center)
  Cartesian3.clone(center, result.center)
  result.radius = halfDistanceBetweenTangentPoints

  return result
}

BoundingSphere.intersectPlane = (sphere: BoundingSphere, plane: Plane) => {
  // >>includeStart('debug', pragmas.debug);
  Check.typeOf.object('sphere', sphere)
  Check.typeOf.object('plane', plane)
  // >>includeEnd('debug');

  const center = sphere.center
  const radius = sphere.radius
  const normal = plane.normal
  const distanceToPlane = Cartesian3.dot(normal, center) + plane.distance

  if (distanceToPlane < -radius) {
    // The center point is negative side of the plane normal
    return Intersect.OUTSIDE
  } else if (distanceToPlane < radius) {
    // The center point is positive side of the plane, but radius extends beyond it; partial overlap
    return Intersect.INTERSECTING
  }
  return Intersect.INSIDE
}

const fromPointsXMin = new Cartesian3()
const fromPointsYMin = new Cartesian3()
const fromPointsZMin = new Cartesian3()
const fromPointsXMax = new Cartesian3()
const fromPointsYMax = new Cartesian3()
const fromPointsZMax = new Cartesian3()
const fromPointsCurrentPos = new Cartesian3()
const fromPointsScratch = new Cartesian3()
const fromPointsRitterCenter = new Cartesian3()
const fromPointsMinBoxPt = new Cartesian3()
const fromPointsMaxBoxPt = new Cartesian3()
const fromPointsNaiveCenterScratch = new Cartesian3()
// const volumeConstant = (4.0 / 3.0) * HEditorMath.PI;

BoundingSphere.fromPoints = (
  positions: Cartesian3[],
  result: BoundingSphere = new BoundingSphere()
) => {
  if (!Defined(result)) {
    result = new BoundingSphere()
  }

  if (!Defined(positions) || positions.length === 0) {
    result.center = Cartesian3.clone(Cartesian3.ZERO, result.center)
    result.radius = 0.0
    return result
  }

  const currentPos = Cartesian3.clone(positions[0], fromPointsCurrentPos)

  const xMin = Cartesian3.clone(currentPos, fromPointsXMin)
  const yMin = Cartesian3.clone(currentPos, fromPointsYMin)
  const zMin = Cartesian3.clone(currentPos, fromPointsZMin)

  const xMax = Cartesian3.clone(currentPos, fromPointsXMax)
  const yMax = Cartesian3.clone(currentPos, fromPointsYMax)
  const zMax = Cartesian3.clone(currentPos, fromPointsZMax)

  const numPositions = positions.length
  let i

  for (i = 1; i < numPositions; i++) {
    Cartesian3.clone(positions[i], currentPos)

    const x = currentPos.x
    const y = currentPos.y
    const z = currentPos.z

    // Store points containing the the smallest and largest components
    if (x < xMin.x) {
      Cartesian3.clone(currentPos, xMin)
    }

    if (x > xMax.x) {
      Cartesian3.clone(currentPos, xMax)
    }

    if (y < yMin.y) {
      Cartesian3.clone(currentPos, yMin)
    }

    if (y > yMax.y) {
      Cartesian3.clone(currentPos, yMax)
    }

    if (z < zMin.z) {
      Cartesian3.clone(currentPos, zMin)
    }

    if (z > zMax.z) {
      Cartesian3.clone(currentPos, zMax)
    }
  }
  // Compute x-, y-, and z-spans (Squared distances b/n each component's min. and max.).
  const xSpan = Cartesian3.magnitudeSquared(
    Cartesian3.subtract(xMax, xMin, fromPointsScratch)
  )
  const ySpan = Cartesian3.magnitudeSquared(
    Cartesian3.subtract(yMax, yMin, fromPointsScratch)
  )
  const zSpan = Cartesian3.magnitudeSquared(
    Cartesian3.subtract(zMax, zMin, fromPointsScratch)
  )

  // Set the diameter endpoints to the largest span.
  let diameter1 = xMin
  let diameter2 = xMax
  let maxSpan = xSpan
  if (ySpan > maxSpan) {
    maxSpan = ySpan
    diameter1 = yMin
    diameter2 = yMax
  }
  if (zSpan > maxSpan) {
    maxSpan = zSpan
    diameter1 = zMin
    diameter2 = zMax
  }

  // Calculate the center of the initial sphere found by Ritter's algorithm
  const ritterCenter = fromPointsRitterCenter
  ritterCenter.x = (diameter1.x + diameter2.x) * 0.5
  ritterCenter.y = (diameter1.y + diameter2.y) * 0.5
  ritterCenter.z = (diameter1.z + diameter2.z) * 0.5

  // Calculate the radius of the initial sphere found by Ritter's algorithm
  let radiusSquared = Cartesian3.magnitudeSquared(
    Cartesian3.subtract(diameter2, ritterCenter, fromPointsScratch)
  )
  let ritterRadius = Math.sqrt(radiusSquared)

  // Find the center of the sphere found using the Naive method.
  const minBoxPt = fromPointsMinBoxPt
  minBoxPt.x = xMin.x
  minBoxPt.y = yMin.y
  minBoxPt.z = zMin.z

  const maxBoxPt = fromPointsMaxBoxPt
  maxBoxPt.x = xMax.x
  maxBoxPt.y = yMax.y
  maxBoxPt.z = zMax.z

  const naiveCenter = Cartesian3.midpoint(
    minBoxPt,
    maxBoxPt,
    fromPointsNaiveCenterScratch
  )

  // Begin 2nd pass to find naive radius and modify the ritter sphere.
  let naiveRadius = 0
  for (i = 0; i < numPositions; i++) {
    Cartesian3.clone(positions[i], currentPos)

    // Find the furthest point from the naive center to calculate the naive radius.
    const r = Cartesian3.magnitude(
      Cartesian3.subtract(currentPos, naiveCenter, fromPointsScratch)
    )
    if (r > naiveRadius) {
      naiveRadius = r
    }

    // Make adjustments to the Ritter Sphere to include all points.
    const oldCenterToPointSquared = Cartesian3.magnitudeSquared(
      Cartesian3.subtract(currentPos, ritterCenter, fromPointsScratch)
    )
    if (oldCenterToPointSquared > radiusSquared) {
      const oldCenterToPoint = Math.sqrt(oldCenterToPointSquared)
      // Calculate new radius to include the point that lies outside
      ritterRadius = (ritterRadius + oldCenterToPoint) * 0.5
      radiusSquared = ritterRadius * ritterRadius
      // Calculate center of new Ritter sphere
      const oldToNew = oldCenterToPoint - ritterRadius
      ritterCenter.x =
        (ritterRadius * ritterCenter.x + oldToNew * currentPos.x) /
        oldCenterToPoint
      ritterCenter.y =
        (ritterRadius * ritterCenter.y + oldToNew * currentPos.y) /
        oldCenterToPoint
      ritterCenter.z =
        (ritterRadius * ritterCenter.z + oldToNew * currentPos.z) /
        oldCenterToPoint
    }
  }

  if (ritterRadius < naiveRadius) {
    Cartesian3.clone(ritterCenter, result.center)
    result.radius = ritterRadius
  } else {
    Cartesian3.clone(naiveCenter, result.center)
    result.radius = naiveRadius
  }

  return result
}

const projectTo2DNormalScratch = new Cartesian3()
const projectTo2DEastScratch = new Cartesian3()
const projectTo2DNorthScratch = new Cartesian3()
const projectTo2DWestScratch = new Cartesian3()
const projectTo2DSouthScratch = new Cartesian3()
const projectTo2DCartographicScratch = new Cartographic()
const projectTo2DPositionsScratch = new Array(8)
for (let n = 0; n < 8; ++n) {
  projectTo2DPositionsScratch[n] = new Cartesian3()
}

const projectTo2DProjection = new GeographicProjection()
/**
 * Projects a BoundingSphere onto the 2D plane of the given GeographicProjection.
 * The resulting BoundingSphere is a 2D representation of the original sphere, with
 * the center and radius transformed to the projection plane.
 *
 * @param {BoundingSphere} sphere The BoundingSphere to project.
 * @param {GeographicProjection} [projection=GeographicProjection.default] The GeographicProjection to use.
 * @param {BoundingSphere} [result] The object onto which to store the result.
 * @returns {BoundingSphere} The projected BoundingSphere.
 */
BoundingSphere.projectTo2D = function (
  sphere: BoundingSphere,
  projection: GeographicProjection,
  result: BoundingSphere = new BoundingSphere()
) {
  // >>includeStart('debug', pragmas.debug);
  Check.typeOf.object('sphere', sphere)
  // >>includeEnd('debug');

  projectTo2DProjection.ellipsoid = Ellipsoid.default
  projection = defaultValue(projection, projectTo2DProjection)

  const ellipsoid = projection.ellipsoid
  let center = sphere.center
  const radius = sphere.radius

  let normal
  if (Cartesian3.equals(center, Cartesian3.ZERO)) {
    // Bounding sphere is at the center. The geodetic surface normal is not
    // defined here so pick the x-axis as a fallback.
    normal = Cartesian3.clone(Cartesian3.UNIT_X, projectTo2DNormalScratch)
  } else {
    normal = ellipsoid.geodeticSurfaceNormal(center, projectTo2DNormalScratch)
  }

  const east = Cartesian3.cross(
    Cartesian3.UNIT_Z,
    normal,
    projectTo2DEastScratch
  )
  Cartesian3.normalize(east, east)
  const north = Cartesian3.cross(normal, east, projectTo2DNorthScratch)
  Cartesian3.normalize(north, north)

  Cartesian3.multiplyByScalar(normal, radius, normal)
  Cartesian3.multiplyByScalar(north, radius, north)
  Cartesian3.multiplyByScalar(east, radius, east)

  const south = Cartesian3.negate(north, projectTo2DSouthScratch)
  const west = Cartesian3.negate(east, projectTo2DWestScratch)

  const positions = projectTo2DPositionsScratch

  // top NE corner
  let corner = positions[0]
  Cartesian3.add(normal, north, corner)
  Cartesian3.add(corner, east, corner)

  // top NW corner
  corner = positions[1]
  Cartesian3.add(normal, north, corner)
  Cartesian3.add(corner, west, corner)

  // top SW corner
  corner = positions[2]
  Cartesian3.add(normal, south, corner)
  Cartesian3.add(corner, west, corner)

  // top SE corner
  corner = positions[3]
  Cartesian3.add(normal, south, corner)
  Cartesian3.add(corner, east, corner)

  Cartesian3.negate(normal, normal)

  // bottom NE corner
  corner = positions[4]
  Cartesian3.add(normal, north, corner)
  Cartesian3.add(corner, east, corner)

  // bottom NW corner
  corner = positions[5]
  Cartesian3.add(normal, north, corner)
  Cartesian3.add(corner, west, corner)

  // bottom SW corner
  corner = positions[6]
  Cartesian3.add(normal, south, corner)
  Cartesian3.add(corner, west, corner)

  // bottom SE corner
  corner = positions[7]
  Cartesian3.add(normal, south, corner)
  Cartesian3.add(corner, east, corner)

  const length = positions.length
  for (let i = 0; i < length; ++i) {
    const position = positions[i]
    Cartesian3.add(center, position, position)
    const cartographic = ellipsoid.cartesianToCartographic(
      position,
      projectTo2DCartographicScratch
    )
    projection.project(cartographic, position)
  }

  result = BoundingSphere.fromPoints(positions, result)

  // swizzle center components
  center = result.center
  const x = center.x
  const y = center.y
  const z = center.z
  center.x = z
  center.y = x
  center.z = y

  return result
}
