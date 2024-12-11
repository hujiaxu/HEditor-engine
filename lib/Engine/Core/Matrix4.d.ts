import BoundingRectangle from './BoundingRectangle';
import Cartesian3 from './Cartesian3';
import Cartesian4 from './Cartesian4';
import Matrix3 from './Matrix3';
export default class Matrix4 {
    static toArray: (m4: Matrix4) => number[];
    private _values;
    static packedLength: number;
    static pack: (matrix4: Matrix4, array?: number[], startIndex?: number) => number[];
    static setValue: (m4: Matrix4, index: number, value: number) => void;
    static clone: (m4: Matrix4, result?: Matrix4) => Matrix4;
    static unpack: (array: number[], startIndex?: number, result?: Matrix4) => Matrix4;
    static fromArray: (array: number[], startIndex?: number, result?: Matrix4) => Matrix4;
    static fromColumnMajorArray: (values: number[], result?: Matrix4) => Matrix4;
    static fromRowMajorArray: (values: number[], result?: Matrix4) => Matrix4;
    static fromRotationTranslation: (rotation: Matrix3, translation: Cartesian3, result?: Matrix4) => Matrix4;
    static IDENTITY: Matrix4;
    static fromTranslation: (translation: Cartesian3, result?: Matrix4) => Matrix4;
    static fromScale: (scale: Cartesian3, result?: Matrix4) => Matrix4;
    static fromUniformScale: (scale: number, result?: Matrix4) => Matrix4;
    static fromRotation: (rotation: Matrix3, result?: Matrix4) => Matrix4;
    static computePerspectiveOffCenter: (left: number, right: number, bottom: number, top: number, near: number, far: number, result?: Matrix4) => Matrix4;
    static computePerspectiveFiledOfView: (fovy: number, aspect: number, near: number, far: number, result?: Matrix4) => Matrix4;
    static computeOrthographicOffCenter: (left: number, right: number, bottom: number, top: number, near: number, far: number, result?: Matrix4) => Matrix4;
    static computeView: (position: Cartesian3, direction: Cartesian3, up: Cartesian3, right: Cartesian3, result?: Matrix4) => Matrix4;
    static equals: (left: Matrix4, right: Matrix4) => boolean;
    static multiply: (left: Matrix4, right: Matrix4, result?: Matrix4) => Matrix4;
    static multiplyByPoint: (matrix: Matrix4, cartesian: Cartesian3, result?: Cartesian3) => Cartesian3;
    static multiplyByPointAsVector: (matrix: Matrix4, cartesian: Cartesian3, result?: Cartesian3) => Cartesian3;
    static inverseTransformation: (matrix: Matrix4, result?: Matrix4) => Matrix4;
    static multiplyByVector: (matrix: Matrix4, cartesian: Cartesian4, result?: Cartesian4) => Cartesian4;
    static computeViewportTransformation: (viewport: BoundingRectangle, nearDepthRange: number, farDepthRange: number, result?: Matrix4) => Matrix4;
    get values(): number[];
    set values(values: number[]);
    constructor(column0Row0?: number, column1Row0?: number, column2Row0?: number, column3Row0?: number, column0Row1?: number, column1Row1?: number, column2Row1?: number, column3Row1?: number, column0Row2?: number, column1Row2?: number, column2Row2?: number, column3Row2?: number, column0Row3?: number, column1Row3?: number, column2Row3?: number, column3Row3?: number);
    setValue(index: number, value: number): void;
}
