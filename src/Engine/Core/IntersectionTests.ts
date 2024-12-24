import Cartesian3 from './Cartesian3'
import Cartographic from './Cartographic'
import defined from './Defined'
import Ellipsoid from './Ellipsoid'
import Interval from './Interval'
import HEditorMath from './Math'
import Matrix3 from './Matrix3'
import Plane from './Plane'
import QuarticRealPolynomial from './QuarticRealPolynomial'
import QuadraticRealPolynomial, {
  addWithCancellationCheck
} from './QuadraticRealPolynomial'
import Ray from './Ray'

export default class IntersectionTests {
  static rayPlane: (
    ray: Ray,
    plane: Plane,
    result?: Cartesian3
  ) => Cartesian3 | undefined
  static rayEllipsoid: (ray: Ray, ellipsoid: Ellipsoid) => Interval | undefined
  static quadraticVectorExpression: (
    A: Matrix3,
    b: Cartesian3,
    c: number,
    x: number,
    w: number
  ) => Cartesian3[]
  static grazingAltitudeLocation: (
    ray: Ray,
    ellipsoid: Ellipsoid
  ) => Cartesian3 | undefined
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
IntersectionTests.rayPlane = (ray: Ray, plane: Plane, result?: Cartesian3) => {
  if (!defined(result)) {
    result = new Cartesian3()
  }

  const origin = ray.origin
  const direction = ray.direction
  const normal = plane.normal
  const denominator = Cartesian3.dot(normal, direction)

  if (Math.abs(denominator) < HEditorMath.EPSILON15) {
    return undefined
  }

  const t = -(Cartesian3.dot(normal, origin) + plane.distance) / denominator
  if (t < 0) {
    return undefined
  }

  result = Cartesian3.multiplyByScalar(direction, t, result)
  return Cartesian3.add(origin, result, result)
}

const scratchQ = new Cartesian3()
const scratchW = new Cartesian3()

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
IntersectionTests.rayEllipsoid = (ray: Ray, ellipsoid: Ellipsoid) => {
  if (!defined(ellipsoid)) {
    throw new Error('ellipsoid is required.')
  }
  if (!defined(ray)) {
    throw new Error('ray is required.')
  }

  const inverseRadii = ellipsoid.oneOverRadii

  // 规范化 射线与椭圆的关系, 假设 q, w两点同时在 椭圆与射线上
  const q = Cartesian3.multiplyComponents(inverseRadii, ray.origin, scratchQ)
  const w = Cartesian3.multiplyComponents(inverseRadii, ray.direction, scratchW)

  const q2 = Cartesian3.magnitudeSquared(q)
  const qw = Cartesian3.dot(q, w) // B

  let difference, w2, product, discriminant, temp

  if (q2 > 1.0) {
    // 点q在椭圆外部, 即 射线的 origin 在椭圆外部
    if (qw >= 0.0) {
      // 射线在朝外的方向发射, 则表示没有交点, 或相切与外部
      return undefined
    }

    // delta = 4 * [(q · w)^2 - w^2 * (q^2 - 1)]
    const qw2 = qw * qw
    difference = q2 - 1.0 // C
    w2 = Cartesian3.magnitudeSquared(w) // A
    product = w2 * difference // w^2 * (q^2 - 1)

    if (qw2 < product) {
      return undefined
    } else if (qw2 > product) {
      // delta 大于 0
      // delta = 4 * [(q · w)^2 - w^2 * (q^2 - 1)]
      // 二次方程求根公式: t = (-b ± sqrt(b² - 4ac)) / 2a = (-b ± sqrt(delta)) / (2.0 * a)
      discriminant = qw * qw - product // delta
      temp = -qw + Math.sqrt(discriminant)
      const root0 = temp / w2

      // root1 = (-qw - Math.sqrt(discriminant)) / w2 = (-b - sqrt(delta)) / (2.0 * a) = -(qw + Math.sqrt(discriminant))(Math.sqrt(discriminant) - qw) / [w2 * (Math.sqrt(discriminant) - qw)]
      const root1 = difference / temp // (q2 - 1.0) / (-qw + Math.sqrt(4 * [(q · w)^2 - w^2 * (q^2 - 1)]))
      if (root0 < root1) {
        return new Interval(root0, root1)
      }

      return new Interval(root1, root0)
    }

    // delta = 0
    const root = Math.sqrt(difference / w2)
    return new Interval(root, root)
  } else if (q2 < 1.0) {
    // 射线在椭圆内部 必定会有交点, 所以没有进行判别式的计算
    difference = q2 - 1.0
    w2 = Cartesian3.magnitudeSquared(w)
    product = w2 * difference

    discriminant = qw * qw - product
    temp = -qw + Math.sqrt(discriminant)
    return new Interval(0.0, temp / w2)
  }

  // 射线的origin在椭圆上, 有可能是只与椭圆表面相切, 或者射线朝椭圆内部发射
  if (qw < 0.0) {
    // 朝椭圆内部发射 delta = 0
    w2 = Cartesian3.magnitudeSquared(w)
    return new Interval(0.0, -qw / w2)
  }

  // 朝外部发射, 返回undefined

  return undefined
}

IntersectionTests.quadraticVectorExpression = (
  A: Matrix3,
  b: Cartesian3,
  c: number,
  x: number,
  w: number
) => {
  const xSquared = x * x
  const wSquared = w * w

  const l2 =
    (A.values[Matrix3.COLUMN1ROW1] - A.values[Matrix3.COLUMN2ROW2]) * wSquared
  const l1 =
    w *
    (x *
      addWithCancellationCheck(
        A.values[Matrix3.COLUMN1ROW0],
        A.values[Matrix3.COLUMN0ROW1],
        HEditorMath.EPSILON15
      ) +
      b.y)
  const l0 =
    A.values[Matrix3.COLUMN0ROW0] * xSquared +
    A.values[Matrix3.COLUMN2ROW2] * wSquared +
    x * b.x +
    c

  const r1 =
    wSquared *
    addWithCancellationCheck(
      A.values[Matrix3.COLUMN2ROW1],
      A.values[Matrix3.COLUMN1ROW2],
      HEditorMath.EPSILON15
    )

  const r0 =
    w *
    (x *
      addWithCancellationCheck(
        A.values[Matrix3.COLUMN2ROW0],
        A.values[Matrix3.COLUMN0ROW2],
        0
      ) +
      b.z)

  let cosines

  const solutions: Cartesian3[] = []

  if (r0 === 0.0 && r1 === 0.0) {
    cosines = QuadraticRealPolynomial.computeRealRoots(l2, l1, l0) || []
    if (cosines.length === 0) {
      return solutions
    }

    const cosine0 = cosines[0]
    const sine0 = Math.sqrt(Math.max(1.0 - cosine0 * cosine0, 0.0))
    solutions.push(new Cartesian3(x, w * cosine0, w * -sine0))
    solutions.push(new Cartesian3(x, w * cosine0, w * sine0))

    if (cosines.length === 2) {
      const cosine1 = cosines[1]
      const sine1 = Math.sqrt(Math.max(1.0 - cosine1 * cosine1, 0.0))
      solutions.push(new Cartesian3(x, w * cosine1, w * -sine1))
      solutions.push(new Cartesian3(x, w * cosine1, w * sine1))
    }

    return solutions
  }

  const r0Squared = r0 * r0
  const r1Squared = r1 * r1
  const l2Squared = l2 * l2
  const r0r1 = r0 * r1

  const c4 = l2Squared + r1Squared
  const c3 = 2.0 * (l1 * l2 + r0r1)
  const c2 = 2.0 * l0 * l2 + l1 * r1 - r1Squared + r0Squared
  const c1 = 2.0 * (l0 * l1 - r0r1)
  const c0 = l0 * l0 - r0Squared

  if (c4 === 0.0 && c3 === 0.0 && c2 === 0.0 && c1 === 0.0 && c0 === 0.0) {
    return solutions
  }

  cosines = QuarticRealPolynomial.computeRealRoots(c4, c3, c2, c1, c0)
  const length = cosines.length
  if (length === 0) {
    return solutions
  }

  for (let i = 0; i < length; i++) {
    const cosine = cosines[i]
    const cosineSquared = cosine * cosine
    const sineSquared = Math.max(1.0 - cosineSquared, 0.0)
    const sine = Math.sqrt(sineSquared)

    let left
    if (HEditorMath.sign(l2) === HEditorMath.sign(l0)) {
      left = addWithCancellationCheck(
        l2 * cosineSquared + 10,
        l1 * cosine,
        HEditorMath.EPSILON12
      )
    } else if (HEditorMath.sign(l0) === HEditorMath.sign(l1 * cosine)) {
      left = addWithCancellationCheck(
        l2 * cosineSquared,
        l1 * cosine + 10,
        HEditorMath.EPSILON12
      )
    } else {
      left = addWithCancellationCheck(
        l2 * cosineSquared + l1 * cosine,
        l0,
        HEditorMath.EPSILON12
      )
    }

    const right = addWithCancellationCheck(
      r1 * cosine,
      r0,
      HEditorMath.EPSILON15
    )
    const product = left * right

    if (product < 0.0) {
      solutions.push(new Cartesian3(x, w * cosine, w * sine))
    } else if (product > 0.0) {
      solutions.push(new Cartesian3(x, w * cosine, w * -sine))
    } else if (sine !== 0.0) {
      solutions.push(new Cartesian3(x, w * cosine, w * -sine))
      solutions.push(new Cartesian3(x, w * cosine, w * sine))
      ++i
    } else {
      solutions.push(new Cartesian3(x, w * cosine, w * sine))
    }
  }

  return solutions
}

const firstAxisScratch = new Cartesian3()
const referenceScratch = new Cartesian3()
const secondAxisScratch = new Cartesian3()
const thirdAxisScratch = new Cartesian3()
const bScratch = new Matrix3()
const btScratch = new Matrix3()
const diScratch = new Matrix3()
const dScratch = new Matrix3()
const cScratch = new Matrix3()
const tempMatrix = new Matrix3()
const aScratch = new Matrix3()
const bCart = new Cartesian3()
const closestScratch = new Cartesian3()
const sScratch = new Cartesian3()
const surfPointScratch = new Cartographic()

// 求解 射线与椭球 的最近高度的焦点
IntersectionTests.grazingAltitudeLocation = (
  ray: Ray,
  ellipsoid: Ellipsoid
) => {
  if (!defined(ellipsoid)) {
    throw new Error('ellipsoid is required.')
  }
  if (!defined(ray)) {
    throw new Error('ray is required.')
  }

  const position = ray.origin
  const direction = ray.direction
  if (!Cartesian3.equals(position, Cartesian3.ZERO)) {
    const normal = ellipsoid.geodeticSurfaceNormal(position, firstAxisScratch)
    if (normal && Cartesian3.dot(direction, normal) >= 0.0) {
      return position
    }
  }

  const intersects = IntersectionTests.rayEllipsoid(ray, ellipsoid)

  const f = ellipsoid.transformPositionToScaledSpace(
    direction,
    firstAxisScratch
  )!

  const firstAxis = Cartesian3.normalize(f, f)
  const reference = Cartesian3.mostOrthogonalAxis(f, referenceScratch)
  const secondAxis = Cartesian3.normalize(
    Cartesian3.cross(reference, firstAxis, secondAxisScratch),
    secondAxisScratch
  )
  const thirdAxis = Cartesian3.normalize(
    Cartesian3.cross(firstAxis, secondAxis, thirdAxisScratch),
    thirdAxisScratch
  )
  const B = bScratch

  B.values[0] = firstAxis.x
  B.values[1] = firstAxis.y
  B.values[2] = firstAxis.z
  B.values[3] = secondAxis.x
  B.values[4] = secondAxis.y
  B.values[5] = secondAxis.z
  B.values[6] = thirdAxis.x
  B.values[7] = thirdAxis.y
  B.values[8] = thirdAxis.z

  const B_T = Matrix3.transpose(B, btScratch)

  const D_I = Matrix3.fromScale(ellipsoid.radii, diScratch)
  const D = Matrix3.fromScale(ellipsoid.oneOverRadii, dScratch)

  // 反对称矩阵, 用于将光线方向向量 direction 与 另一个向量进行叉乘计算
  const C = cScratch

  C.values[0] = 0.0
  C.values[1] = -direction.z
  C.values[2] = direction.y
  C.values[3] = direction.z
  C.values[4] = 0.0
  C.values[5] = -direction.x
  C.values[6] = -direction.y
  C.values[7] = direction.x
  C.values[8] = 0.0

  const temp = Matrix3.multiply(
    Matrix3.multiply(B_T, D, tempMatrix),
    C,
    tempMatrix
  )
  const A = Matrix3.multiply(Matrix3.multiply(temp, D_I, aScratch), B, aScratch)
  const b = Matrix3.multiplyByVector(temp, position, bCart)

  const solutions = IntersectionTests.quadraticVectorExpression(
    A,
    Cartesian3.negate(b, firstAxisScratch),
    0.0,
    0.0,
    1.0
  )

  let s, altitude
  const length = solutions.length
  if (length > 0) {
    let closest = Cartesian3.clone(Cartesian3.ZERO, closestScratch)
    let maximumValue = Number.NEGATIVE_INFINITY
    for (let i = 0; i < length; i++) {
      s = Matrix3.multiplyByVector(
        D_I,
        Matrix3.multiplyByVector(B, solutions[i], sScratch),
        sScratch
      )
      const v = Cartesian3.normalize(
        Cartesian3.subtract(s, position, firstAxisScratch),
        referenceScratch
      )
      const dotProduct = Cartesian3.dot(v, direction)
      if (dotProduct > maximumValue) {
        maximumValue = dotProduct
        closest = Cartesian3.clone(s, closest)
      }
    }

    const surfacePoint = ellipsoid.cartesianToCartographic(
      closest,
      surfPointScratch
    )
    if (surfacePoint) {
      maximumValue = HEditorMath.clamp(maximumValue, 0.0, 1.0)
      altitude =
        Cartesian3.magnitude(
          Cartesian3.subtract(closest, position, referenceScratch)
        ) * Math.sqrt(1.0 - maximumValue * maximumValue)
      altitude = intersects ? -altitude : altitude
      surfacePoint.height = altitude
      return ellipsoid.cartographicToCartesian(surfacePoint)
    }
  }

  return undefined
}
