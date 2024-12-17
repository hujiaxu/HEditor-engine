import GeometryAttribute from '../../Engine/Core/GeometryAttribute';
import Geometry from '../../Engine/Core/Geometry';
import Matrix4 from '../../Engine/Core/Matrix4';
export interface GeometryInstanceOptions {
    modelMatrix?: Matrix4;
    geometry: Geometry;
    id: string;
    attributes: {
        [key: string]: GeometryAttribute;
    };
}
