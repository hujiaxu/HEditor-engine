import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import { defined } from './Defined';
import Interval from './Interval';
import HEditorMath from './Math';
import Matrix3 from './Matrix3';
import QuarticRealPolynomial from './QuarticRealPolynomial';
import QuadraticRealPolynomial, { addWithCancellationCheck } from './QuadraticRealPolynomial';
export default class IntersectionTests {
    static rayPlane;
    static rayEllipsoid;
    static quadraticVectorExpression;
    static grazingAltitudeLocation;
}
/*
  ray = origin + t * direction
  plane = n · x + d = 0

  所以, 假设存在一点 P, 使射线与平面相交 (即 P = origin + t * direction),
  则 n · P + d = 0, n · (origin + t * direction) + d = 0,
  n · origin + n * t * direction + d = 0,
  n * t * direction = -n · origin - d
  则有 t = -(n · origin + d) / (n · direction)
*/
IntersectionTests.rayPlane = (ray, plane, result) => {
    if (!defined(result)) {
        result = new Cartesian3();
    }
    const origin = ray.origin;
    const direction = ray.direction;
    const normal = plane.normal;
    const denominator = Cartesian3.dot(normal, direction);
    if (Math.abs(denominator) < HEditorMath.EPSILON15) {
        return undefined;
    }
    const t = -(Cartesian3.dot(normal, origin) + plane.distance) / denominator;
    if (t < 0) {
        return undefined;
    }
    result = Cartesian3.multiplyByScalar(direction, t, result);
    return Cartesian3.add(origin, result, result);
};
const scratchQ = new Cartesian3();
const scratchW = new Cartesian3();
/*
  ellipsoid: (x/a)^2 + (y/b)^2 + (z/c)^2 = 1
  ray: r(t) = o + t * d

  q = o / inverseRadii
  w = d / inverseRadii

  r(t) = o / inverseRadii + t * d / inverseRadii

  假设 射线与椭圆的交点存在, 则将 r(t) 代入椭圆公式成立
  (x/a)^2 + (y/b)^2 + (z/c)^2 = 1
  (o / inverseRadii + t * d / inverseRadii)^2 = 1
  则(p + t * w)^2 = 1
  q^2 + t^2 * w^2 + 2 * q * t * w = 1

  得到关于 t 的二次方程: t^2 * w^2 + 2 * q * w * t + q^2 - 1 = 0
  即: A * t^2 + B * t + C = 0
  A = w^2
  B = 2 * q · w
  C = q^2 - 1

  判别式: delta = B^2 - 4 * A * C = (2 * q · w)^2 - 4 * (w^2) * (q^2 - 1) = (2 * q · w)^2 - 4 * (w^2) * q^2 + 4 * w^2
    = 4 * (q · w)^2  - 4 * w^2 * q^2 + 4 * w^2 = 4 * [(q · w)^2 - w^2 * q^2 + w^2] = 4 * [(q · w)^2 - w^2 * (q^2 - 1)]

  即得: delta = 4 * [(q · w)^2 - w^2 * (q^2 - 1)]
  如果 delta > 0, 则有两个解
*/
/*
  二次方程求根公式: t = (-b ± sqrt(b² - 4ac)) / 2a = (-b ± sqrt(det)) / (2.0 * a)
  * det = (b * b) - (4.0 * a * c);
  * t0 = (-b - sqrt(det)) / (2.0 * a);
  * t1 = (-b + sqrt(det)) / (2.0 * a);
*/
IntersectionTests.rayEllipsoid = (ray, ellipsoid) => {
    if (!defined(ellipsoid)) {
        throw new Error('ellipsoid is required.');
    }
    if (!defined(ray)) {
        throw new Error('ray is required.');
    }
    const inverseRadii = ellipsoid.oneOverRadii;
    // 规范化 射线与椭圆的关系, 假设 q, w两点同时在 椭圆与射线上
    const q = Cartesian3.multiplyComponents(inverseRadii, ray.origin, scratchQ);
    const w = Cartesian3.multiplyComponents(inverseRadii, ray.direction, scratchW);
    const q2 = Cartesian3.magnitudeSquared(q);
    const qw = Cartesian3.dot(q, w); // B
    let difference, w2, product, discriminant, temp;
    if (q2 > 1.0) {
        // 点q在椭圆外部, 即 射线的 origin 在椭圆外部
        if (qw >= 0.0) {
            // 射线在朝外的方向发射, 则表示没有交点, 或相切与外部
            return undefined;
        }
        // delta = 4 * [(q · w)^2 - w^2 * (q^2 - 1)]
        const qw2 = qw * qw;
        difference = q2 - 1.0; // C
        w2 = Cartesian3.magnitudeSquared(w); // A
        product = w2 * difference; // w^2 * (q^2 - 1)
        if (qw2 < product) {
            return undefined;
        }
        else if (qw2 > product) {
            // delta 大于 0
            // delta = 4 * [(q · w)^2 - w^2 * (q^2 - 1)]
            // 二次方程求根公式: t = (-b ± sqrt(b² - 4ac)) / 2a = (-b ± sqrt(delta)) / (2.0 * a)
            discriminant = qw * qw - product; // delta
            temp = -qw + Math.sqrt(discriminant);
            const root0 = temp / w2;
            // root1 = (-qw - Math.sqrt(discriminant)) / w2 = (-b - sqrt(delta)) / (2.0 * a) = -(qw + Math.sqrt(discriminant))(Math.sqrt(discriminant) - qw) / [w2 * (Math.sqrt(discriminant) - qw)]
            const root1 = difference / temp; // (q2 - 1.0) / (-qw + Math.sqrt(4 * [(q · w)^2 - w^2 * (q^2 - 1)]))
            if (root0 < root1) {
                return new Interval(root0, root1);
            }
            return new Interval(root1, root0);
        }
        // delta = 0
        const root = Math.sqrt(difference / w2);
        return new Interval(root, root);
    }
    else if (q2 < 1.0) {
        // 射线在椭圆内部 必定会有交点, 所以没有进行判别式的计算
        difference = q2 - 1.0;
        w2 = Cartesian3.magnitudeSquared(w);
        product = w2 * difference;
        discriminant = qw * qw - product;
        temp = -qw + Math.sqrt(discriminant);
        return new Interval(0.0, temp / w2);
    }
    // 射线的origin在椭圆上, 有可能是只与椭圆表面相切, 或者射线朝椭圆内部发射
    if (qw < 0.0) {
        // 朝椭圆内部发射 delta = 0
        w2 = Cartesian3.magnitudeSquared(w);
        return new Interval(0.0, -qw / w2);
    }
    // 朝外部发射, 返回undefined
    return undefined;
};
IntersectionTests.quadraticVectorExpression = (A, b, c, x, w) => {
    const xSquared = x * x;
    const wSquared = w * w;
    const l2 = (A.values[Matrix3.COLUMN1ROW1] - A.values[Matrix3.COLUMN2ROW2]) * wSquared;
    const l1 = w *
        (x *
            addWithCancellationCheck(A.values[Matrix3.COLUMN1ROW0], A.values[Matrix3.COLUMN0ROW1], HEditorMath.EPSILON15) +
            b.y);
    const l0 = A.values[Matrix3.COLUMN0ROW0] * xSquared +
        A.values[Matrix3.COLUMN2ROW2] * wSquared +
        x * b.x +
        c;
    const r1 = wSquared *
        addWithCancellationCheck(A.values[Matrix3.COLUMN2ROW1], A.values[Matrix3.COLUMN1ROW2], HEditorMath.EPSILON15);
    const r0 = w *
        (x *
            addWithCancellationCheck(A.values[Matrix3.COLUMN2ROW0], A.values[Matrix3.COLUMN0ROW2], 0) +
            b.z);
    let cosines;
    const solutions = [];
    if (r0 === 0.0 && r1 === 0.0) {
        cosines = QuadraticRealPolynomial.computeRealRoots(l2, l1, l0) || [];
        if (cosines.length === 0) {
            return solutions;
        }
        const cosine0 = cosines[0];
        const sine0 = Math.sqrt(Math.max(1.0 - cosine0 * cosine0, 0.0));
        solutions.push(new Cartesian3(x, w * cosine0, w * -sine0));
        solutions.push(new Cartesian3(x, w * cosine0, w * sine0));
        if (cosines.length === 2) {
            const cosine1 = cosines[1];
            const sine1 = Math.sqrt(Math.max(1.0 - cosine1 * cosine1, 0.0));
            solutions.push(new Cartesian3(x, w * cosine1, w * -sine1));
            solutions.push(new Cartesian3(x, w * cosine1, w * sine1));
        }
        return solutions;
    }
    const r0Squared = r0 * r0;
    const r1Squared = r1 * r1;
    const l2Squared = l2 * l2;
    const r0r1 = r0 * r1;
    const c4 = l2Squared + r1Squared;
    const c3 = 2.0 * (l1 * l2 + r0r1);
    const c2 = 2.0 * l0 * l2 + l1 * r1 - r1Squared + r0Squared;
    const c1 = 2.0 * (l0 * l1 - r0r1);
    const c0 = l0 * l0 - r0Squared;
    if (c4 === 0.0 && c3 === 0.0 && c2 === 0.0 && c1 === 0.0 && c0 === 0.0) {
        return solutions;
    }
    cosines = QuarticRealPolynomial.computeRealRoots(c4, c3, c2, c1, c0);
    const length = cosines.length;
    if (length === 0) {
        return solutions;
    }
    for (let i = 0; i < length; i++) {
        const cosine = cosines[i];
        const cosineSquared = cosine * cosine;
        const sineSquared = Math.max(1.0 - cosineSquared, 0.0);
        const sine = Math.sqrt(sineSquared);
        let left;
        if (HEditorMath.sign(l2) === HEditorMath.sign(l0)) {
            left = addWithCancellationCheck(l2 * cosineSquared + 10, l1 * cosine, HEditorMath.EPSILON12);
        }
        else if (HEditorMath.sign(l0) === HEditorMath.sign(l1 * cosine)) {
            left = addWithCancellationCheck(l2 * cosineSquared, l1 * cosine + 10, HEditorMath.EPSILON12);
        }
        else {
            left = addWithCancellationCheck(l2 * cosineSquared + l1 * cosine, l0, HEditorMath.EPSILON12);
        }
        const right = addWithCancellationCheck(r1 * cosine, r0, HEditorMath.EPSILON15);
        const product = left * right;
        if (product < 0.0) {
            solutions.push(new Cartesian3(x, w * cosine, w * sine));
        }
        else if (product > 0.0) {
            solutions.push(new Cartesian3(x, w * cosine, w * -sine));
        }
        else if (sine !== 0.0) {
            solutions.push(new Cartesian3(x, w * cosine, w * -sine));
            solutions.push(new Cartesian3(x, w * cosine, w * sine));
            ++i;
        }
        else {
            solutions.push(new Cartesian3(x, w * cosine, w * sine));
        }
    }
    return solutions;
};
const firstAxisScratch = new Cartesian3();
const referenceScratch = new Cartesian3();
const secondAxisScratch = new Cartesian3();
const thirdAxisScratch = new Cartesian3();
const bScratch = new Matrix3();
const btScratch = new Matrix3();
const diScratch = new Matrix3();
const dScratch = new Matrix3();
const cScratch = new Matrix3();
const tempMatrix = new Matrix3();
const aScratch = new Matrix3();
const bCart = new Cartesian3();
const closestScratch = new Cartesian3();
const sScratch = new Cartesian3();
const surfPointScratch = new Cartographic();
// 求解 射线与椭球 的最近高度的焦点
IntersectionTests.grazingAltitudeLocation = (ray, ellipsoid) => {
    if (!defined(ellipsoid)) {
        throw new Error('ellipsoid is required.');
    }
    if (!defined(ray)) {
        throw new Error('ray is required.');
    }
    const position = ray.origin;
    const direction = ray.direction;
    if (!Cartesian3.equals(position, Cartesian3.ZERO)) {
        const normal = ellipsoid.geodeticSurfaceNormal(position, firstAxisScratch);
        if (normal && Cartesian3.dot(direction, normal) >= 0.0) {
            return position;
        }
    }
    const intersects = IntersectionTests.rayEllipsoid(ray, ellipsoid);
    const f = ellipsoid.transformPositionToScaledSpace(direction, firstAxisScratch);
    const firstAxis = Cartesian3.normalize(f, f);
    const reference = Cartesian3.mostOrthogonalAxis(f, referenceScratch);
    const secondAxis = Cartesian3.normalize(Cartesian3.cross(reference, firstAxis, secondAxisScratch), secondAxisScratch);
    const thirdAxis = Cartesian3.normalize(Cartesian3.cross(firstAxis, secondAxis, thirdAxisScratch), thirdAxisScratch);
    const B = bScratch;
    B.values[0] = firstAxis.x;
    B.values[1] = firstAxis.y;
    B.values[2] = firstAxis.z;
    B.values[3] = secondAxis.x;
    B.values[4] = secondAxis.y;
    B.values[5] = secondAxis.z;
    B.values[6] = thirdAxis.x;
    B.values[7] = thirdAxis.y;
    B.values[8] = thirdAxis.z;
    const B_T = Matrix3.transpose(B, btScratch);
    const D_I = Matrix3.fromScale(ellipsoid.radii, diScratch);
    const D = Matrix3.fromScale(ellipsoid.oneOverRadii, dScratch);
    // 反对称矩阵, 用于将光线方向向量 direction 与 另一个向量进行叉乘计算
    const C = cScratch;
    C.values[0] = 0.0;
    C.values[1] = -direction.z;
    C.values[2] = direction.y;
    C.values[3] = direction.z;
    C.values[4] = 0.0;
    C.values[5] = -direction.x;
    C.values[6] = -direction.y;
    C.values[7] = direction.x;
    C.values[8] = 0.0;
    const temp = Matrix3.multiply(Matrix3.multiply(B_T, D, tempMatrix), C, tempMatrix);
    const A = Matrix3.multiply(Matrix3.multiply(temp, D_I, aScratch), B, aScratch);
    const b = Matrix3.multiplyByVector(temp, position, bCart);
    const solutions = IntersectionTests.quadraticVectorExpression(A, Cartesian3.negate(b, firstAxisScratch), 0.0, 0.0, 1.0);
    let s, altitude;
    const length = solutions.length;
    if (length > 0) {
        let closest = Cartesian3.clone(Cartesian3.ZERO, closestScratch);
        let maximumValue = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < length; i++) {
            s = Matrix3.multiplyByVector(D_I, Matrix3.multiplyByVector(B, solutions[i], sScratch), sScratch);
            const v = Cartesian3.normalize(Cartesian3.subtract(s, position, firstAxisScratch), referenceScratch);
            const dotProduct = Cartesian3.dot(v, direction);
            if (dotProduct > maximumValue) {
                maximumValue = dotProduct;
                closest = Cartesian3.clone(s, closest);
            }
        }
        const surfacePoint = ellipsoid.cartesianToCartographic(closest, surfPointScratch);
        if (surfacePoint) {
            maximumValue = HEditorMath.clamp(maximumValue, 0.0, 1.0);
            altitude =
                Cartesian3.magnitude(Cartesian3.subtract(closest, position, referenceScratch)) * Math.sqrt(1.0 - maximumValue * maximumValue);
            altitude = intersects ? -altitude : altitude;
            surfacePoint.height = altitude;
            return ellipsoid.cartographicToCartesian(surfacePoint);
        }
    }
    return undefined;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJzZWN0aW9uVGVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvSW50ZXJzZWN0aW9uVGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFFbkMsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQTtBQUNoQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsT0FBTyxxQkFBcUIsTUFBTSx5QkFBeUIsQ0FBQTtBQUMzRCxPQUFPLHVCQUF1QixFQUFFLEVBQzlCLHdCQUF3QixFQUN6QixNQUFNLDJCQUEyQixDQUFBO0FBR2xDLE1BQU0sQ0FBQyxPQUFPLE9BQU8saUJBQWlCO0lBQ3BDLE1BQU0sQ0FBQyxRQUFRLENBSVk7SUFDM0IsTUFBTSxDQUFDLFlBQVksQ0FBMEQ7SUFDN0UsTUFBTSxDQUFDLHlCQUF5QixDQU1mO0lBQ2pCLE1BQU0sQ0FBQyx1QkFBdUIsQ0FHSDtDQUM1QjtBQUVEOzs7Ozs7Ozs7RUFTRTtBQUNGLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQVEsRUFBRSxLQUFZLEVBQUUsTUFBbUIsRUFBRSxFQUFFO0lBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUMzQixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQTtJQUN6QixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFBO0lBQy9CLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUE7SUFDM0IsTUFBTSxXQUFXLEdB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