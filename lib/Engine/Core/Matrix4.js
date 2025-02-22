import BoundingRectangle from './BoundingRectangle';
import Cartesian3 from './Cartesian3';
import Cartesian4 from './Cartesian4';
import defaultValue from './DefaultValue';
import defined from './Defined';
import HEditorMath from './Math';
import Matrix3 from './Matrix3';
export default class Matrix4 {
    static toArray;
    _values;
    static packedLength;
    static pack;
    static setValue;
    static clone;
    static unpack;
    static fromArray;
    static fromColumnMajorArray;
    static fromRowMajorArray;
    static fromRotationTranslation;
    static IDENTITY;
    static fromTranslation;
    static fromScale;
    static fromUniformScale;
    static fromRotation;
    static computePerspectiveOffCenter;
    static computePerspectiveFiledOfView;
    static computeOrthographicOffCenter;
    static computeView;
    static equals;
    static multiply;
    static multiplyByPoint;
    static multiplyByPointAsVector;
    static inverseTransformation;
    static multiplyByVector;
    static computeViewportTransformation;
    static transpose;
    static inverse;
    static getMatrix3;
    static getRow;
    static getScale;
    static getMaximumScale;
    static multiplyTransformation;
    get values() {
        return this._values;
    }
    set values(values) {
        this._values = values;
    }
    constructor(column0Row0 = 0.0, column1Row0 = 0.0, column2Row0 = 0.0, column3Row0 = 0.0, column0Row1 = 0.0, column1Row1 = 0.0, column2Row1 = 0.0, column3Row1 = 0.0, column0Row2 = 0.0, column1Row2 = 0.0, column2Row2 = 0.0, column3Row2 = 0.0, column0Row3 = 0.0, column1Row3 = 0.0, column2Row3 = 0.0, column3Row3 = 0.0) {
        this._values = [
            column0Row0,
            column0Row1,
            column0Row2,
            column0Row3,
            column1Row0,
            column1Row1,
            column1Row2,
            column1Row3,
            column2Row0,
            column2Row1,
            column2Row2,
            column2Row3,
            column3Row0,
            column3Row1,
            column3Row2,
            column3Row3
        ];
    }
    setValue(index, value) {
        this._values[index] = value;
    }
}
Matrix4.packedLength = 16;
Matrix4.toArray = function (matrix4) {
    return matrix4.values;
};
Matrix4.pack = function (matrix4, array, startIndex) {
    if (!array) {
        array = [];
    }
    startIndex = startIndex || 0;
    for (let i = startIndex; i < 16; ++i) {
        array[i] = matrix4.values[i];
    }
    return array;
};
Matrix4.unpack = function (array, startIndex, result) {
    if (!result) {
        result = new Matrix4();
    }
    startIndex = startIndex || 0;
    for (let i = startIndex; i < 16; ++i) {
        result.setValue(i, array[i]);
    }
    return result;
};
Matrix4.clone = function (m4, result) {
    if (!result) {
        result = new Matrix4();
    }
    for (let i = 0; i < Matrix4.packedLength; ++i) {
        result.setValue(i, m4.values[i]);
    }
    return result;
};
Matrix4.IDENTITY = Matrix4.clone(new Matrix4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0));
Matrix4.fromArray = Matrix4.unpack;
Matrix4.fromColumnMajorArray = function (values, result) {
    if (!result) {
        result = new Matrix4();
    }
    return Matrix4.unpack(values, 0, result);
};
/**
 * Creates a Matrix4 instance from an array of numbers in row-major order.
 * If a result matrix is provided, it will be populated with the values
 * from the array; otherwise, a new Matrix4 will be created.
 *
 * @param values - An array of 16 numbers representing the matrix in row-major order.
 * @param result - An optional Matrix4 instance to store the result.
 * @returns The resulting Matrix4 instance populated with the values.
 */
Matrix4.fromRowMajorArray = function (values, result) {
    if (!result) {
        return (result = new Matrix4(...values));
    }
    result.setValue(0, values[0]);
    result.setValue(1, values[4]);
    result.setValue(2, values[8]);
    result.setValue(3, values[12]);
    result.setValue(4, values[1]);
    result.setValue(5, values[5]);
    result.setValue(6, values[9]);
    result.setValue(7, values[13]);
    result.setValue(8, values[2]);
    result.setValue(9, values[6]);
    result.setValue(10, values[10]);
    result.setValue(11, values[14]);
    result.setValue(12, values[3]);
    result.setValue(13, values[7]);
    result.setValue(14, values[11]);
    result.setValue(15, values[15]);
    return result;
};
Matrix4.fromRotationTranslation = function (rotation, translation, result) {
    if (!result) {
        result = new Matrix4();
    }
    result.setValue(0, rotation.values[0]);
    result.setValue(1, rotation.values[1]);
    result.setValue(2, rotation.values[2]);
    result.setValue(3, 0.0);
    result.setValue(4, rotation.values[3]);
    result.setValue(5, rotation.values[4]);
    result.setValue(6, rotation.values[5]);
    result.setValue(7, 0.0);
    result.setValue(8, rotation.values[6]);
    result.setValue(9, rotation.values[7]);
    result.setValue(10, rotation.values[8]);
    result.setValue(11, 0.0);
    result.setValue(12, translation.x);
    result.setValue(13, translation.y);
    result.setValue(14, translation.z);
    result.setValue(15, 1.0);
    return result;
};
Matrix4.fromTranslation = function (translation, result) {
    return Matrix4.fromRotationTranslation(Matrix3.IDENTITY, translation, result);
};
Matrix4.fromScale = function (scale, result) {
    if (!result) {
        result = new Matrix4();
    }
    result.setValue(0, scale.x);
    result.setValue(1, 0.0);
    result.setValue(2, 0.0);
    result.setValue(3, 0.0);
    result.setValue(4, 0.0);
    result.setValue(5, scale.y);
    result.setValue(6, 0.0);
    result.setValue(7, 0.0);
    result.setValue(8, 0.0);
    result.setValue(9, 0.0);
    result.setValue(10, scale.z);
    result.setValue(11, 0.0);
    result.setValue(12, 0.0);
    result.setValue(13, 0.0);
    result.setValue(14, 0.0);
    result.setValue(15, 1.0);
    return result;
};
Matrix4.fromUniformScale = function (scale, result) {
    if (!result) {
        result = new Matrix4();
    }
    result.setValue(0, scale);
    result.setValue(1, 0.0);
    result.setValue(2, 0.0);
    result.setValue(3, 0.0);
    result.setValue(4, 0.0);
    result.setValue(5, scale);
    result.setValue(6, 0.0);
    result.setValue(7, 0.0);
    result.setValue(8, 0.0);
    result.setValue(9, 0.0);
    result.setValue(10, scale);
    result.setValue(11, 0.0);
    result.setValue(12, 0.0);
    result.setValue(13, 0.0);
    result.setValue(14, 0.0);
    result.setValue(15, 1.0);
    return result;
};
Matrix4.fromRotation = function (rotation, result) {
    if (!result) {
        result = new Matrix4();
    }
    result.setValue(0, rotation.values[0]);
    result.setValue(1, rotation.values[1]);
    result.setValue(2, rotation.values[2]);
    result.setValue(3, 0.0);
    result.setValue(4, rotation.values[3]);
    result.setValue(5, rotation.values[4]);
    result.setValue(6, rotation.values[5]);
    result.setValue(7, 0.0);
    result.setValue(8, rotation.values[6]);
    result.setValue(9, rotation.values[7]);
    result.setValue(10, rotation.values[8]);
    result.setValue(11, 0.0);
    result.setValue(12, 0.0);
    result.setValue(13, 0.0);
    result.setValue(14, 0.0);
    result.setValue(15, 1.0);
    return result;
};
Matrix4.computePerspectiveOffCenter = function (left, right, bottom, top, near, far, result) {
    if (!result) {
        result = new Matrix4();
    }
    const column0Row0 = (2.0 * near) / (right - left);
    const column1Row1 = (2.0 * near) / (top - bottom);
    const column2Row0 = (right + left) / (right - left);
    const column2Row1 = (top + bottom) / (top - bottom);
    const column2Row2 = -(far + near) / (far - near);
    const column2Row3 = -1.0;
    const column3Row2 = -(2.0 * far * near) / (far - near);
    result.setValue(0, column0Row0);
    result.setValue(1, 0.0);
    result.setValue(2, 0.0);
    result.setValue(3, 0.0);
    result.setValue(4, 0.0);
    result.setValue(5, column1Row1);
    result.setValue(6, 0.0);
    result.setValue(7, 0.0);
    result.setValue(8, column2Row0);
    result.setValue(9, column2Row1);
    result.setValue(10, column2Row2);
    result.setValue(11, column2Row3);
    result.setValue(12, 0.0);
    result.setValue(13, 0.0);
    result.setValue(14, column3Row2);
    result.setValue(15, 0.0);
    return result;
};
Matrix4.computePerspectiveFiledOfView = function (fovy, aspect, near, far, result) {
    if (!result) {
        result = new Matrix4();
    }
    const bottom = Math.tan(fovy * 0.5);
    const column1Row1 = 1.0 / bottom;
    const column0Row0 = column1Row1 / aspect;
    const column2Row2 = (far + near) / (near - far);
    const column2Row3 = -1.0;
    const column3Row2 = (2.0 * far * near) / (far - near);
    result.setValue(0, column0Row0);
    result.setValue(1, 0.0);
    result.setValue(2, 0.0);
    result.setValue(3, 0.0);
    result.setValue(4, 0.0);
    result.setValue(5, column1Row1);
    result.setValue(6, 0.0);
    result.setValue(7, 0.0);
    result.setValue(8, 0.0);
    result.setValue(9, 0.0);
    result.setValue(10, column2Row2);
    result.setValue(11, column2Row3);
    result.setValue(12, 0.0);
    result.setValue(13, 0.0);
    result.setValue(14, column3Row2);
    result.setValue(15, 0.0);
    return result;
};
Matrix4.computeOrthographicOffCenter = function (left, right, bottom, top, near, far, result) {
    if (!result) {
        result = new Matrix4();
    }
    const column0Row0 = 2.0 / (right - left);
    const column1Row1 = 2.0 / (top - bottom);
    const column2Row2 = -2.0 / (far - near);
    const column3Row0 = -(right + left) / (right - left);
    const column3Row1 = -(top + bottom) / (top - bottom);
    const column3Row2 = -(far + near) / (far - near);
    result.setValue(0, column0Row0);
    result.setValue(1, 0.0);
    result.setValue(2, 0.0);
    result.setValue(3, 0.0);
    result.setValue(4, 0.0);
    result.setValue(5, column1Row1);
    result.setValue(6, 0.0);
    result.setValue(7, 0.0);
    result.setValue(8, 0.0);
    result.setValue(9, 0.0);
    result.setValue(10, column2Row2);
    result.setValue(11, 0.0);
    result.setValue(12, column3Row0);
    result.setValue(13, column3Row1);
    result.setValue(14, column3Row2);
    result.setValue(15, 1.0);
    return result;
};
Matrix4.computeView = function (position, direction, up, right, result) {
    if (!result) {
        result = new Matrix4();
    }
    // console.log(position, direction, up, right)
    result.setValue(0, right.x);
    result.setValue(1, up.x);
    result.setValue(2, -direction.x);
    result.setValue(3, 0.0);
    result.setValue(4, right.y);
    result.setValue(5, up.y);
    result.setValue(6, -direction.y);
    result.setValue(7, 0.0);
    result.setValue(8, right.z);
    result.setValue(9, up.z);
    result.setValue(10, -direction.z);
    result.setValue(11, 0.0);
    result.setValue(12, -Cartesian3.dot(right, position));
    result.setValue(13, -Cartesian3.dot(up, position));
    result.setValue(14, Cartesian3.dot(direction, position));
    result.setValue(15, 1.0);
    return result;
};
Matrix4.equals = function (left, right) {
    return (left.values[0] === right.values[0] &&
        left.values[1] === right.values[1] &&
        left.values[2] === right.values[2] &&
        left.values[3] === right.values[3] &&
        left.values[4] === right.values[4] &&
        left.values[5] === right.values[5] &&
        left.values[6] === right.values[6] &&
        left.values[7] === right.values[7] &&
        left.values[8] === right.values[8] &&
        left.values[9] === right.values[9] &&
        left.values[10] === right.values[10] &&
        left.values[11] === right.values[11] &&
        left.values[12] === right.values[12] &&
        left.values[13] === right.values[13] &&
        left.values[14] === right.values[14] &&
        left.values[15] === right.values[15]);
};
Matrix4.multiply = function (left, right, result) {
    if (!result) {
        result = new Matrix4();
    }
    const column0Row0 = left.values[0] * right.values[0] +
        left.values[4] * right.values[1] +
        left.values[8] * right.values[2] +
        left.values[12] * right.values[3];
    const column0Row1 = left.values[1] * right.values[0] +
        left.values[5] * right.values[1] +
        left.values[9] * right.values[2] +
        left.values[13] * right.values[3];
    const column0Row2 = left.values[2] * right.values[0] +
        left.values[6] * right.values[1] +
        left.values[10] * right.values[2] +
        left.values[14] * right.values[3];
    const column0Row3 = left.values[3] * right.values[0] +
        left.values[7] * right.values[1] +
        left.values[11] * right.values[2] +
        left.values[15] * right.values[3];
    const column1Row0 = left.values[0] * right.values[4] +
        left.values[4] * right.values[5] +
        left.values[8] * right.values[6] +
        left.values[12] * right.values[7];
    const column1Row1 = left.values[1] * right.values[4] +
        left.values[5] * right.values[5] +
        left.values[9] * right.values[6] +
        left.values[13] * right.values[7];
    const column1Row2 = left.values[2] * right.values[4] +
        left.values[6] * right.values[5] +
        left.values[10] * right.values[6] +
        left.values[14] * right.values[7];
    const column1Row3 = left.values[3] * right.values[4] +
        left.values[7] * right.values[5] +
        left.values[11] * right.values[6] +
        left.values[15] * right.values[7];
    const column2Row0 = left.values[0] * right.values[8] +
        left.values[4] * right.values[9] +
        left.values[8] * right.values[10] +
        left.values[12] * right.values[11];
    const column2Row1 = left.values[1] * right.values[8] +
        left.values[5] * right.values[9] +
        left.values[9] * right.values[10] +
        left.values[13] * right.values[11];
    const column2Row2 = left.values[2] * right.values[8] +
        left.values[6] * right.values[9] +
        left.values[10] * right.values[10] +
        left.values[14] * right.values[11];
    const column2Row3 = left.values[3] * right.values[8] +
        left.values[7] * right.values[9] +
        left.values[11] * right.values[10] +
        left.values[15] * right.values[11];
    const column3Row0 = left.values[0] * right.values[12] +
        left.values[4] * right.values[13] +
        left.values[8] * right.values[14] +
        left.values[12] * right.values[15];
    const column3Row1 = left.values[1] * right.values[12] +
        left.values[5] * right.values[13] +
        left.values[9] * right.values[14] +
        left.values[13] * right.values[15];
    const column3Row2 = left.values[2] * right.values[12] +
        left.values[6] * right.values[13] +
        left.values[10] * right.values[14] +
        left.values[14] * right.values[15];
    const column3Row3 = left.values[3] * right.values[12] +
        left.values[7] * right.values[13] +
        left.values[11] * right.values[14] +
        left.values[15] * right.values[15];
    result.values[0] = column0Row0;
    result.values[1] = column0Row1;
    result.values[2] = column0Row2;
    result.values[3] = column0Row3;
    result.values[4] = column1Row0;
    result.values[5] = column1Row1;
    result.values[6] = column1Row2;
    result.values[7] = column1Row3;
    result.values[8] = column2Row0;
    result.values[9] = column2Row1;
    result.values[10] = column2Row2;
    result.values[11] = column2Row3;
    result.values[12] = column3Row0;
    result.values[13] = column3Row1;
    result.values[14] = column3Row2;
    result.values[15] = column3Row3;
    return result;
};
Matrix4.multiplyByPoint = function (matrix, cartesian, result) {
    if (!result) {
        result = new Cartesian3();
    }
    const x = cartesian.x;
    const y = cartesian.y;
    const z = cartesian.z;
    result.x =
        matrix.values[0] * x +
            matrix.values[4] * y +
            matrix.values[8] * z +
            matrix.values[12];
    result.y =
        matrix.values[1] * x +
            matrix.values[5] * y +
            matrix.values[9] * z +
            matrix.values[13];
    result.z =
        matrix.values[2] * x +
            matrix.values[6] * y +
            matrix.values[10] * z +
            matrix.values[14];
    return result;
};
Matrix4.multiplyByPointAsVector = function (matrix, cartesian, result) {
    if (!result) {
        result = new Cartesian3();
    }
    const x = cartesian.x;
    const y = cartesian.y;
    const z = cartesian.z;
    result.x = matrix.values[0] * x + matrix.values[4] * y + matrix.values[8] * z;
    result.y = matrix.values[1] * x + matrix.values[5] * y + matrix.values[9] * z;
    result.z = matrix.values[2] * x + matrix.values[6] * y + matrix.values[10] * z;
    return result;
};
Matrix4.inverseTransformation = function (matrix, result) {
    if (!result) {
        result = new Matrix4();
    }
    const matrix0 = matrix.values[0];
    const matrix1 = matrix.values[1];
    const matrix2 = matrix.values[2];
    const matrix4 = matrix.values[4];
    const matrix5 = matrix.values[5];
    const matrix6 = matrix.values[6];
    const matrix8 = matrix.values[8];
    const matrix9 = matrix.values[9];
    const matrix10 = matrix.values[10];
    const vX = matrix.values[12];
    const vY = matrix.values[13];
    const vZ = matrix.values[14];
    const x = -matrix0 * vX - matrix1 * vY - matrix2 * vZ;
    const y = -matrix4 * vX - matrix5 * vY - matrix6 * vZ;
    const z = -matrix8 * vX - matrix9 * vY - matrix10 * vZ;
    result.values[0] = matrix0;
    result.values[1] = matrix4;
    result.values[2] = matrix8;
    result.values[3] = 0.0;
    result.values[4] = matrix1;
    result.values[5] = matrix5;
    result.values[6] = matrix9;
    result.values[7] = 0.0;
    result.values[8] = matrix2;
    result.values[9] = matrix6;
    result.values[10] = matrix10;
    result.values[11] = 0.0;
    result.values[12] = x;
    result.values[13] = y;
    result.values[14] = z;
    result.values[15] = 1.0;
    return result;
};
Matrix4.multiplyByVector = function (matrix, cartesian, result) {
    if (!result) {
        result = new Cartesian4();
    }
    const x = cartesian.x;
    const y = cartesian.y;
    const z = cartesian.z;
    const w = cartesian.w;
    result.x =
        matrix.values[0] * x +
            matrix.values[4] * y +
            matrix.values[8] * z +
            matrix.values[12] * w;
    result.y =
        matrix.values[1] * x +
            matrix.values[5] * y +
            matrix.values[9] * z +
            matrix.values[13] * w;
    result.z =
        matrix.values[2] * x +
            matrix.values[6] * y +
            matrix.values[10] * z +
            matrix.values[14] * w;
    result.w =
        matrix.values[3] * x +
            matrix.values[7] * y +
            matrix.values[11] * z +
            matrix.values[15] * w;
    return result;
};
Matrix4.computeViewportTransformation = function (viewport, nearDepthRange, farDepthRange, result) {
    if (!defined(result)) {
        result = new Matrix4();
    }
    viewport = defaultValue(viewport, new BoundingRectangle());
    const x = viewport.x;
    const y = viewport.y;
    const width = viewport.width;
    const height = viewport.height;
    nearDepthRange = defaultValue(nearDepthRange, 0.0);
    farDepthRange = defaultValue(farDepthRange, 1.0);
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const halfDepth = (farDepthRange - nearDepthRange) * 0.5;
    const column0Row0 = halfWidth;
    const column1Row1 = halfHeight;
    const column2Row2 = halfDepth;
    const column3Row0 = x + halfWidth;
    const column3Row1 = y + halfHeight;
    const column3Row2 = nearDepthRange + halfDepth;
    const column3Row3 = 1.0;
    result.values[0] = column0Row0;
    result.values[1] = 0.0;
    result.values[2] = 0.0;
    result.values[3] = 0.0;
    result.values[4] = 0.0;
    result.values[5] = column1Row1;
    result.values[6] = 0.0;
    result.values[7] = 0.0;
    result.values[8] = 0.0;
    result.values[9] = 0.0;
    result.values[10] = column2Row2;
    result.values[11] = 0.0;
    result.values[12] = column3Row0;
    result.values[13] = column3Row1;
    result.values[14] = column3Row2;
    result.values[15] = column3Row3;
    return result;
};
Matrix4.transpose = function (matrix, result) {
    if (!result) {
        result = new Matrix4();
    }
    result.values[0] = matrix.values[0];
    result.values[1] = matrix.values[4];
    result.values[2] = matrix.values[8];
    result.values[3] = matrix.values[12];
    result.values[4] = matrix.values[1];
    result.values[5] = matrix.values[5];
    result.values[6] = matrix.values[9];
    result.values[7] = matrix.values[13];
    result.values[8] = matrix.values[2];
    result.values[9] = matrix.values[6];
    result.values[10] = matrix.values[10];
    result.values[11] = matrix.values[14];
    result.values[12] = matrix.values[3];
    result.values[13] = matrix.values[7];
    result.values[14] = matrix.values[11];
    result.values[15] = matrix.values[15];
    return result;
};
const scratchInverseRotation = new Matrix3();
const scratchMatrix3Zero = new Matrix3();
const scratchBottomRow = new Cartesian4();
const scratchExpectedBottomRow = new Cartesian4(0.0, 0.0, 0.0, 1.0);
Matrix4.inverse = function (matrix, result) {
    if (!result) {
        result = new Matrix4();
    }
    const src0 = matrix.values[0];
    const src1 = matrix.values[4];
    const src2 = matrix.values[8];
    const src3 = matrix.values[12];
    const src4 = matrix.values[1];
    const src5 = matrix.values[5];
    const src6 = matrix.values[9];
    const src7 = matrix.values[13];
    const src8 = matrix.values[2];
    const src9 = matrix.values[6];
    const src10 = matrix.values[10];
    const src11 = matrix.values[14];
    const src12 = matrix.values[3];
    const src13 = matrix.values[7];
    const src14 = matrix.values[11];
    const src15 = matrix.values[15];
    // calculate pairs for first 8 elements (cofactors)
    let tmp0 = src10 * src15;
    let tmp1 = src11 * src14;
    let tmp2 = src9 * src15;
    let tmp3 = src11 * src13;
    let tmp4 = src9 * src14;
    let tmp5 = src10 * src13;
    let tmp6 = src8 * src15;
    let tmp7 = src11 * src12;
    let tmp8 = src8 * src14;
    let tmp9 = src10 * src12;
    let tmp10 = src8 * src13;
    let tmp11 = src9 * src12;
    // calculate first 8 elements (cofactors)
    const dst0 = tmp0 * src5 +
        tmp3 * src6 +
        tmp4 * src7 -
        (tmp1 * src5 + tmp2 * src6 + tmp5 * src7);
    const dst1 = tmp1 * src4 +
        tmp6 * src6 +
        tmp9 * src7 -
        (tmp0 * src4 + tmp7 * src6 + tmp8 * src7);
    const dst2 = tmp2 * src4 +
        tmp7 * src5 +
        tmp10 * src7 -
        (tmp3 * src4 + tmp6 * src5 + tmp11 * src7);
    const dst3 = tmp5 * src4 +
        tmp8 * src5 +
        tmp11 * src6 -
        (tmp4 * src4 + tmp9 * src5 + tmp10 * src6);
    const dst4 = tmp1 * src1 +
        tmp2 * src2 +
        tmp5 * src3 -
        (tmp0 * src1 + tmp3 * src2 + tmp4 * src3);
    const dst5 = tmp0 * src0 +
        tmp7 * src2 +
        tmp8 * src3 -
        (tmp1 * src0 + tmp6 * src2 + tmp9 * src3);
    const dst6 = tmp3 * src0 +
        tmp6 * src1 +
        tmp11 * src3 -
        (tmp2 * src0 + tmp7 * src1 + tmp10 * src3);
    const dst7 = tmp4 * src0 +
        tmp9 * src1 +
        tmp10 * src2 -
        (tmp5 * src0 + tmp8 * src1 + tmp11 * src2);
    // calculate pairs for second 8 elements (cofactors)
    tmp0 = src2 * src7;
    tmp1 = src3 * src6;
    tmp2 = src1 * src7;
    tmp3 = src3 * src5;
    tmp4 = src1 * src6;
    tmp5 = src2 * src5;
    tmp6 = src0 * src7;
    tmp7 = src3 * src4;
    tmp8 = src0 * src6;
    tmp9 = src2 * src4;
    tmp10 = src0 * src5;
    tmp11 = src1 * src4;
    // calculate second 8 elements (cofactors)
    const dst8 = tmp0 * src13 +
        tmp3 * src14 +
        tmp4 * src15 -
        (tmp1 * src13 + tmp2 * src14 + tmp5 * src15);
    const dst9 = tmp1 * src12 +
        tmp6 * src14 +
        tmp9 * src15 -
        (tmp0 * src12 + tmp7 * src14 + tmp8 * src15);
    const dst10 = tmp2 * src12 +
        tmp7 * src13 +
        tmp10 * src15 -
        (tmp3 * src12 + tmp6 * src13 + tmp11 * src15);
    const dst11 = tmp5 * src12 +
        tmp8 * src13 +
        tmp11 * src14 -
        (tmp4 * src12 + tmp9 * src13 + tmp10 * src14);
    const dst12 = tmp2 * src10 +
        tmp5 * src11 +
        tmp1 * src9 -
        (tmp4 * src11 + tmp0 * src9 + tmp3 * src10);
    const dst13 = tmp8 * src11 +
        tmp0 * src8 +
        tmp7 * src10 -
        (tmp6 * src10 + tmp9 * src11 + tmp1 * src8);
    const dst14 = tmp6 * src9 +
        tmp11 * src11 +
        tmp3 * src8 -
        (tmp10 * src11 + tmp2 * src8 + tmp7 * src9);
    const dst15 = tmp10 * src10 +
        tmp4 * src8 +
        tmp9 * src9 -
        (tmp8 * src9 + tmp11 * src10 + tmp5 * src8);
    // calculate determinant
    let det = src0 * dst0 + src1 * dst1 + src2 * dst2 + src3 * dst3;
    if (Math.abs(det) < HEditorMath.EPSILON21) {
        // Special case for a zero scale matrix that can occur, for example,
        // when a model's node has a [0, 0, 0] scale.
        if (Matrix3.equalsEpsilon(Matrix4.getMatrix3(matrix, scratchInverseRotation), scratchMatrix3Zero, HEditorMath.EPSILON7) &&
            Cartesian4.equals(Matrix4.getRow(matrix, 3, scratchBottomRow), scratchExpectedBottomRow)) {
            result.values[0] = 0.0;
            result.values[1] = 0.0;
            result.values[2] = 0.0;
            result.values[3] = 0.0;
            result.values[4] = 0.0;
            result.values[5] = 0.0;
            result.values[6] = 0.0;
            result.values[7] = 0.0;
            result.values[8] = 0.0;
            result.values[9] = 0.0;
            result.values[10] = 0.0;
            result.values[11] = 0.0;
            result.values[12] = -matrix.values[12];
            result.values[13] = -matrix.values[13];
            result.values[14] = -matrix.values[14];
            result.values[15] = 1.0;
            return result;
        }
        throw new Error('matrix is not invertible because its determinate is zero.');
    }
    // calculate matrix inverse
    det = 1.0 / det;
    result.values[0] = dst0 * det;
    result.values[1] = dst1 * det;
    result.values[2] = dst2 * det;
    result.values[3] = dst3 * det;
    result.values[4] = dst4 * det;
    result.values[5] = dst5 * det;
    result.values[6] = dst6 * det;
    result.values[7] = dst7 * det;
    result.values[8] = dst8 * det;
    result.values[9] = dst9 * det;
    result.values[10] = dst10 * det;
    result.values[11] = dst11 * det;
    result.values[12] = dst12 * det;
    result.values[13] = dst13 * det;
    result.values[14] = dst14 * det;
    result.values[15] = dst15 * det;
    return result;
};
Matrix4.getMatrix3 = function (matrix, result) {
    if (!result) {
        result = new Matrix3();
    }
    result.values[0] = matrix.values[0];
    result.values[1] = matrix.values[1];
    result.values[2] = matrix.values[2];
    result.values[3] = matrix.values[4];
    result.values[4] = matrix.values[5];
    result.values[5] = matrix.values[6];
    result.values[6] = matrix.values[8];
    result.values[7] = matrix.values[9];
    result.values[8] = matrix.values[10];
    return result;
};
Matrix4.getRow = function (matrix, index, result) {
    if (!result) {
        result = new Cartesian4();
    }
    result.x = matrix.values[index];
    result.y = matrix.values[index + 4];
    result.z = matrix.values[index + 8];
    result.w = matrix.values[index + 12];
    return result;
};
// 局部坐标系下的基向量的长度, 相对于单位坐标系下的缩放
Matrix4.getScale = function (matrix, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = Cartesian3.magnitude(Cartesian3.fromElements(matrix.values[0], matrix.values[1], matrix.values[2]));
    result.y = Cartesian3.magnitude(Cartesian3.fromElements(matrix.values[4], matrix.values[5], matrix.values[6]));
    result.z = Cartesian3.magnitude(Cartesian3.fromElements(matrix.values[8], matrix.values[9], matrix.values[10]));
    return result;
};
const scaleScratch3 = new Cartesian3();
Matrix4.getMaximumScale = function (matrix) {
    Matrix4.getScale(matrix, scaleScratch3);
    return Cartesian3.maximumComponent(scaleScratch3);
};
// 目的: 快速计算两个仿射变换的乘积, 结果是一个仿射变换, 仿射变换矩阵的最后一行固定 [0, 0, 0, 1]
Matrix4.multiplyTransformation = function (left, right, result) {
    if (!result) {
        result = new Matrix4();
    }
    const left0 = left.values[0];
    const left1 = left.values[1];
    const left2 = left.values[2];
    const left4 = left.values[4];
    const left5 = left.values[5];
    const left6 = left.values[6];
    const left8 = left.values[8];
    const left9 = left.values[9];
    const left10 = left.values[10];
    const left12 = left.values[12];
    const left13 = left.values[13];
    const left14 = left.values[14];
    const right0 = right.values[0];
    const right1 = right.values[1];
    const right2 = right.values[2];
    const right4 = right.values[4];
    const right5 = right.values[5];
    const right6 = right.values[6];
    const right8 = right.values[8];
    const right9 = right.values[9];
    const right10 = right.values[10];
    const right12 = right.values[12];
    const right13 = right.values[13];
    const right14 = right.values[14];
    const column0Row0 = left0 * right0 + left4 * right1 + left8 * right2;
    const column0Row1 = left1 * right0 + left5 * right1 + left9 * right2;
    const column0Row2 = left2 * right0 + left6 * right1 + left10 * right2;
    const column1Row0 = left0 * right4 + left4 * right5 + left8 * right6;
    const column1Row1 = left1 * right4 + left5 * right5 + left9 * right6;
    const column1Row2 = left2 * right4 + left6 * right5 + left10 * right6;
    const column2Row0 = left0 * right8 + left4 * right9 + left8 * right10;
    const column2Row1 = left1 * right8 + left5 * right9 + left9 * right10;
    const column2Row2 = left2 * right8 + left6 * right9 + left10 * right10;
    const column3Row0 = left0 * right12 + left4 * right13 + left8 * right14 + left12;
    const column3Row1 = left1 * right12 + left5 * right13 + left9 * right14 + left13;
    const column3Row2 = left2 * right12 + left6 * right13 + left10 * right14 + left14;
    result.values[0] = column0Row0;
    result.values[1] = column0Row1;
    result.values[2] = column0Row2;
    result.values[3] = 0.0;
    result.values[4] = column1Row0;
    result.values[5] = column1Row1;
    result.values[6] = column1Row2;
    result.values[7] = 0.0;
    result.values[8] = column2Row0;
    result.values[9] = column2Row1;
    result.values[10] = column2Row2;
    result.values[11] = 0.0;
    result.values[12] = column3Row0;
    result.values[13] = column3Row1;
    result.values[14] = column3Row2;
    result.values[15] = 1.0;
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWF0cml4NC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9NYXRyaXg0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUE7QUFDbkQsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxXQUFXLE1BQU0sUUFBUSxDQUFBO0FBQ2hDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixNQUFNLENBQUMsT0FBTyxPQUFPLE9BQU87SUFDMUIsTUFBTSxDQUFDLE9BQU8sQ0FBMkI7SUFFakMsT0FBTyxDQUFVO0lBRXpCLE1BQU0sQ0FBQyxZQUFZLENBQVE7SUFDM0IsTUFBTSxDQUFDLElBQUksQ0FJRTtJQUNiLE1BQU0sQ0FBQyxRQUFRLENBQXFEO0lBQ3BFLE1BQU0sQ0FBQyxLQUFLLENBQTRDO0lBQ3hELE1BQU0sQ0FBQyxNQUFNLENBSUQ7SUFDWixNQUFNLENBQUMsU0FBUyxDQUlKO0lBQ1osTUFBTSxDQUFDLG9CQUFvQixDQUFpRDtJQUM1RSxNQUFNLENBQUMsaUJBQWlCLENBQWlEO0lBQ3pFLE1BQU0sQ0FBQyx1QkFBdUIsQ0FJbEI7SUFDWixNQUFNLENBQUMsUUFBUSxDQUFTO0lBQ3hCLE1BQU0sQ0FBQyxlQUFlLENBQXdEO0lBQzlFLE1BQU0sQ0FBQyxTQUFTLENBQWtEO0lBQ2xFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBOEM7SUFDckUsTUFBTSxDQUFDLFlBQVksQ0FBa0Q7SUFDckUsTUFBTSxDQUFDLDJCQUEyQixDQVF0QjtJQUNaLE1BQU0sQ0FBQyw2QkFBNkIsQ0FNeEI7SUFDWixNQUFNLENBQUMsNEJBQTRCLENBUXZCO0lBQ1osTUFBTSxDQUFDLFdBQVcs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TUFBTSxDQUFDLENBQUE7QUFDMUMsQ0FBQyxDQUFBO0FBQ0Q7Ozs7Ozs7O0dBUUc7QUFDSCxPQUFPLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxNQUFnQixFQUFFLE1BQWdCO0lBQ3RFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNaLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxN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RyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQTtJQUNuRCxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ2hELE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFBO0lBQ3hCLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3RELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ2hDLE1B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LENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3hDLE1BQU0sV0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQTtJQUN4QyxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUN2QyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUE7SUFDcEQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNoRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFD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QUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FB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QUFNLFdBQVcsR0FDZixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEMsTUFBTSxXQUFXLEdBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3BDLE1BQU0sV0FBVyxHQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxNQUFNLFdBQVcsR0FDZixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFcEMsTUFBTSxXQUFXLEdBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3BDLE1BQU0sV0FBVyxHQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxNQUFNLFdBQVcsR0FDZixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEMsTUFBTSxXQUFXLEdBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRXBDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFN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QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNyQyxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUVELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUM1QyxNQUFNLGtCQUFrQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7QUFDeEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0FBQ3pDLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFFbkUsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFVLE1BQWUsRUFBRSxNQUFnQjtJQUMzRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtJQUN4QixDQUFDO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM5QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDL0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDL0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUUvQixtREFBbUQ7SUFDbkQsSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQTtJQUN4QixJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ3hCLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7SUFDdkIsSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQTtJQUN4QixJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFBO0lBQ3ZCLElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDeEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQTtJQUN2QixJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ3hCLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7SUFDdkIsSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQTtJQUN4QixJQUFJLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFBO0lBQ3hCLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7SUFFeEIseUNBQXlDO0lBQ3pDLE1BQU0sSUFBSSxHQUNSLElBQUksR0FBRyxJQUFJO1FBQ1gsSUFBSSxHQUFHLElBQUk7UUFDWCxJQUFJLEdBQUcsSUFBSTtRQUNYLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUMzQyxNQUFNLElBQUksR0FDUixJQUFJLEdBQUcsSUFBSTtRQUNYLElBQUksR0FBRyxJQUFJO1FBQ1gsSUFBSSxHQUFHLElBQUk7UUFDWCxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDM0MsTUFBTSxJQUFJLEdBQ1IsSUFBSSxHQUFHLElBQUk7UUFDWCxJQUFJLEdBQUcsSUFBSTtRQUNYLEtBQUssR0FBRyxJQUFJO1FBQ1osQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQzVDLE1BQU0sSUFBSSxHQUNSLElBQUksR0FBRyxJQUFJO1FBQ1gsSUFBSSxHQUFHLElBQUk7UUFDWCxLQUFLLEdBQUcsSUFBSTtRQUNaLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUM1QyxNQUFNLElBQUksR0FDUixJQUFJLEdBQUcsSUFBSTtRQUNYLElBQUksR0FBRyxJQUFJO1FBQ1gsSUFBSSxHQUFHLElBQUk7UUFDWCxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDM0MsTUFBTSxJQUFJLEdBQ1IsSUFBSSxHQUFHLElBQUk7UUFDWCxJQUFJLEdBQUcsSUFBSTtRQUNYLElBQUksR0FBRyxJQUFJO1FBQ1gsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQzNDLE1BQU0sSUFBSSxHQUNSLElBQUksR0FBRyxJQUFJO1FBQ1gsSUFBSSxHQUFHLElBQUk7UUFDWCxLQUFLLEdBQUcsSUFBSTtRQUNaLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUM1QyxNQUFNLElBQUksR0FDUixJQUFJLEdBQUcsSUFBSTtRQUNYLElBQUksR0FBRyxJQUFJO1FBQ1gsS0FBSyxHQUFHLElBQUk7UUFDWixDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFFNUMsb0RBQW9EO0lBQ3BELElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ2xC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LENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN2QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN2QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN2QixPQUFPLE1BQU0sQ0FBQTtRQUNmLENBQUM7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUE7SUFDOUUsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUVmLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQTtJQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUE7SUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQTtJQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUE7SUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQTtJQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUE7SUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQTtJQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUE7SUFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcs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SUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUU5QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDOUIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDOUIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDOUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNoQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDaEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUVoQyxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQTtJQUNwRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQTtJQUNwRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUVyRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQTtJQUNwRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQTtJQUNwRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUVyRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQTtJQUNyRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQTtJQUNyRSxNQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQTtJQUV0RSxNQUFNLFdBQVcsR0FDZixLQUFLLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUE7SUFDOUQsTUFBTSxXQUFXLEdBQ2YsS0FBSyxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsTUFBTSxDQUFBO0lBQzlELE1BQU0sV0FBVyxHQUNmLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQTtJQUUvRCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN2QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtJQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN2QixPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQSJ9