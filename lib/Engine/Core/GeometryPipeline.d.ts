import { GeometryAttributeType } from '../../type';
import Geometry from './Geometry';
import GeometryInstance from './GeometryInstance';
export default class GeometryPipeline {
    static transformToWorldCoordinates: (instance: GeometryInstance) => void;
    static reorderForPostVertexCache: (geometry: Geometry, cacheCapacity?: number) => Geometry;
    static reorderForPreVertexCache: (geometry: Geometry) => Geometry;
    static combineInstances: (instances: GeometryInstance[]) => Geometry[];
    static encodeAttribute: (geometry: Geometry, attributeName: GeometryAttributeType, attributeHighName: GeometryAttributeType, attributeLowName: GeometryAttributeType) => Geometry;
    static createAttributeLocations: (geometry: Geometry) => {
        [key: string]: number;
    };
    static compressVertices: (geometry: Geometry) => Geometry;
    static fitToUnsignedShortIndices: (geometry: Geometry) => Geometry[];
}
