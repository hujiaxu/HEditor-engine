import Cartesian2 from './Cartesian2'
import Cartesian3 from './Cartesian3'
import HEditorMath from './Math'

export default class AttributeCompression {
  static octEncodeInRange: (
    vector: Cartesian3,
    rangeMax: number,
    result: Cartesian2
  ) => Cartesian2
  static compressTextureCoordinates: (textureCoordinates: Cartesian2) => number
  static octEncode: (vector: Cartesian3, result?: Cartesian2) => Cartesian2
  static octPackFloat: (encoded: Cartesian2) => number
  static octEncodeFloat: (vector: Cartesian3) => number
  static octPack: (
    v1: Cartesian3,
    v2: Cartesian3,
    v3: Cartesian3,
    result: Cartesian2
  ) => Cartesian2
}

/**
 * Encodes a normalized vector into a 2D value in the range [-rangeMax, rangeMax].
 * The encoding is done using the octahedral mapping, which maps a 3D vector to a 2D value.
 * The mapping is done in a way that the resulting 2D value is in the range [-rangeMax, rangeMax].
 * This function is used to encode normals for rendering.
 * @param {Cartesian3} vector The vector to encode.
 * @param {number} rangeMax The maximum value of the range.
 * @param {Cartesian2} result The object onto which to store the result.
 * @returns {Cartesian2} The modified result parameter.
 */
AttributeCompression.octEncodeInRange = (
  vector: Cartesian3,
  rangeMax: number,
  result: Cartesian2 = new Cartesian2()
) => {
  const magSquared = Cartesian3.magnitudeSquared(vector)
  if (Math.abs(magSquared - 1.0) > HEditorMath.EPSILON6) {
    throw new Error('vector must be normalized.')
  }

  result.x =
    vector.x / (Math.abs(vector.x) + Math.abs(vector.y) + Math.abs(vector.z))
  result.y =
    vector.y / (Math.abs(vector.x) + Math.abs(vector.y) + Math.abs(vector.z))

  if (vector.z < 0) {
    const x = result.x
    const y = result.y
    result.x = (1.0 - Math.abs(y)) * HEditorMath.signNotZero(x)
    result.y = (1.0 - Math.abs(x)) * HEditorMath.signNotZero(y)
  }

  result.x = HEditorMath.toSNorm(result.x, rangeMax)
  result.y = HEditorMath.toSNorm(result.y, rangeMax)

  return result
}

/**
 * Encodes a normalized 3D vector into a 2D value using octahedral mapping.
 * This function provides a convenient interface to encode the vector in the
 * range [-255, 255] by internally calling `octEncodeInRange`.
 * It is used primarily for encoding normals for rendering purposes.
 *
 * @param {Cartesian3} vector The normalized vector to encode.
 * @param {Cartesian2} result The object to store the encoded 2D value. If none is provided, a new Cartesian2 is created.
 * @returns {Cartesian2} The encoded 2D vector.
 */

AttributeCompression.octEncode = (
  vector: Cartesian3,
  result: Cartesian2 = new Cartesian2()
) => {
  return AttributeCompression.octEncodeInRange(vector, 255, result)
}

/**
 * Encodes a normalized 3D vector into a single float value using octahedral mapping.
 * This function provides a convenient interface to encode the vector in the
 * range [-255, 255] by internally calling `octEncodeInRange` and then packing
 * it into a single float value.
 *
 * @param {Cartesian3} vector The normalized vector to encode.
 * @param {Cartesian2} result The object to store the encoded 2D value. If none is provided, a new Cartesian2 is created.
 * @returns {number} The encoded float value.
 */
AttributeCompression.octEncodeFloat = (vector: Cartesian3) => {
  const scratchEncodeCart2 = AttributeCompression.octEncode(vector)

  return AttributeCompression.octPackFloat(scratchEncodeCart2)
}

/**
 * Packs an encoded 2D vector into a single float value.
 *
 * This function takes a Cartesian2 object, typically representing
 * an encoded 2D vector from octahedral mapping, and combines
 * its components into a single floating-point value. The packing
 * is done by multiplying the x component by 256 and adding the y
 * component.
 *
 * @param {Cartesian2} encoded - The 2D encoded vector.
 * @returns {number} The packed float value.
 */

AttributeCompression.octPackFloat = (encoded: Cartesian2) => {
  return 256.0 * encoded.x + encoded.y
}

/**
 * Encodes a 2D texture coordinate into a single 32-bit float.
 * The encoding is done by multiplying the x and y coordinates by 4095.0 and then
 * adding the y-coordinate to the x-coordinate multiplied by 4096.0.
 * This gives a range of [0, 16777215] for the single float, which is the maximum range
 * of a 32-bit float.
 * @param {Cartesian2} textureCoordinates The 2D texture coordinate to encode.
 * @returns {number} The encoded single float.
 */
AttributeCompression.compressTextureCoordinates = (
  textureCoordinates: Cartesian2
) => {
  // Move x and y to the range 0-4095;
  const x = (textureCoordinates.x * 4095.0) | 0
  const y = (textureCoordinates.y * 4095.0) | 0
  return 4096.0 * x + y
}

/**
 * Encodes three 3D vectors into a single 2D vector.
 *
 * This function takes three 3D vectors, encodes each of them into a single float
 * using octahedral mapping, and then packs the three floats into a single 2D vector.
 * The packing is done by multiplying the x and y components of the third vector by 65536.0
 * and adding the first and second vectors, respectively.
 *
 * @param {Cartesian3} v1 The first 3D vector to encode.
 * @param {Cartesian3} v2 The second 3D vector to encode.
 * @param {Cartesian3} v3 The third 3D vector to encode.
 * @param {Cartesian2} result The object to store the encoded 2D vector.
 * @returns {Cartesian2} The encoded 2D vector.
 */
AttributeCompression.octPack = (
  v1: Cartesian3,
  v2: Cartesian3,
  v3: Cartesian3,
  result: Cartesian2
) => {
  const encoded1 = AttributeCompression.octEncodeFloat(v1)
  const encoded2 = AttributeCompression.octEncodeFloat(v2)

  const encoded3 = AttributeCompression.octEncode(v3)
  result.x = 65536.0 * encoded3.x + encoded1
  result.y = 65536.0 * encoded3.y + encoded2
  return result
}
