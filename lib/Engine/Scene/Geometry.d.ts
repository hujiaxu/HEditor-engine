import { GeometryOptions, PrimitiveType } from '../../type';
import GeometryAttribute from './GeometryAttribute';
export default class Geometry {
    attributes: {
        [key: string]: GeometryAttribute;
    };
    indices: Uint16Array;
    primitiveType: PrimitiveType;
    constructor({ attributes, indices, primitiveType }: GeometryOptions);
}
