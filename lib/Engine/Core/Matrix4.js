import BoundingRectangle from './BoundingRectangle';
import Cartesian3 from './Cartesian3';
import Cartesian4 from './Cartesian4';
import defaultValue from './DefaultValue';
import defined from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWF0cml4NC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9NYXRyaXg0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUE7QUFDbkQsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRS9CLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUMxQixNQUFNLENBQUMsT0FBTyxDQUEyQjtJQUVqQyxPQUFPLENBQVU7SUFFekIsTUFBTSxDQUFDLFlBQVksQ0FBUTtJQUMzQixNQUFNLENBQUMsSUFBSSxDQUlFO0lBQ2IsTUFBTSxDQUFDLFFBQVEsQ0FBcUQ7SUFDcEUsTUFBTSxDQUFDLEtBQUssQ0FBNEM7SUFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FJRDtJQUNaLE1BQU0sQ0FBQyxTQUFTLENBSUo7SUFDWixNQUFNLENBQUMsb0JBQW9CLENBQWlEO0lBQzVFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBaUQ7SUFDekUsTUFBTSxDQUFDLHVCQUF1QixDQUlsQjtJQUNaLE1BQU0sQ0FBQyxRQUFRLENBQVM7SUFDeEIsTUFBTSxDQUFDLGVBQWUsQ0FBd0Q7SUFDOUUsTUFBTSxDQUFDLFNBQVMsQ0FBa0Q7SUFDbEUsTUFBTSxDQUFDLGdCQUFnQixDQUE4QztJQUNyRSxNQUFNLENBQUMsWUFBWSxDQUFrRDtJQUNyRSxNQUFNLENBQUMsMkJBQTJCLENBUXRCO0lBQ1osTUFBTSxDQUFDLDZCQUE2QixDQU14QjtJQUNaLE1BQU0sQ0FBQyw0QkFBNEIsQ0FRdkI7SUFDWixNQUFNLENBQUMsV0FBVyxDQU1OO0lBQ1osTUFBTSxDQUFDLE1BQU0sQ0FBNEM7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O0lBQzFDLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUs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QUFFLENBQUE7SUFDeEIsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQyxDQUFBO0FBQ0QsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLFFBQWlCLEVBQUUsTUFBZ0I7SUFDbEUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1osTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQyxDQUFBO0FBQ0QsT0FBTyxDQUFDLDJCQUEyQixHQUFHLFVBQ3BDLElBQVksRUFDWixLQUFhLEVBQ2IsTUFBYyxFQUNkLEdBQVcsRUFDWCxJQUFZLEVBQ1osR0FBVyxFQUNYLE1BQWdCO0lBRWhCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNaLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO0lBQ3hCLENBQUM7SUFDRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNqRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQTtJQUNqRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNuRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQTtJQUNuRCxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ2hELE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFBO0lBQ3hCLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3RELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxD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SyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUE7SUFDcEQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNoRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUNoQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN4QixNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUNoQyxNQUFNLENB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S0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQ3JDLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxPQUFPLENBQUMsUUFBUSxHQUFHLFVBQVUsSUFBYSxFQUFFLEtBQWMsRUFBRSxNQUFnQjtJQUMxRSxJ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LENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFcEMsTUFBTSxXQUFXLEdBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3BDLE1BQU0sV0FBVyxHQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxNQUFNLFdBQVcsR0FDZixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEMsTUFBTSxXQUFXLEdBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRXBDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO0lBQzlCLE1B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QUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDNUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM1QixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRTVCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDckQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sR0FBRyxFQUFFLEdBQUcsT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNyRCxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUcsT0FBTyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsRUFBRSxDQUFBO0lBRXRELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxD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TSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNyQyxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQSJ9