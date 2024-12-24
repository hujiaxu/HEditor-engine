import { Appearance, Cartesian3, GeometryInstance, Matrix4 } from '../../Engine';
export declare enum PrimitiveType {
    POINTS,
    LINES,
    LINE_LOOP,
    LINE_STRIP,
    TRIANGLES,
    TRIANGLE_STRIP,
    TRIANGLE_FAN
}
export declare enum PrimitiveState {
    READY = 0,
    CREATING = 1,
    CREATED = 2,
    COMBINING = 3,
    COMBINED = 4,
    COMPLETE = 5,
    FAILED = 6
}
export interface PrimitiveOptions {
    GeometryInstances: GeometryInstance[] | GeometryInstance;
    primitiveType: PrimitiveType;
    appearance: Appearance;
    depthFailAppearance?: Appearance;
    show?: boolean;
    modelMatrix?: Matrix4;
    id?: string;
    releaseGeometryInstances?: boolean;
    vertexCacheOptimize?: boolean;
    interleave?: boolean;
    allowPicking?: boolean;
    asynchronous?: boolean;
    compressVertices?: boolean;
    cull?: boolean;
    rtcCenter?: Cartesian3;
}
