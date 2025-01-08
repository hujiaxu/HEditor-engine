import BoundingSphere from "./BoundingSphere";
import Cartesian3 from "./Cartesian3";
import Defined from "./Defined";
import GeometryAttribute from "./GeometryAttribute";
import GeometryInstance from "./GeometryInstance";
import Matrix3 from "./Matrix3";
import Matrix4 from "./Matrix4";

let scratchCartesian3 = new Cartesian3();
const transformPoint = (matrix: Matrix4, attribute: GeometryAttribute) => {
  if (Defined(attribute)) {
    const values = attribute.values as number[];
    const length = values.length;
    for (let i = 0; i < length; i += 3) {
      Cartesian3.unpack(values, i, scratchCartesian3);
      Matrix4.multiplyByPoint(matrix, scratchCartesian3, scratchCartesian3);
      Cartesian3.pack(scratchCartesian3, values, i);
    }
  }
}
const transformVector = (matrix: Matrix3, attribute: GeometryAttribute) => {
  if (Defined(attribute)) {
    const values = attribute.values;
    const length = values.length ;
    for (let i = 0; i < length; i += 3) {
      Cartesian3.unpack(values, i, scratchCartesian3);
      Matrix3.multiplyByVector(matrix, scratchCartesian3, scratchCartesian3);
      Cartesian3.normalize(scratchCartesian3, scratchCartesian3);
      Cartesian3.pack(scratchCartesian3, values as number[], i);
    }
  }
}

export default class GeometryPipeline {
  static transformToWorldCoordinates: (instance: GeometryInstance) => void;
}

const inverseTranspose = new Matrix4();
const normalMatrix = new Matrix3();
GeometryPipeline.transformToWorldCoordinates = (instance: GeometryInstance) => {
  
  //>>includeStart('debug', pragmas.debug);
  if (!Defined(instance)) {
    throw new Error("instance is required.");
  }
  //>>includeEnd('debug');

  const modelMatrix = instance.modelMatrix;

  if (Matrix4.equals(modelMatrix, Matrix4.IDENTITY)) {
    // Already in world coordinates
    return instance;
  }
  const attributes = instance.geometry.attributes;

  // Transform attributes in known vertex formats
  transformPoint(modelMatrix, attributes.position!);
  // transformPoint(modelMatrix, attributes.prevPosition);
  // transformPoint(modelMatrix, attributes.nextPosition);

  if (
    Defined(attributes.normal) ||
    Defined(attributes.tangent) ||
    Defined(attributes.bitangent)
  ) {

    Matrix4.inverse(modelMatrix, inverseTranspose);
    Matrix4.transpose(inverseTranspose, inverseTranspose);
    Matrix4.getMatrix3(inverseTranspose, normalMatrix);

    transformVector(normalMatrix, attributes.normal!);
    transformVector(normalMatrix, attributes.tangent!);
    transformVector(normalMatrix, attributes.bitangent!);
  }

  const boundingSphere = instance.geometry.boundingSphere;
  if (Defined(boundingSphere)) {
    instance.geometry.boundingSphere = BoundingSphere.transform(
      boundingSphere,
      modelMatrix,
      boundingSphere,
    );
  }

  instance.modelMatrix = Matrix4.clone(Matrix4.IDENTITY);

  return instance;
}