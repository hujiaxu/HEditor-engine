import { GeometryOptions, PrimitiveType } from '../../type'
import Matrix4 from './Matrix4'
import GeometryAttributes from './GeometryAttributes'
import BoundingSphere from './BoundingSphere'
import Cartesian3 from './Cartesian3'

export default class Geometry {
  attributes: GeometryAttributes
  indices: Uint16Array | number[]
  primitiveType: PrimitiveType
  modelMatrix: Matrix4

  boundingSphere: BoundingSphere
  constructor({
    attributes,
    indices,
    primitiveType,
    modelMatrix,
    boundingSphere
  }: GeometryOptions) {
    this.attributes = attributes
    this.indices = indices
    this.primitiveType = primitiveType
    this.modelMatrix = modelMatrix || Matrix4.IDENTITY
    this.boundingSphere =
      boundingSphere || new BoundingSphere(Cartesian3.ZERO, 0)
  }
}
