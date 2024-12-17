import { GeometryInstanceOptions } from '../../type';
import Geometry from './Geometry';
import GeometryAttribute from './GeometryAttribute';
import Matrix4 from './Matrix4';
export default class GeometryInstance {
    geometry: Geometry;
    id: string;
    modelMatrix: Matrix4;
    attributes: {
        [key: string]: GeometryAttribute;
    } | undefined;
    constructor(options: GeometryInstanceOptions);
}
