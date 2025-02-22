export default class Cartesian4 {
    x: number;
    y: number;
    z: number;
    w: number;
    static UNIT_W: Cartesian4;
    static clone: (cartesian: Cartesian4, result?: Cartesian4) => Cartesian4;
    static fromElements: (x: number, y: number, z: number, w: number, result?: Cartesian4) => Cartesian4;
    static unpack: (array: number[], index: number, result?: Cartesian4) => Cartesian4;
    static unpackFloat: (packedFloat: Cartesian4) => number;
    static equals: (left: Cartesian4, right: Cartesian4) => boolean;
    static pack: (cartesian: Cartesian4, array?: number[] | Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>, startIndex?: number) => number[] | Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>;
    static packFloat: (float: number, result?: Cartesian4) => Cartesian4;
    constructor(x?: number, y?: number, z?: number, w?: number);
}
