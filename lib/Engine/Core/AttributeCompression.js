import Cartesian2 from './Cartesian2';
import Cartesian3 from './Cartesian3';
import HEditorMath from './Math';
export default class AttributeCompression {
    static octEncodeInRange;
    static compressTextureCoordinates;
    static octEncode;
    static octPackFloat;
    static octEncodeFloat;
    static octPack;
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
AttributeCompression.octEncodeInRange = (vector, rangeMax, result = new Cartesian2()) => {
    const magSquared = Cartesian3.magnitudeSquared(vector);
    if (Math.abs(magSquared - 1.0) > HEditorMath.EPSILON6) {
        throw new Error('vector must be normalized.');
    }
    result.x =
        vector.x / (Math.abs(vector.x) + Math.abs(vector.y) + Math.abs(vector.z));
    result.y =
        vector.y / (Math.abs(vector.x) + Math.abs(vector.y) + Math.abs(vector.z));
    if (vector.z < 0) {
        const x = result.x;
        const y = result.y;
        result.x = (1.0 - Math.abs(y)) * HEditorMath.signNotZero(x);
        result.y = (1.0 - Math.abs(x)) * HEditorMath.signNotZero(y);
    }
    result.x = HEditorMath.toSNorm(result.x, rangeMax);
    result.y = HEditorMath.toSNorm(result.y, rangeMax);
    return result;
};
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
AttributeCompression.octEncode = (vector, result = new Cartesian2()) => {
    return AttributeCompression.octEncodeInRange(vector, 255, result);
};
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
AttributeCompression.octEncodeFloat = (vector) => {
    const scratchEncodeCart2 = AttributeCompression.octEncode(vector);
    return AttributeCompression.octPackFloat(scratchEncodeCart2);
};
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
AttributeCompression.octPackFloat = (encoded) => {
    return 256.0 * encoded.x + encoded.y;
};
/**
 * Encodes a 2D texture coordinate into a single 32-bit float.
 * The encoding is done by multiplying the x and y coordinates by 4095.0 and then
 * adding the y-coordinate to the x-coordinate multiplied by 4096.0.
 * This gives a range of [0, 16777215] for the single float, which is the maximum range
 * of a 32-bit float.
 * @param {Cartesian2} textureCoordinates The 2D texture coordinate to encode.
 * @returns {number} The encoded single float.
 */
AttributeCompression.compressTextureCoordinates = (textureCoordinates) => {
    // Move x and y to the range 0-4095;
    const x = (textureCoordinates.x * 4095.0) | 0;
    const y = (textureCoordinates.y * 4095.0) | 0;
    return 4096.0 * x + y;
};
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
AttributeCompression.octPack = (v1, v2, v3, result) => {
    const encoded1 = AttributeCompression.octEncodeFloat(v1);
    const encoded2 = AttributeCompression.octEncodeFloat(v2);
    const encoded3 = AttributeCompression.octEncode(v3);
    result.x = 65536.0 * encoded3.x + encoded1;
    result.y = 65536.0 * encoded3.y + encoded2;
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXR0cmlidXRlQ29tcHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvQXR0cmlidXRlQ29tcHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFdBQVcsTUFBTSxRQUFRLENBQUE7QUFFaEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxvQkFBb0I7SUFDdkMsTUFBTSxDQUFDLGdCQUFnQixDQUlSO0lBQ2YsTUFBTSxDQUFDLDBCQUEwQixDQUE0QztJQUM3RSxNQUFNLENBQUMsU0FBUyxDQUF5RDtJQUN6RSxNQUFNLENBQUMsWUFBWSxDQUFpQztJQUNwRCxNQUFNLENBQUMsY0FBYyxDQUFnQztJQUNyRCxNQUFNLENBQUMsT0FBTyxDQUtDO0NBQ2hCO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsb0JBQW9CLENBQUMsZ0JBQWdCLEdBQUcsQ0FDdEMsTUFBa0IsRUFDbEIsUUFBZ0IsRUFDaEIsU0FBcUIsSUFBSSxVQUFVLEVBQUUsRUFDckMsRUFBRTtJQUNGLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN0RCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUE7SUFDL0MsQ0FBQztJQUVELE1BQU0sQ0FBQyxDQUFDO1FBQ04sTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENB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