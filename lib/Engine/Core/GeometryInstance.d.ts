import { GeometryInstanceOptions } from '../../type';
import Geometry from '../Core/Geometry';
import GeometryAttribute from './GeometryAttribute';
import Matrix4 from '../Core/Matrix4';
import Primitive from '../Scene/Primitive';
export default class GeometryInstance {
    geometry: Geometry;
    eastHemisphereGeometry: Geometry | undefined;
    westHemisphereGeometry: Geometry | undefined;
    id: string;
    modelMatrix: Matrix4;
    attributes: {
        [key: string]: GeometryAttribute;
    } | undefined;
    pickPrimitive: Primitive | undefined;
    constructor(options: GeometryInstanceOptions);
}
