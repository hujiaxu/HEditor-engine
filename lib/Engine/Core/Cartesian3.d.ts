export default class Cartesian3 {
    static cross: (left: Cartesian3, right: Cartesian3, result?: Cartesian3) => Cartesian3;
    static dot: (left: Cartesian3, right: Cartesian3) => number;
    static subtract: (left: Cartesian3, right: Cartesian3, result?: Cartesian3) => Cartesian3;
    static add: (left: Cartesian3, right: Cartesian3, result?: Cartesian3) => Cartesian3;
    x: number;
    y: number;
    z: number;
    static multiplyByScalar: (cartesian: Cartesian3, scalar: number, result?: Cartesian3) => Cartesian3;
    static multiply: (left: Cartesian3, right: Cartesian3, result?: Cartesian3) => Cartesian3;
    static clone: (cartesian: Cartesian3) => Cartesian3;
    static ZERO: Cartesian3;
    static distance: (left: Cartesian3, right: Cartesian3) => number;
    static distanceSquared: (left: Cartesian3, right: Cartesian3) => number;
    constructor(x?: number, y?: number, z?: number);
}
