import CubicRealPolynomial from './CubicRealPolynomial'
import HEditorMath from './Math'
import QuadraticRealPolynomial from './QuadraticRealPolynomial'

export default class QuarticRealPolynomial {
  static computeRealRoots: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => any
}

QuarticRealPolynomial.computeRealRoots = (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
) => {
  if (Math.abs(a) < HEditorMath.EPSILON15) {
    return CubicRealPolynomial.computeRealRoots(b, c, d, e)
  }
  const a3 = b / a
  const a2 = c / a
  const a1 = d / a
  const a0 = e / a

  let k = a3 < 0.0 ? 1 : 0
  k += a2 < 0.0 ? k + 1 : k
  k += a1 < 0.0 ? k + 1 : k
  k += a0 < 0.0 ? k + 1 : k

  switch (k) {
    case 0:
      return original(a3, a2, a1, a0)
    case 1:
      return neumark(a3, a2, a1, a0)
    case 2:
      return neumark(a3, a2, a1, a0)
    case 3:
      return original(a3, a2, a1, a0)
    case 4:
      return original(a3, a2, a1, a0)
    case 5:
      return neumark(a3, a2, a1, a0)
    case 6:
      return original(a3, a2, a1, a0)
    case 7:
      return original(a3, a2, a1, a0)
    case 8:
      return neumark(a3, a2, a1, a0)
    case 9:
      return original(a3, a2, a1, a0)
    case 10:
      return original(a3, a2, a1, a0)
    case 11:
      return neumark(a3, a2, a1, a0)
    case 12:
      return original(a3, a2, a1, a0)
    case 13:
      return original(a3, a2, a1, a0)
    case 14:
      return original(a3, a2, a1, a0)
    case 15:
      return original(a3, a2, a1, a0)
    default:
      return undefined
  }
}

function original(a3: number, a2: number, a1: number, a0: number) {
  const a3Squared = a3 * a3

  const p = a2 - (3.0 * a3Squared) / 8.0
  const q = a1 - (a2 * a3) / 2.0 + (a3Squared * a3) / 8.0
  const r =
    a0 -
    (a1 * a3) / 4.0 +
    (a2 * a3Squared) / 16.0 -
    (3.0 * a3Squared * a3Squared) / 256.0

  // Find the roots of the cubic equations:  h^6 + 2 p h^4 + (p^2 - 4 r) h^2 - q^2 = 0.
  const cubicRoots = CubicRealPolynomial.computeRealRoots(
    1.0,
    2.0 * p,
    p * p - 4.0 * r,
    -q * q
  ) as number[]

  if (cubicRoots.length > 0) {
    const temp = -a3 / 4.0

    // Use the largest positive root.
    const hSquared = cubicRoots[cubicRoots.length - 1]

    if (Math.abs(hSquared) < HEditorMath.EPSILON14) {
      // y^4 + p y^2 + r = 0.
      const roots = QuadraticRealPolynomial.computeRealRoots(
        1.0,
        p,
        r
      ) as number[]

      if (roots.length === 2) {
        const root0 = roots[0]
        const root1 = roots[1]

        let y
        if (root0 >= 0.0 && root1 >= 0.0) {
          const y0 = Math.sqrt(root0)
          const y1 = Math.sqrt(root1)

          return [temp - y1, temp - y0, temp + y0, temp + y1]
        } else if (root0 >= 0.0 && root1 < 0.0) {
          y = Math.sqrt(root0)
          return [temp - y, temp + y]
        } else if (root0 < 0.0 && root1 >= 0.0) {
          y = Math.sqrt(root1)
          return [temp - y, temp + y]
        }
      }
      return []
    } else if (hSquared > 0.0) {
      const h = Math.sqrt(hSquared)

      const m = (p + hSquared - q / h) / 2.0
      const n = (p + hSquared + q / h) / 2.0

      // Now solve the two quadratic factors:  (y^2 + h y + m)(y^2 - h y + n);
      const roots1 = QuadraticRealPolynomial.computeRealRoots(
        1.0,
        h,
        m
      ) as number[]
      const roots2 = QuadraticRealPolynomial.computeRealRoots(
        1.0,
        -h,
        n
      ) as number[]

      if (roots1.length !== 0) {
        roots1[0] += temp
        roots1[1] += temp

        if (roots2.length !== 0) {
          roots2[0] += temp
          roots2[1] += temp

          if (roots1[1] <= roots2[0]) {
            return [roots1[0], roots1[1], roots2[0], roots2[1]]
          } else if (roots2[1] <= roots1[0]) {
            return [roots2[0], roots2[1], roots1[0], roots1[1]]
          } else if (roots1[0] >= roots2[0] && roots1[1] <= roots2[1]) {
            return [roots2[0], roots1[0], roots1[1], roots2[1]]
          } else if (roots2[0] >= roots1[0] && roots2[1] <= roots1[1]) {
            return [roots1[0], roots2[0], roots2[1], roots1[1]]
          } else if (roots1[0] > roots2[0] && roots1[0] < roots2[1]) {
            return [roots2[0], roots1[0], roots2[1], roots1[1]]
          }
          return [roots1[0], roots2[0], roots1[1], roots2[1]]
        }
        return roots1
      }

      if (roots2.length !== 0) {
        roots2[0] += temp
        roots2[1] += temp

        return roots2
      }
      return []
    }
  }
  return []
}
function neumark(a3: number, a2: number, a1: number, a0: number) {
  const a1Squared = a1 * a1
  const a2Squared = a2 * a2
  const a3Squared = a3 * a3

  const p = -2.0 * a2
  const q = a1 * a3 + a2Squared - 4.0 * a0
  const r = a3Squared * a0 - a1 * a2 * a3 + a1Squared

  const cubicRoots = CubicRealPolynomial.computeRealRoots(
    1.0,
    p,
    q,
    r
  ) as number[]

  if (cubicRoots.length > 0) {
    // Use the most positive root
    const y = cubicRoots[0]

    const temp = a2 - y
    const tempSquared = temp * temp

    const g1 = a3 / 2.0
    const h1 = temp / 2.0

    const m = tempSquared - 4.0 * a0
    const mError = tempSquared + 4.0 * Math.abs(a0)

    const n = a3Squared - 4.0 * y
    const nError = a3Squared + 4.0 * Math.abs(y)

    let g2
    let h2

    if (y < 0.0 || m * nError < n * mError) {
      const squareRootOfN = Math.sqrt(n)
      g2 = squareRootOfN / 2.0
      h2 = squareRootOfN === 0.0 ? 0.0 : (a3 * h1 - a1) / squareRootOfN
    } else {
      const squareRootOfM = Math.sqrt(m)
      g2 = squareRootOfM === 0.0 ? 0.0 : (a3 * h1 - a1) / squareRootOfM
      h2 = squareRootOfM / 2.0
    }

    let G
    let g
    if (g1 === 0.0 && g2 === 0.0) {
      G = 0.0
      g = 0.0
    } else if (HEditorMath.sign(g1) === HEditorMath.sign(g2)) {
      G = g1 + g2
      g = y / G
    } else {
      g = g1 - g2
      G = y / g
    }

    let H
    let h
    if (h1 === 0.0 && h2 === 0.0) {
      H = 0.0
      h = 0.0
    } else if (HEditorMath.sign(h1) === HEditorMath.sign(h2)) {
      H = h1 + h2
      h = a0 / H
    } else {
      h = h1 - h2
      H = a0 / h
    }

    // Now solve the two quadratic factors:  (y^2 + G y + H)(y^2 + g y + h);
    const roots1 = QuadraticRealPolynomial.computeRealRoots(
      1.0,
      G,
      H
    ) as number[]
    const roots2 = QuadraticRealPolynomial.computeRealRoots(
      1.0,
      g,
      h
    ) as number[]

    if (roots1.length !== 0) {
      if (roots2.length !== 0) {
        if (roots1[1] <= roots2[0]) {
          return [roots1[0], roots1[1], roots2[0], roots2[1]]
        } else if (roots2[1] <= roots1[0]) {
          return [roots2[0], roots2[1], roots1[0], roots1[1]]
        } else if (roots1[0] >= roots2[0] && roots1[1] <= roots2[1]) {
          return [roots2[0], roots1[0], roots1[1], roots2[1]]
        } else if (roots2[0] >= roots1[0] && roots2[1] <= roots1[1]) {
          return [roots1[0], roots2[0], roots2[1], roots1[1]]
        } else if (roots1[0] > roots2[0] && roots1[0] < roots2[1]) {
          return [roots2[0], roots1[0], roots2[1], roots1[1]]
        }
        return [roots1[0], roots2[0], roots1[1], roots2[1]]
      }
      return roots1
    }
    if (roots2.length !== 0) {
      return roots2
    }
  }
  return []
}
