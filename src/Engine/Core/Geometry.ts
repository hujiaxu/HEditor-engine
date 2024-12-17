import { GeometryOptions, PrimitiveType } from '../../type'
import Matrix4 from './Matrix4'
import GeometryAttribute from './GeometryAttribute'

export default class Geometry {
  attributes: {
    [key: string]: GeometryAttribute
  }
  indices: Uint16Array
  primitiveType: PrimitiveType
  modelMatrix: Matrix4
  constructor({
    attributes,
    indices,
    primitiveType,
    modelMatrix
  }: GeometryOptions) {
    this.attributes = attributes
    this.indices = indices
    this.primitiveType = primitiveType
    this.modelMatrix = modelMatrix || Matrix4.IDENTITY
  }
}