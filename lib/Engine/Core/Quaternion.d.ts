import Cartesian3 from './Cartesian3';
import HeadingPitchRoll from './HeadingPitchRoll';
export default class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    static fromAxisAngle: (axis: Cartesian3, angle: number, result?: Quaternion) => Quaternion;
    static fromHeadingPitchRoll: (hpr: HeadingPitchRoll, result?: Quaternion) => Quaternion;
    static multiply: (left: Quaternion, right: Quaternion, result?: Quaternion) => Quaternion;
    constructor(x?: number, y?: number, z?: number, w?: number);
}
