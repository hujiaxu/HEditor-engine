import { Ellipsoid, GeographicProjection, GeometryInstance, Matrix4 } from "../../Engine";

export interface CombineGeometryParameters {
  instances: GeometryInstance[]
  ellipsoid: Ellipsoid
  projection: GeographicProjection
  elementIndexUintSupported: boolean
  scene3DOnly: boolean
  vertexCacheOptimize: boolean
  compressVertices: boolean
  modelMatrix: Matrix4
  createPickOffsets: boolean
}