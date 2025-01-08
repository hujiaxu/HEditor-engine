import { PrimitiveType } from '../scene/primitive'
import { BoundingSphere, Matrix4, GeometryAttributes } from '../../Engine'

export interface GeometryOptions {
  attributes: GeometryAttributes
  indices: Uint16Array | number[]
  primitiveType: PrimitiveType
  modelMatrix?: Matrix4
  boundingSphere?: BoundingSphere
}
