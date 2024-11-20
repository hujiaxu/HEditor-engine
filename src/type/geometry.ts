import GeometryAttribute from '../Engine/Scene/GeometryAttribute'
import { PrimitiveType } from './primitive'

export interface GeometryOptions {
  attributes: {
    [key: string]: GeometryAttribute
  }
  indices: Uint16Array
  primitiveType: PrimitiveType
}
