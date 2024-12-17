import Matrix4 from '../../Engine/Core/Matrix4'
import GeometryAttribute from '../../Engine/Core/GeometryAttribute'
import { PrimitiveType } from '../scene/primitive'

export interface GeometryOptions {
  attributes: {
    [key: string]: GeometryAttribute
  }
  indices: Uint16Array
  primitiveType: PrimitiveType
  modelMatrix?: Matrix4
}
