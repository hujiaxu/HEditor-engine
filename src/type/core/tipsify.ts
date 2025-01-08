export interface TipsifyOptions {
  indices: Uint16Array | number[]
maximumIndex: number
cacheSize?: number
}

export interface VerticeType {
  numLiveTriangles: number
  timeStamp: number
vertexTriangles: number[]
}