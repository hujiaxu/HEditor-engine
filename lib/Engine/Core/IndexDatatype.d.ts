export default class IndexDatatype {
    static createTypedArray: (numberOfVertices: number, indicesLengthOrArray: ArrayLike<number> | ArrayBuffer | number) => Uint32Array<ArrayBuffer> | Uint16Array<ArrayBuffer>;
    static readonly UNSIGNED_INT: 5125;
    static readonly UNSIGNED_BYTE: 5121;
    static readonly UNSIGNED_SHORT: 5123;
    static validate: (indexDatatype: number) => indexDatatype is 5125 | 5121 | 5123;
    static getSizeInBytes: (indexDatatype: number) => number;
}
