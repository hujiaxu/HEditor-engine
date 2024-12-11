import Cartesian3 from './Cartesian3';
export default class Cartesian2 {
    x: number;
    y: number;
    static lerp: (left: Cartesian2, right: Cartesian2, t: number, result?: Cartesian2) => Cartesian2;
    static clone: (cartesian: Cartesian2, result?: Cartesian2) => Cartesian2;
    static fromElements: (x: number, y: number, result?: Cartesian2) => Cartesian2;
    static equals: (left: Cartesian2, right: Cartesian2) => boolean;
    static equalsEpsilon: (left: Cartesian2, right: Cartesian2, relativeEpsilon?: number, absoluteEpsilon?: number) => boolean;
    static subtract: (left: Cartesian2, right: Cartesian2, result?: Cartesian2) => Cartesian2;
    static add: (left: Cartesian2, right: Cartesian2, result?: Cartesian2) => Cartesian2;
    static distance: (left: Cartesian2, right: Cartesian2) => number;
    static multiplyByScalar: (cartesian: Cartesian2, scalar: number, result?: Cartesian2) => Cartesian2;
    static fromCartesian3: (cartesian: Cartesian3, result?: Cartesian2) => Cartesian2;
    constructor(x?: number, y?: number);
}
