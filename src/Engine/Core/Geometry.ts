import { GeometryAttributeType, GeometryOptions, PrimitiveType } from '../../type'
import Matrix4 from './Matrix4'
import GeometryAttributes from './GeometryAttributes'
import BoundingSphere from './BoundingSphere'
import Cartesian3 from './Cartesian3'
import Defined from './Defined'
import GeometryAttribute from './GeometryAttribute'

export default class Geometry {
  attributes: GeometryAttributes
  indices: Uint16Array | Uint32Array | number[]
  primitiveType: PrimitiveType
  modelMatrix: Matrix4

  boundingSphere: BoundingSphere
  boundingSphereCV: BoundingSphere | undefined
  offsetAttribute: GeometryAttribute | undefined
  static computeNumberOfVertices: (geometry: Geometry) => number
  constructor({
    attributes,
    indices,
    primitiveType,
    modelMatrix,
    boundingSphere,
    boundingSphereCV
  }: GeometryOptions) {
    this.attributes = attributes
    this.indices = indices || new Uint16Array(0)
    this.primitiveType = primitiveType
    this.modelMatrix = modelMatrix || Matrix4.IDENTITY
    this.boundingSphere =
      boundingSphere || new BoundingSphere(Cartesian3.ZERO, 0)

      this.boundingSphereCV = boundingSphereCV || undefined
  }
}

Geometry.computeNumberOfVertices = (geometry: Geometry) => {

  let numberOfVertices = -1;

  for (const property in geometry.attributes) {
    if (
      geometry.attributes.hasOwnProperty(property) &&
      Defined(geometry.attributes) &&
      Defined(geometry.attributes[property as GeometryAttributeType]) && 
      Defined(geometry.attributes[property as GeometryAttributeType]!.values)
    ) {
      const attribute = geometry.attributes[property as GeometryAttributeType]!;
      const num = attribute.values.length / attribute.componentsPerAttribute;
      //>>includeStart('debug', pragmas.debug);
      if (numberOfVertices !== num && numberOfVertices !== -1) {
        throw new Error(
          "All attribute lists must have the same number of attributes.",
        );
      }
      //>>includeEnd('debug');
      numberOfVertices = num;
    }
  }

  return numberOfVertices;
}
