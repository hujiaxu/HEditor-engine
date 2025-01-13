import { ComponentDatatype } from "../../type";
import { CombineGeometryParameters } from "../../type/scene/primitivePipeline";
import Defined from "../Core/Defined";
import Geometry from "../Core/Geometry";
import GeometryAttribute from "../Core/GeometryAttribute";
import GeometryInstance from "../Core/GeometryInstance";
import GeometryPipeline from "../Core/GeometryPipeline";
import Matrix4 from "../Core/Matrix4";

const transformToWorldCoordinates = (instances: GeometryInstance[], primitiveModelMatrix: Matrix4, scene3DOnly: boolean) => {

  let toWorld = !scene3DOnly;
  const length = instances.length;
  let i;

  if (!toWorld && length > 1) {
    const modelMatrix = instances[0].modelMatrix;

    for (i = 1; i < length; ++i) {
      if (!Matrix4.equals(modelMatrix, instances[i].modelMatrix)) {
        toWorld = true;
        break;
      }
    }
  }


  if (toWorld) {
    for (i = 0; i < length; ++i) {
      if (Defined(instances[i].geometry)) {
        GeometryPipeline.transformToWorldCoordinates(instances[i]);
      }
    }
  } else {
    // Leave geometry in local coordinate system; auto update model-matrix.

    // 如果 instance的modelMatrix都相等或部分相等,那么直接使用第一个instance的modelMatrix保持
    Matrix4.multiplyTransformation(
      primitiveModelMatrix,
      instances[0].modelMatrix,
      primitiveModelMatrix,
    );
  }
}

const addGeometryBatchId = (geometry: Geometry, batchId: number) => {
  
  const attributes = geometry.attributes;
  const positionAttr = attributes.position!;
  const numberOfComponents =
    (positionAttr.values as number[]).length / positionAttr.componentsPerAttribute;

    attributes.batchId = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 1,
      values: new Float32Array(numberOfComponents),
    });

    const batchIds = attributes.batchId.values as number[];
    for (let i = 0; i < numberOfComponents; ++i) {
      batchIds[i] = batchId;
    }
}
const addBatchIds = (instances: GeometryInstance[]) => {

  const length = instances.length;

  for (let i = 0; i < length; ++i) {
    const instance = instances[i];
    if (Defined(instance.geometry)) {
      addGeometryBatchId(instance.geometry, i);
    } 
    // else if (
    //   defined(instance.westHemisphereGeometry) &&
    //   defined(instance.eastHemisphereGeometry)
    // ) {
    //   addGeometryBatchId(instance.westHemisphereGeometry, i);
    //   addGeometryBatchId(instance.eastHemisphereGeometry, i);
    // }
  }
}

const geometryPipeline = (parameters: CombineGeometryParameters) => {

  const instances = parameters.instances;
  const projection = parameters.projection;
  const uintIndexSupport = parameters.elementIndexUintSupported;
  const scene3DOnly = parameters.scene3DOnly;
  const vertexCacheOptimize = parameters.vertexCacheOptimize;
  const compressVertices = parameters.compressVertices;
  const modelMatrix = parameters.modelMatrix;

  let i;
  let geometry;
  let primitiveType;
  let length = instances.length;

  for (i = 0; i < length; ++i) {
    if (Defined(instances[i].geometry)) {
      primitiveType = instances[i].geometry.primitiveType;
      break;
    }
  }
  //>>includeStart('debug', pragmas.debug);
  for (i = 1; i < length; ++i) {
    if (
      Defined(instances[i].geometry) &&
      instances[i].geometry.primitiveType !== primitiveType
    ) {
      throw new Error(
        "All instance geometries must have the same primitiveType.",
      );
    }
  }
  //>>includeEnd('debug');


  // Unify to world coordinates before combining.
  transformToWorldCoordinates(instances, modelMatrix, scene3DOnly);


  // Clip to IDL  International Date Line（国际日期变更线）
  // 目的: 对跨越 180° 经线的几何体进行切割，以确保在 Cesium 中的 3D 地球上正确渲染
  // if (!scene3DOnly) {
  //   for (i = 0; i < length; ++i) {
  //     if (Defined(instances[i].geometry)) {
  //       GeometryPipeline.splitLongitude(instances[i]);
  //     }
  //   }
  // }


  addBatchIds(instances);


  // Optimize for vertex shader caches
  if (vertexCacheOptimize) {
    for (i = 0; i < length; ++i) {
      const instance = instances[i];
      if (Defined(instance.geometry)) {
        // https://www.cse.ust.hk/~psander/docs/tipsy.pdf
        GeometryPipeline.reorderForPostVertexCache(instance.geometry);
        GeometryPipeline.reorderForPreVertexCache(instance.geometry);
      } 
      // else if (
      //   Defined(instance.westHemisphereGeometry) &&
      //   Defined(instance.eastHemisphereGeometry)
      // ) {
      //   GeometryPipeline.reorderForPostVertexCache(
      //     instance.westHemisphereGeometry,
      //   );
      //   GeometryPipeline.reorderForPreVertexCache(
      //     instance.westHemisphereGeometry,
      //   );

      //   GeometryPipeline.reorderForPostVertexCache(
      //     instance.eastHemisphereGeometry,
      //   );
      //   GeometryPipeline.reorderForPreVertexCache(
      //     instance.eastHemisphereGeometry,
      //   );
      // }
    }
  }
};
export default class PrimitivePipeline {
  static combineGeometry: (parameters: CombineGeometryParameters) => void;
}

PrimitivePipeline.combineGeometry = function (
  parameters: CombineGeometryParameters
) {
  let geometries;
  let attributeLocations;
  const instances = parameters.instances;
  const length = instances.length;
  let pickOffsets;

  let offsetInstanceExtend;
  let hasOffset = false;

  if (length > 0) {

    geometries = geometryPipeline(parameters);
  }
}