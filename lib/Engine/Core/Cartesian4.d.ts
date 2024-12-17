export default class Cartesian4 {
    x: number;
    y: number;
    z: number;
    w: number;
    static UNIT_W: Cartesian4;
    static clone: (cartesian: Cartesian4, result?: Cartesian4) => Cartesian4;
    static fromElements: (x: number, y: number, z: number, w: number, result?: Cartesian4) => Cartesian4;
    constructor(x?: number, y?: number, z?: number, w?: number);
}
