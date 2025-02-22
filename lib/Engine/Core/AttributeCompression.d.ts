import Cartesian2 from './Cartesian2';
import Cartesian3 from './Cartesian3';
export default class AttributeCompression {
    static octEncodeInRange: (vector: Cartesian3, rangeMax: number, result: Cartesian2) => Cartesian2;
    static compressTextureCoordinates: (textureCoordinates: Cartesian2) => number;
    static octEncode: (vector: Cartesian3, result?: Cartesian2) => Cartesian2;
    static octPackFloat: (encoded: Cartesian2) => number;
    static octEncodeFloat: (vector: Cartesian3) => number;
    static octPack: (v1: Cartesian3, v2: Cartesian3, v3: Cartesian3, result: Cartesian2) => Cartesian2;
}
