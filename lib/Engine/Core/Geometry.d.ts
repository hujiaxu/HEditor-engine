import { GeometryIndicesType, GeometryOffsetAttribute, GeometryOptions, PrimitiveType } from '../../type';
import Matrix4 from './Matrix4';
import GeometryAttributes from './GeometryAttributes';
import BoundingSphere from './BoundingSphere';
export default class Geometry {
    attributes: GeometryAttributes;
    indices: GeometryIndicesType;
    primitiveType: PrimitiveType;
    modelMatrix: Matrix4;
    boundingSphere: BoundingSphere;
    boundingSphereCV: BoundingSphere | undefined;
    offsetAttribute: GeometryOffsetAttribute | undefined;
    static computeNumberOfVertices: (geometry: Geometry) => number;
    constructor({ attributes, indices, primitiveType, modelMatrix, boundingSphere, boundingSphereCV }: GeometryOptions);
}
