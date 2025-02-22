export interface TipsifyOptions {
    indices: Uint16Array | Uint32Array | number[];
    maximumIndex: number;
    cacheSize?: number;
}
export interface VerticeType {
    numLiveTriangles: number;
    timeStamp: number;
    vertexTriangles: number[];
}
