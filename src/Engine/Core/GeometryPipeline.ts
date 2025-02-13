import { ComponentDatatype, GeometryAttributeType, InstanceGeometryType, PrimitiveType } from "../../type";
import BoundingSphere from "./BoundingSphere";
import Cartesian3 from "./Cartesian3";
import Defined from "./Defined";
import EncodedCartesian3 from "./EncodedCartesian3";
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
  static combineInstances: (instances: GeometryInstance[]) => Geometry[];
  static encodeAttribute: (geometry: Geometry, attributeName: GeometryAttributeType, attributeHighName: GeometryAttributeType, attributeLowName: GeometryAttributeType) => Geometry;
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

const findAttributesInAllGeometries = (instances: GeometryInstance[], propertyName: InstanceGeometryType) => {
  const length = instances.length;

  let attributesInAllGeometries: { [key in GeometryAttributeType]: GeometryAttribute | undefined } = {
    position: undefined,
    normal: undefined,
    st: undefined,
    binormal: undefined,
    tangent: undefined,
    bitangent: undefined,
    color: undefined,
    batchId: undefined,
    position3DHigh: undefined,
    position3DLow: undefined
  }

  const attributes0 = instances[0][propertyName].attributes;
  let name: GeometryAttributeType;

  for (name in attributes0) {
    if (
      attributes0.hasOwnProperty(name) &&
      Defined(attributes0[name]) &&
      Defined(attributes0[name]?.values)
    ) {
      const attribute = attributes0[name]!;
      let numberOfComponents = attribute.values.length;
      let inAllGeometries = true;

        // Does this same attribute exist in all geometries?
        for (let i = 1; i < length; ++i) {
          const otherAttribute = instances[i][propertyName].attributes[name];
      
          if (
            !Defined(otherAttribute) ||
            attribute.componentDatatype !== otherAttribute.componentDatatype ||
            attribute.componentsPerAttribute !==
              otherAttribute.componentsPerAttribute ||
            attribute.normalize !== otherAttribute.normalize
          ) {
            inAllGeometries = false;
            break;
          }
      
          numberOfComponents += otherAttribute.values.length;
        }

        if (inAllGeometries) {
          attributesInAllGeometries[name] = new GeometryAttribute({
            componentDatatype: attribute.componentDatatype,
            componentsPerAttribute: attribute.componentsPerAttribute,
            normalize: attribute.normalize,
            values: ComponentDatatype.createTypedArray(
              attribute.componentDatatype,
              numberOfComponents,
            ),
          });
        }
    }
  }
  return attributesInAllGeometries;

}

const combineGeometries = (instances: GeometryInstance[], propertyName: InstanceGeometryType) => {
  
  const length = instances.length;

  let name;
  let i;
  let j;
  let k;

  const m = instances[0].modelMatrix;
  const haveIndices = Defined(instances[0][propertyName].indices);
  const primitiveType = instances[0][propertyName].primitiveType;

  //>>includeStart('debug', pragmas.debug);
  for (i = 1; i < length; ++i) {
    if (!Matrix4.equals(instances[i].modelMatrix, m)) {
      throw new Error("All instances must have the same modelMatrix.");
    }
    if (Defined(instances[i][propertyName].indices) !== haveIndices) {
      throw new Error(
        "All instance geometries must have an indices or not have one.",
      );
    }
    if (instances[i][propertyName].primitiveType !== primitiveType) {
      throw new Error(
        "All instance geometries must have the same primitiveType.",
      );
    }
  }
  //>>includeEnd('debug');


  // Find subset of attributes in all geometries
  const attributes = findAttributesInAllGeometries(instances, propertyName);
  let values;
  let sourceValues;
  let sourceValuesLength;

  // Combine attributes from each geometry into a single typed array
  for (name in attributes) {
    if (attributes.hasOwnProperty(name)) {
      const attributeName = name as GeometryAttributeType;
      values = attributes[attributeName]!.values;

      k = 0;
      for (i = 0; i < length; ++i) {
        sourceValues = instances[i][propertyName].attributes[attributeName]!.values;
        sourceValuesLength = sourceValues.length;

        for (j = 0; j < sourceValuesLength; ++j) {
          (values as number[])[k++] = sourceValues[j];
        }
      }
    }
  }

  // Combine index lists
  let indices;

  if (haveIndices) {
    let numberOfIndices = 0;
    for (i = 0; i < length; ++i) {
      numberOfIndices += instances[i][propertyName].indices.length;
    }

    const numberOfVertices = Geometry.computeNumberOfVertices(
      new Geometry({
        attributes: attributes,
        primitiveType: PrimitiveType.POINTS,
      }),
    );
    const destIndices = IndexDatatype.createTypedArray(
      numberOfVertices,
      numberOfIndices,
    );

    let destOffset = 0;
    let offset = 0;

    for (i = 0; i < length; ++i) {
      const sourceIndices = instances[i][propertyName].indices;
      const sourceIndicesLen = sourceIndices.length;

      for (k = 0; k < sourceIndicesLen; ++k) {
        destIndices[destOffset++] = offset + sourceIndices[k];
      }

      offset += Geometry.computeNumberOfVertices(instances[i][propertyName]);
    }

    indices = destIndices;
  }

  // Create bounding sphere that includes all instances
  let center: Cartesian3 | undefined = new Cartesian3();
  let radius = 0.0;
  let bs;

  for (i = 0; i < length; ++i) {
    bs = instances[i][propertyName].boundingSphere;
    if (!Defined(bs)) {
      // If any geometries have an undefined bounding sphere, then so does the combined geometry
      center = undefined;
      break;
    }

    Cartesian3.add(bs.center, center, center);
  }

  if (Defined(center)) {
    Cartesian3.divideByScalar(center, length, center);

    for (i = 0; i < length; ++i) {
      bs = instances[i][propertyName].boundingSphere;
      const tempRadius =
        Cartesian3.magnitude(
          Cartesian3.subtract(bs.center, center),
        ) + bs.radius;

      if (tempRadius > radius) {
        radius = tempRadius;
      }
    }
  }
  return new Geometry({
    attributes: attributes,
    indices: indices,
    primitiveType: primitiveType,
    boundingSphere: Defined(center)
      ? new BoundingSphere(center, radius)
      : undefined,
  });

}
GeometryPipeline.combineInstances = (instances: GeometryInstance[]) => {
  //>>includeStart('debug', pragmas.debug);
  if (!Defined(instances) || instances.length < 1) {
    throw new Error(
      "instances is required and must have length greater than zero.",
    );
  }
  //>>includeEnd('debug');


  const instanceGeometry = [];
  // const instanceSplitGeometry = [];
  const length = instances.length;
  for (let i = 0; i < length; ++i) {
    const instance = instances[i];

    if (Defined(instance.geometry)) {
      instanceGeometry.push(instance);
    } 
    // else if (
    //   Defined(instance.westHemisphereGeometry) &&
    //   Defined(instance.eastHemisphereGeometry)
    // ) {
    //   instanceSplitGeometry.push(instance);
    // }
  }

  const geometries = [];
  if (instanceGeometry.length > 0) {
    geometries.push(combineGeometries(instanceGeometry, InstanceGeometryType.GEOMETRY));
  }

  // if (instanceSplitGeometry.length > 0) {
  //   geometries.push(
  //     combineGeometries(instanceSplitGeometry, "westHemisphereGeometry"),
  //   );
  //   geometries.push(
  //     combineGeometries(instanceSplitGeometry, "eastHemisphereGeometry"),
  //   );
  // }

  return geometries;

}

GeometryPipeline.encodeAttribute = (geometry: Geometry, attributeName: GeometryAttributeType, attributeHighName: GeometryAttributeType, attributeLowName: GeometryAttributeType) => {
  
  //>>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error("geometry is required.");
  }
  if (!Defined(attributeName)) {
    throw new Error("attributeName is required.");
  }
  if (!Defined(attributeHighName)) {
    throw new Error("attributeHighName is required.");
  }
  if (!Defined(attributeLowName)) {
    throw new Error("attributeLowName is required.");
  }
  if (!Defined(geometry.attributes[attributeName])) {
    throw new Error(
      `geometry must have attribute matching the attributeName argument: ${attributeName}.`,
    );
  }
  if (
    geometry.attributes[attributeName].componentDatatype !==
    ComponentDatatype.DOUBLE
  ) {
    throw new Error(
      "The attribute componentDatatype must be ComponentDatatype.DOUBLE.",
    );
  }
  //>>includeEnd('debug');

  const attribute = geometry.attributes[attributeName];
  const values = attribute.values;
  const length = values.length;
  const highValues = new Float32Array(length);
  const lowValues = new Float32Array(length);

  for (let i = 0; i < length; ++i) {
    const encodedResult = EncodedCartesian3.encode(values[i]);
    highValues[i] = encodedResult.high;
    lowValues[i] = encodedResult.low;
  }

  const componentsPerAttribute = attribute.componentsPerAttribute;

  geometry.attributes[attributeHighName] = new GeometryAttribute({
    componentDatatype: ComponentDatatype.FLOAT,
    componentsPerAttribute: componentsPerAttribute,
    values: highValues,
  });
  geometry.attributes[attributeLowName] = new GeometryAttribute({
    componentDatatype: ComponentDatatype.FLOAT,
    componentsPerAttribute: componentsPerAttribute,
    values: lowValues,
  });
  delete geometry.attributes[attributeName];

  return geometry;
}