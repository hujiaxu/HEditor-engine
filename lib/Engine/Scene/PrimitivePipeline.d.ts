import { GeometryOffsetAttribute } from '../../type';
import { CombineGeometryParameters } from '../../type/scene/primitivePipeline';
import BoundingSphere from '../Core/BoundingSphere';
import Geometry from '../Core/Geometry';
import Matrix4 from '../Core/Matrix4';
interface CombineGeometryResult {
    geometries: Geometry[];
    modelMatrix: Matrix4;
    attributeLocations: {
        [key: string]: number;
    } | undefined;
    pickOffsets: PickOffsets[] | undefined;
    offsetInstanceExtend: GeometryOffsetAttribute[];
    boundingSpheres: BoundingSphere[];
    boundingSpheresCV: BoundingSphere[];
}
export interface PickOffsets {
    index: number;
    offset: number;
    count: number;
}
export default class PrimitivePipeline {
    static combineGeometry: (parameters: CombineGeometryParameters) => CombineGeometryResult;
}
export {};
