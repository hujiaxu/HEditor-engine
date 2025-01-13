export interface TipsifyOptions {
  indices: Uint16Array | Uint32Array
maximumIndex: number
cacheSize?: number
}

export interface VerticeType {
  numLiveTriangles: number
  timeStamp: number
vertexTriangles: number[]
}