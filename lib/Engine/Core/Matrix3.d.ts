import Cartesian3 from './Cartesian3';
import HeadingPitchRoll from './HeadingPitchRoll';
import Quaternion from './Quaternion';
export default class Matrix3 {
    private _values;
    static clone: (m3: Matrix3, result?: Matrix3) => Matrix3;
    static packedLength: number;
    static IDENTITY: Matrix3;
    static multiplyByVector: (m3: Matrix3, cartesian: Cartesian3, result?: Cartesian3) => Cartesian3;
    static fromQuaternion: (quaternion: Quaternion, result?: Matrix3) => Matrix3;
    static transpose: (m3: Matrix3, result?: Matrix3) => Matrix3;
    static fromScale: (scale: Cartesian3, result?: Matrix3) => Matrix3;
    static multiply: (left: Matrix3, right: Matrix3, result?: Matrix3) => Matrix3;
    static COLUMN0ROW0: number;
    static COLUMN1ROW0: number;
    static COLUMN2ROW0: number;
    static COLUMN0ROW1: number;
    static COLUMN1ROW1: number;
    static COLUMN2ROW1: number;
    static COLUMN0ROW2: number;
    static COLUMN1ROW2: number;
    static COLUMN2ROW2: number;
    static getColumn: (m: Matrix3, index: number, result?: Cartesian3) => Cartesian3;
    static fromHeadingPitchRoll: (headingPitchRoll: HeadingPitchRoll, result?: Matrix3) => Matrix3;
    get values(): number[];
    set values(values: number[]);
    constructor(column0Row0?: number, column1Row0?: number, column2Row0?: number, column0Row1?: number, column1Row1?: number, column2Row1?: number, column0Row2?: number, column1Row2?: number, column2Row2?: number);
    setValue(index: number, value: number): void;
}
