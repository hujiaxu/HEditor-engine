import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import defaultValue from './DefaultValue';
import Defined from './Defined';
import Ellipsoid from './Ellipsoid';
import GeographicProjection from './GeographicProjection';
import { Intersect } from './IntersectionTests';
// import HEditorMath from './Math'
import Matrix4 from './Matrix4';
import { Check } from '..';
export default class BoundingSphere {
    center;
    radius;
    static transform;
    static union;
    static clone;
    static intersectPlane;
    static fromPoints;
    static projectTo2D;
    constructor(center = new Cartesian3(), radius = 0.0) {
        this.center = center;
        this.radius = radius;
    }
    clone(result) {
        return BoundingSphere.clone(this, result);
    }
}
BoundingSphere.clone = (sphere, result = new BoundingSphere()) => {
    result.center = sphere.center;
    result.radius = sphere.radius;
    return result;
};
BoundingSphere.transform = function (sphere, transform, result = new BoundingSphere()) {
    result.center = Matrix4.multiplyByPoint(transform, sphere.center, result.center);
    result.radius = Matrix4.getMaximumScale(transform) * sphere.radius;
    return result;
};
const unionScratch = new Cartesian3();
const unionScratchCenter = new Cartesian3();
BoundingSphere.union = (left, right, result) => {
    if (!result) {
        result = new BoundingSphere();
    }
    const leftCenter = left.center;
    const leftRadius = left.radius;
    const rightCenter = right.center;
    const rightRadius = right.radius;
    const toRightCenter = Cartesian3.subtract(rightCenter, leftCenter, unionScratch);
    const centerSeparation = Cartesian3.magnitude(toRightCenter);
    if (leftRadius >= centerSeparation + rightRadius) {
        // Left sphere wins.
        // left.clone(result);
        BoundingSphere.clone(left, result);
        return result;
    }
    if (rightRadius >= centerSeparation + leftRadius) {
        // Right sphere wins.
        // right.clone(result);
        BoundingSphere.clone(right, result);
        return result;
    }
    // There are two tangent points, one on far side of each sphere.
    const halfDistanceBetweenTangentPoints = (leftRadius + centerSeparation + rightRadius) * 0.5;
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
    const center = Cartesian3.multiplyByScalar(toRightCenter, (-leftRadius + halfDistanceBetweenTangentPoints) / centerSeparation, unionScratchCenter);
    Cartesian3.add(center, leftCenter, center);
    Cartesian3.clone(center, result.center);
    result.radius = halfDistanceBetweenTangentPoints;
    return result;
};
BoundingSphere.intersectPlane = (sphere, plane) => {
    // >>includeStart('debug', pragmas.debug);
    Check.typeOf.object('sphere', sphere);
    Check.typeOf.object('plane', plane);
    // >>includeEnd('debug');
    const center = sphere.center;
    const radius = sphere.radius;
    const normal = plane.normal;
    const distanceToPlane = Cartesian3.dot(normal, center) + plane.distance;
    if (distanceToPlane < -radius) {
        // The center point is negative side of the plane normal
        return Intersect.OUTSIDE;
    }
    else if (distanceToPlane < radius) {
        // The center point is positive side of the plane, but radius extends beyond it; partial overlap
        return Intersect.INTERSECTING;
    }
    return Intersect.INSIDE;
};
const fromPointsXMin = new Cartesian3();
const fromPointsYMin = new Cartesian3();
const fromPointsZMin = new Cartesian3();
const fromPointsXMax = new Cartesian3();
const fromPointsYMax = new Cartesian3();
const fromPointsZMax = new Cartesian3();
const fromPointsCurrentPos = new Cartesian3();
const fromPointsScratch = new Cartesian3();
const fromPointsRitterCenter = new Cartesian3();
const fromPointsMinBoxPt = new Cartesian3();
const fromPointsMaxBoxPt = new Cartesian3();
const fromPointsNaiveCenterScratch = new Cartesian3();
// const volumeConstant = (4.0 / 3.0) * HEditorMath.PI;
BoundingSphere.fromPoints = (positions, result = new BoundingSphere()) => {
    if (!Defined(result)) {
        result = new BoundingSphere();
    }
    if (!Defined(positions) || positions.length === 0) {
        result.center = Cartesian3.clone(Cartesian3.ZERO, result.center);
        result.radius = 0.0;
        return result;
    }
    const currentPos = Cartesian3.clone(positions[0], fromPointsCurrentPos);
    const xMin = Cartesian3.clone(currentPos, fromPointsXMin);
    const yMin = Cartesian3.clone(currentPos, fromPointsYMin);
    const zMin = Cartesian3.clone(currentPos, fromPointsZMin);
    const xMax = Cartesian3.clone(currentPos, fromPointsXMax);
    const yMax = Cartesian3.clone(currentPos, fromPointsYMax);
    const zMax = Cartesian3.clone(currentPos, fromPointsZMax);
    const numPositions = positions.length;
    let i;
    for (i = 1; i < numPositions; i++) {
        Cartesian3.clone(positions[i], currentPos);
        const x = currentPos.x;
        const y = currentPos.y;
        const z = currentPos.z;
        // Store points containing the the smallest and largest components
        if (x < xMin.x) {
            Cartesian3.clone(currentPos, xMin);
        }
        if (x > xMax.x) {
            Cartesian3.clone(currentPos, xMax);
        }
        if (y < yMin.y) {
            Cartesian3.clone(currentPos, yMin);
        }
        if (y > yMax.y) {
            Cartesian3.clone(currentPos, yMax);
        }
        if (z < zMin.z) {
            Cartesian3.clone(currentPos, zMin);
        }
        if (z > zMax.z) {
            Cartesian3.clone(currentPos, zMax);
        }
    }
    // Compute x-, y-, and z-spans (Squared distances b/n each component's min. and max.).
    const xSpan = Cartesian3.magnitudeSquared(Cartesian3.subtract(xMax, xMin, fromPointsScratch));
    const ySpan = Cartesian3.magnitudeSquared(Cartesian3.subtract(yMax, yMin, fromPointsScratch));
    const zSpan = Cartesian3.magnitudeSquared(Cartesian3.subtract(zMax, zMin, fromPointsScratch));
    // Set the diameter endpoints to the largest span.
    let diameter1 = xMin;
    let diameter2 = xMax;
    let maxSpan = xSpan;
    if (ySpan > maxSpan) {
        maxSpan = ySpan;
        diameter1 = yMin;
        diameter2 = yMax;
    }
    if (zSpan > maxSpan) {
        maxSpan = zSpan;
        diameter1 = zMin;
        diameter2 = zMax;
    }
    // Calculate the center of the initial sphere found by Ritter's algorithm
    const ritterCenter = fromPointsRitterCenter;
    ritterCenter.x = (diameter1.x + diameter2.x) * 0.5;
    ritterCenter.y = (diameter1.y + diameter2.y) * 0.5;
    ritterCenter.z = (diameter1.z + diameter2.z) * 0.5;
    // Calculate the radius of the initial sphere found by Ritter's algorithm
    let radiusSquared = Cartesian3.magnitudeSquared(Cartesian3.subtract(diameter2, ritterCenter, fromPointsScratch));
    let ritterRadius = Math.sqrt(radiusSquared);
    // Find the center of the sphere found using the Naive method.
    const minBoxPt = fromPointsMinBoxPt;
    minBoxPt.x = xMin.x;
    minBoxPt.y = yMin.y;
    minBoxPt.z = zMin.z;
    const maxBoxPt = fromPointsMaxBoxPt;
    maxBoxPt.x = xMax.x;
    maxBoxPt.y = yMax.y;
    maxBoxPt.z = zMax.z;
    const naiveCenter = Cartesian3.midpoint(minBoxPt, maxBoxPt, fromPointsNaiveCenterScratch);
    // Begin 2nd pass to find naive radius and modify the ritter sphere.
    let naiveRadius = 0;
    for (i = 0; i < numPositions; i++) {
        Cartesian3.clone(positions[i], currentPos);
        // Find the furthest point from the naive center to calculate the naive radius.
        const r = Cartesian3.magnitude(Cartesian3.subtract(currentPos, naiveCenter, fromPointsScratch));
        if (r > naiveRadius) {
            naiveRadius = r;
        }
        // Make adjustments to the Ritter Sphere to include all points.
        const oldCenterToPointSquared = Cartesian3.magnitudeSquared(Cartesian3.subtract(currentPos, ritterCenter, fromPointsScratch));
        if (oldCenterToPointSquared > radiusSquared) {
            const oldCenterToPoint = Math.sqrt(oldCenterToPointSquared);
            // Calculate new radius to include the point that lies outside
            ritterRadius = (ritterRadius + oldCenterToPoint) * 0.5;
            radiusSquared = ritterRadius * ritterRadius;
            // Calculate center of new Ritter sphere
            const oldToNew = oldCenterToPoint - ritterRadius;
            ritterCenter.x =
                (ritterRadius * ritterCenter.x + oldToNew * currentPos.x) /
                    oldCenterToPoint;
            ritterCenter.y =
                (ritterRadius * ritterCenter.y + oldToNew * currentPos.y) /
                    oldCenterToPoint;
            ritterCenter.z =
                (ritterRadius * ritterCenter.z + oldToNew * currentPos.z) /
                    oldCenterToPoint;
        }
    }
    if (ritterRadius < naiveRadius) {
        Cartesian3.clone(ritterCenter, result.center);
        result.radius = ritterRadius;
    }
    else {
        Cartesian3.clone(naiveCenter, result.center);
        result.radius = naiveRadius;
    }
    return result;
};
const projectTo2DNormalScratch = new Cartesian3();
const projectTo2DEastScratch = new Cartesian3();
const projectTo2DNorthScratch = new Cartesian3();
const projectTo2DWestScratch = new Cartesian3();
const projectTo2DSouthScratch = new Cartesian3();
const projectTo2DCartographicScratch = new Cartographic();
const projectTo2DPositionsScratch = new Array(8);
for (let n = 0; n < 8; ++n) {
    projectTo2DPositionsScratch[n] = new Cartesian3();
}
const projectTo2DProjection = new GeographicProjection();
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
BoundingSphere.projectTo2D = function (sphere, projection, result = new BoundingSphere()) {
    // >>includeStart('debug', pragmas.debug);
    Check.typeOf.object('sphere', sphere);
    // >>includeEnd('debug');
    projectTo2DProjection.ellipsoid = Ellipsoid.default;
    projection = defaultValue(projection, projectTo2DProjection);
    const ellipsoid = projection.ellipsoid;
    let center = sphere.center;
    const radius = sphere.radius;
    let normal;
    if (Cartesian3.equals(center, Cartesian3.ZERO)) {
        // Bounding sphere is at the center. The geodetic surface normal is not
        // defined here so pick the x-axis as a fallback.
        normal = Cartesian3.clone(Cartesian3.UNIT_X, projectTo2DNormalScratch);
    }
    else {
        normal = ellipsoid.geodeticSurfaceNormal(center, projectTo2DNormalScratch);
    }
    const east = Cartesian3.cross(Cartesian3.UNIT_Z, normal, projectTo2DEastScratch);
    Cartesian3.normalize(east, east);
    const north = Cartesian3.cross(normal, east, projectTo2DNorthScratch);
    Cartesian3.normalize(north, north);
    Cartesian3.multiplyByScalar(normal, radius, normal);
    Cartesian3.multiplyByScalar(north, radius, north);
    Cartesian3.multiplyByScalar(east, radius, east);
    const south = Cartesian3.negate(north, projectTo2DSouthScratch);
    const west = Cartesian3.negate(east, projectTo2DWestScratch);
    const positions = projectTo2DPositionsScratch;
    // top NE corner
    let corner = positions[0];
    Cartesian3.add(normal, north, corner);
    Cartesian3.add(corner, east, corner);
    // top NW corner
    corner = positions[1];
    Cartesian3.add(normal, north, corner);
    Cartesian3.add(corner, west, corner);
    // top SW corner
    corner = positions[2];
    Cartesian3.add(normal, south, corner);
    Cartesian3.add(corner, west, corner);
    // top SE corner
    corner = positions[3];
    Cartesian3.add(normal, south, corner);
    Cartesian3.add(corner, east, corner);
    Cartesian3.negate(normal, normal);
    // bottom NE corner
    corner = positions[4];
    Cartesian3.add(normal, north, corner);
    Cartesian3.add(corner, east, corner);
    // bottom NW corner
    corner = positions[5];
    Cartesian3.add(normal, north, corner);
    Cartesian3.add(corner, west, corner);
    // bottom SW corner
    corner = positions[6];
    Cartesian3.add(normal, south, corner);
    Cartesian3.add(corner, west, corner);
    // bottom SE corner
    corner = positions[7];
    Cartesian3.add(normal, south, corner);
    Cartesian3.add(corner, east, corner);
    const length = positions.length;
    for (let i = 0; i < length; ++i) {
        const position = positions[i];
        Cartesian3.add(center, position, position);
        const cartographic = ellipsoid.cartesianToCartographic(position, projectTo2DCartographicScratch);
        projection.project(cartographic, position);
    }
    result = BoundingSphere.fromPoints(positions, result);
    // swizzle center components
    center = result.center;
    const x = center.x;
    const y = center.y;
    const z = center.z;
    center.x = z;
    center.y = x;
    center.z = y;
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm91bmRpbmdTcGhlcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvQm91bmRpbmdTcGhlcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUE7QUFDbkMsT0FBTyxvQkFBb0IsTUFBTSx3QkFBd0IsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDL0MsbUNBQW1DO0FBQ25DLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBRTFCLE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBYztJQUNqQyxNQUFNLENBQVk7SUFDbEIsTUFBTSxDQUFRO0lBQ2QsTUFBTSxDQUFDLFNBQVMsQ0FJRztJQUNuQixNQUFNLENBQUMsS0FBSyxDQUlPO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBR087SUFDbkIsTUFBTSxDQUFDLGNBQWMsQ0FBcUQ7SUFDMUUsTUFBTSxDQUFDLFVBQVUsQ0FHRTtJQUNuQixNQUFNLENBQUMsV0FBVyxDQUlDO0lBRW5CLFlBQVksU0FBcUIsSUFBSSxVQUFVLEVBQUUsRUFBRSxTQUFpQixHQUFHO1FBQ3JFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBdUI7UUFDM0IsT0FBTyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0NBQ0Y7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QyxDQUFBO0lBRXBDLG1CQUFtQjtJQUNuQixNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3JCLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNyQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFFcEMsbUJBQW1CO0lBQ25CLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDckIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ3JDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUVwQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFBO0lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNoQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzFDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDcEQsUUFBUSxFQUNSLDhCQUE4QixDQUMvQixDQUFBO1FBQ0QsVUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUVELE1BQU0sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUVyRCw0QkFBNEI7SUFDNUIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUE7SUFDdEIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNsQixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ2xCLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDbEIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDWixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNaLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRVosT0FBTyxNQUFNLENBQUE7QUFDZixDQUFDLENBQUEifQ==