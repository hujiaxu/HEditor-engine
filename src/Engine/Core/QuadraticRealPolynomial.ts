import HEditorMath from './Math'

export const addWithCancellationCheck = (
  left: number,
  right: number,
  tolerance: number
) => {
  const difference = left + right
  if (
    HEditorMath.sign(left) !== HEditorMath.sign(right) &&
    Math.abs(difference / Math.max(Math.abs(left), Math.abs(right))) < tolerance
  ) {
    return 0.0
  }

  return difference
}
export default class QuarticRealPolynomial {
  static computeRealRoots: (
    a: number,
    b: number,
    c: number
  ) => number[] | undefined
}

QuarticRealPolynomial.computeRealRoots = (a: number, b: number, c: number) => {
  if (typeof a !== 'number') {
    throw new Error('a must be a number')
  }

  if (typeof b !== 'number') {
    throw new Error('b must be a number')
  }

  if (typeof c !== 'number') {
    throw new Error('c must be a number')
  }

  let ratio

  if (a === 0.0) {
    if (b === 0.0) {
      return []
    }

    return [-c / b]
  } else if (b === 0.0) {
    if (c === 0.0) {
      return [0.0, 0.0]
    }

    const cMagnitude = Math.abs(c)
    const aMagnitude = Math.abs(a)

    if (
      cMagnitude < aMagnitude &&
      cMagnitude / aMagnitude < HEditorMath.EPSILON14
    ) {
      return [0.0, 0.0]
    } else if (
      cMagnitude > aMagnitude &&
      aMagnitude / cMagnitude < HEditorMath.EPSILON14
    ) {
      return []
    }

    ratio = -c / a

    if (ratio < 0.0) {
      return []
    }

    const root = Math.sqrt(ratio)
    return [-root, root]
  } else if (c === 0.0) {
    ratio = -b / a

    if (ratio < 0.0) {
      return [ratio, 0.0]
    }

    return [0.0, ratio]
  }

  // a * x^2 + b * x + c = 0

  const b2 = b * b
  const four_ac = 4.0 * a * c
  const radicand = addWithCancellationCheck(b2, -four_ac, HEditorMath.EPSILON14)

  if (radicand < 0.0) {
    return []
  }

  const q =
    -0.5 *
    addWithCancellationCheck(
      b,
      HEditorMath.sign(b) * Math.sqrt(radicand),
      HEditorMath.EPSILON14
    )

  if (b > 0.0) {
    return [q / a, c / q]
  }

  return [c / q, q / a]
}
