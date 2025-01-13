import { ComponentDatatype, GeometryAttributeType, PrimitiveType } from "../../type";
import BoundingSphere from "./BoundingSphere";
import Cartesian3 from "./Cartesian3";
import Defined from "./Defined";
import Geometry from "./Geometry";
import GeometryAttribute from "./GeometryAttribute";
import GeometryInstance from "./GeometryInstance";
import IndexDatatype from "./IndexDatatype";
import Matrix3 from "./Matrix3";
import Matrix4 from "./Matrix4";
import Tipsify from "./Tipsify";

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
  static reorderForPostVertexCache: (geometry: Geometry, cacheCapacity?: number) => Geometry;
  static reorderForPreVertexCache: (geometry: Geometry) => Geometry;
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

GeometryPipeline.reorderForPostVertexCache = (geometry: Geometry, cacheCapacity?: number) => {

  //>>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error("geometry is required.");
  }
  //>>includeEnd('debug');
  const indices = geometry.indices;

  if (geometry.primitiveType === PrimitiveType.TRIANGLES && Defined(indices)) {
    const numIndices = indices.length;
    let maximumIndex = 0;
    for (let j = 0; j < numIndices; j++) {
      if (indices[j] > maximumIndex) {
        maximumIndex = indices[j];
      }
    }

    geometry.indices = Tipsify.tipsify({
      indices: indices,
      maximumIndex: maximumIndex,
      cacheSize: cacheCapacity,
    });
  }
  
  return geometry;
}
GeometryPipeline.reorderForPreVertexCache = (geometry: Geometry) => {

  //>>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error("geometry is required.");
  }
  //>>includeEnd('debug');
  
  
  const numVertices = Geometry.computeNumberOfVertices(geometry);

  const indices = geometry.indices;

  if (Defined(indices)) {

    const indexCrossReferenceOldToNew = new Int32Array(numVertices);
    for (let i = 0; i < numVertices; i++) {
      indexCrossReferenceOldToNew[i] = -1;
    }

    // Construct cross reference and reorder indices
    const indicesIn = indices;
    const numIndices = indicesIn.length;
    const indicesOut = IndexDatatype.createTypedArray(numVertices, numIndices);


    let intoIndicesIn = 0;
    let intoIndicesOut = 0;
    let nextIndex = 0;
    let tempIndex;
    while (intoIndicesIn < numIndices) {
      tempIndex = indexCrossReferenceOldToNew[indicesIn[intoIndicesIn]];
      if (tempIndex !== -1) {
        indicesOut[intoIndicesOut] = tempIndex;
      } else {
        tempIndex = indicesIn[intoIndicesIn];
        indexCrossReferenceOldToNew[tempIndex] = nextIndex;

        indicesOut[intoIndicesOut] = nextIndex;
        ++nextIndex;
      }
      ++intoIndicesIn;
      ++intoIndicesOut;
    }
    geometry.indices = indicesOut;

    // Reorder attributes
    const attributes = geometry.attributes;
    for (const property in attributes) {

      if (
        attributes.hasOwnProperty(property) &&
        Defined(attributes[property as GeometryAttributeType]) &&
        Defined(attributes[property as GeometryAttributeType]!.values)
      ) {

        const attribute = attributes[property as GeometryAttributeType]!;
        const elementsIn = attribute.values;
        let intoElementsIn = 0;
        const numComponents = attribute.componentsPerAttribute;
        const elementsOut = ComponentDatatype.createTypedArray(
          attribute.componentDatatype,
          nextIndex * numComponents,
        );
        while (intoElementsIn < numVertices) {
          const temp = indexCrossReferenceOldToNew[intoElementsIn];
          if (temp !== -1) {
            for (let j = 0; j < numComponents; j++) {
              elementsOut[numComponents * temp + j] =
                elementsIn[numComponents * intoElementsIn + j];
            }
          }
          ++intoElementsIn;
        }
        attribute.values = elementsOut;
      }
    }
  }
  return geometry;
}
