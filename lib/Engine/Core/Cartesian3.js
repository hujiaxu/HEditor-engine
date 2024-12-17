import { defined } from './Defined';
import HEditorMath from './Math';
export default class Cartesian3 {
    static cross;
    static dot;
    static subtract;
    static add;
    x;
    y;
    z;
    static multiplyByScalar;
    static multiply;
    static clone;
    static ZERO;
    static distance;
    static distanceSquared;
    static equals;
    static magnitude;
    static normalize;
    static magnitudeSquared;
    static multiplyComponents;
    static equalsEpsilon;
    static angleBetween;
    static abs;
    static UNIT_X;
    static UNIT_Y;
    static UNIT_Z;
    static mostOrthogonalAxis;
    static divideByScalar;
    static negate;
    static fromElements;
    static unpack;
    static projectVector;
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
}
Cartesian3.cross = function (left, right, result) {
    if (!result) {
        result = new Cartesian3();
    }
    const x = left.y * right.z - left.z * right.y;
    const y = left.z * right.x - left.x * right.z;
    const z = left.x * right.y - left.y * right.x;
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
Cartesian3.dot = function (left, right) {
    return left.x * right.x + left.y * right.y + left.z * right.z;
};
Cartesian3.subtract = function (left, right, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = left.x - right.x;
    result.y = left.y - right.y;
    result.z = left.z - right.z;
    return result;
};
Cartesian3.add = function (left, right, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = left.x + right.x;
    result.y = left.y + right.y;
    result.z = left.z + right.z;
    return result;
};
Cartesian3.multiplyByScalar = function (cartesian, scalar, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = cartesian.x * scalar;
    result.y = cartesian.y * scalar;
    result.z = cartesian.z * scalar;
    return result;
};
Cartesian3.multiply = function (left, right, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = left.x * right.x;
    result.y = left.y * right.y;
    result.z = left.z * right.z;
    return result;
};
Cartesian3.clone = function (cartesian, result) {
    if (!result) {
        return new Cartesian3(cartesian.x, cartesian.y, cartesian.z);
    }
    result.x = cartesian.x;
    result.y = cartesian.y;
    result.z = cartesian.z;
    return result;
};
Cartesian3.ZERO = Cartesian3.clone(new Cartesian3(0, 0, 0));
Cartesian3.UNIT_X = Cartesian3.clone(new Cartesian3(1, 0, 0));
Cartesian3.UNIT_Y = Cartesian3.clone(new Cartesian3(0, 1, 0));
Cartesian3.UNIT_Z = Cartesian3.clone(new Cartesian3(0, 0, 1));
Cartesian3.distance = function (left, right) {
    return Math.sqrt(Cartesian3.distanceSquared(left, right));
};
Cartesian3.distanceSquared = function (left, right) {
    const x = left.x - right.x;
    const y = left.y - right.y;
    const z = left.z - right.z;
    return x * x + y * y + z * z;
};
Cartesian3.equals = function (left, right) {
    return left.x === right.x && left.y === right.y && left.z === right.z;
};
Cartesian3.magnitude = function (cartesian) {
    return Math.sqrt(cartesian.x * cartesian.x +
        cartesian.y * cartesian.y +
        cartesian.z * cartesian.z);
};
Cartesian3.magnitudeSquared = function (cartesian) {
    return (cartesian.x * cartesian.x +
        cartesian.y * cartesian.y +
        cartesian.z * cartesian.z);
};
Cartesian3.normalize = function (cartesian, result) {
    if (!result) {
        result = new Cartesian3();
    }
    const magnitude = Cartesian3.magnitude(cartesian);
    result.x = cartesian.x / magnitude;
    result.y = cartesian.y / magnitude;
    result.z = cartesian.z / magnitude;
    return result;
};
Cartesian3.multiplyComponents = function (left, right, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = left.x * right.x;
    result.y = left.y * right.y;
    result.z = left.z * right.z;
    return result;
};
Cartesian3.equalsEpsilon = function (left, right, relativeEpsilon, absoluteEpsilon) {
    return (left === right ||
        (defined(left) &&
            defined(right) &&
            HEditorMath.equalsEpsilon(left.x, right.x, relativeEpsilon, absoluteEpsilon) &&
            HEditorMath.equalsEpsilon(left.y, right.y, relativeEpsilon, absoluteEpsilon) &&
            HEditorMath.equalsEpsilon(left.z, right.z, relativeEpsilon, absoluteEpsilon)));
};
const angleBetweenScratch = new Cartesian3();
const angleBetweenScratch2 = new Cartesian3();
Cartesian3.angleBetween = function (left, right) {
    Cartesian3.normalize(left, angleBetweenScratch);
    Cartesian3.normalize(right, angleBetweenScratch2);
    const cosine = Cartesian3.dot(angleBetweenScratch, angleBetweenScratch2);
    const sine = Cartesian3.magnitude(Cartesian3.cross(angleBetweenScratch, angleBetweenScratch2, angleBetweenScratch));
    return Math.atan2(sine, cosine);
};
Cartesian3.abs = function (cartesian, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = Math.abs(cartesian.x);
    result.y = Math.abs(cartesian.y);
    result.z = Math.abs(cartesian.z);
    return result;
};
const mostOrthogonalAxisScrach = new Cartesian3();
Cartesian3.mostOrthogonalAxis = function (cartesian, result) {
    const f = Cartesian3.normalize(cartesian, mostOrthogonalAxisScrach);
    Cartesian3.abs(f, f);
    if (f.x <= f.y) {
        if (f.x <= f.z) {
            result = Cartesian3.clone(Cartesian3.UNIT_X, result);
        }
        else {
            result = Cartesian3.clone(Cartesian3.UNIT_Z, result);
        }
    }
    else if (f.y <= f.z) {
        result = Cartesian3.clone(Cartesian3.UNIT_Y, result);
    }
    else {
        result = Cartesian3.clone(Cartesian3.UNIT_Z, result);
    }
    return result;
};
Cartesian3.divideByScalar = function (cartesian, scalar, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = cartesian.x / scalar;
    result.y = cartesian.y / scalar;
    result.z = cartesian.z / scalar;
    return result;
};
Cartesian3.negate = function (cartesian, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = -cartesian.x;
    result.y = -cartesian.y;
    result.z = -cartesian.z;
    return result;
};
Cartesian3.fromElements = function (x, y, z, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
};
Cartesian3.unpack = function (array, index, result) {
    if (!result) {
        result = new Cartesian3();
    }
    result.x = array[index];
    result.y = array[index + 1];
    result.z = array[index + 2];
    return result;
};
Cartesian3.projectVector = function (cartesian, direction, result) {
    const scalar = Cartesian3.dot(cartesian, direction) / Cartesian3.dot(direction, direction);
    return Cartesian3.multiplyByScalar(direction, scalar, result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydGVzaWFuMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9DYXJ0ZXNpYW4zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDbkMsT0FBTyxXQUFXLE1BQU0sUUFBUSxDQUFBO0FBRWhDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVTtJQUM3QixNQUFNLENBQUMsS0FBSyxDQUlHO0lBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBaUQ7SUFDM0QsTUFBTSxDQUFDLFFBQVEsQ0FJQTtJQUNmLE1BQU0sQ0FBQyxHQUFHLENBSUs7SUFFZixDQUFDLENBQVE7SUFDVCxDQUFDLENBQVE7SUFDVCxDQUFDLENBQVE7SUFDVCxNQUFNLENBQUMsZ0JBQWdCLENBSVI7SUFDZixNQUFNLENBQUMsUUFBUSxDQUlBO0lBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBNEQ7SUFDeEUsTUFBTSxDQUFDLElBQUksQ0FBWTtJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFpRDtJQUNoRSxNQUFNLENBQUMsZUFBZSxDQUFpRDtJQUN2RSxNQUFNLENBQUMsTUFBTSxDQUFrRDtJQUMvRCxNQUFNLENBQUMsU0FBUyxDQUFtQztJQUNuRCxNQUFNLENBQUMsU0FBUyxDQUE0RDtJQUM1RSxNQUFNLENBQUMsZ0JBQWdCLENBQW1DO0lBQzFELE1BQU0sQ0FBQyxrQkFBa0IsQ0FJVjtJQUNmLE1BQU0sQ0FBQyxhQUFhLENBS1I7SUFDWixNQUFNLENBQUMsWUFBWSxDQUFpRDtJQUNwRSxNQUFNLENBQUMsR0FBRyxDQUE0RDtJQUN0RSxNQUFNLENBQUMsTUFBTSxDQUFZO0lBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQVk7SUFDekIsTUFBTSxDQUFDLE1BQU0sQ0FBWTtJQUN6QixNQUFNLENBQUMsa0JBQWtCLENBR1Y7SUFDZixNQUFNLENBQUMsY0FBYyxDQUlOO0lBQ2YsTUFBTSxDQUFDLE1B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QUFHLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDdEIsTUFBTSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFBO0lBQ3RCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUN0QixPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUNELFVBQVUsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDM0QsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3RCxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzdELFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0QsVUFBVSxDQUFDLFFBQVEsR0FBRyxVQUFVLElBQWdCLEVBQUUsS0FBaUI7SUFDakUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDM0QsQ0FBQyxDQUFBO0FBQ0QsVUFBVSxDQUFDLGVBQWUsR0FBRyxVQUFVLElBQWdCLEVBQUUsS0FBaUI7SUFDeEUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUMxQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMs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