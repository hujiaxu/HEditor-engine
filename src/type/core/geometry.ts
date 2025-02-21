import { PrimitiveType } from '../scene/primitive'
import { BoundingSphere, Matrix4, GeometryAttributes } from '../../Engine'
import { GeometryIndicesType } from './geometryAttributes'

export interface GeometryOptions {
  attributes: GeometryAttributes
  indices?: GeometryIndicesType
  primitiveType: PrimitiveType
  modelMatrix?: Matrix4
  boundingSphere?: BoundingSphere
  boundingSphereCV?: BoundingSphere
}

export enum GeometryType {
  GEOMETRY = 'geometry',
  EAST_HEMISPHERE_GEOMETRY = 'eastHemisphereGeometry',
  WEST_HEMISPHERE_GEOMETRY = 'westHemisphereGeometry'
}
