import {
  ComponentDatatype,
  GeometryAttributeType,
  GeometryOffsetAttribute,
  GeometryType
} from '../../type'
import { CombineGeometryParameters } from '../../type/scene/primitivePipeline'
import BoundingSphere from '../Core/BoundingSphere'
import Defined from '../Core/Defined'
import Geometry from '../Core/Geometry'
import GeometryAttribute from '../Core/GeometryAttribute'
import GeometryInstance from '../Core/GeometryInstance'
import GeometryPipeline from '../Core/GeometryPipeline'
import Matrix4 from '../Core/Matrix4'

interface CombineGeometryResult {
  geometries: Geometry[]
  modelMatrix: Matrix4
  attributeLocations: { [key: string]: number } | undefined
  pickOffsets: PickOffsets[] | undefined
  offsetInstanceExtend: GeometryOffsetAttribute[]
  boundingSpheres: BoundingSphere[]
  boundingSpheresCV: BoundingSphere[]
}

export interface PickOffsets {
  index: number
  offset: number
  count: number
}

const transformToWorldCoordinates = (
  instances: GeometryInstance[],
  primitiveModelMatrix: Matrix4,
  scene3DOnly: boolean
) => {
  let toWorld = !scene3DOnly
  const length = instances.length
  let i

  if (!toWorld && length > 1) {
    const modelMatrix = instances[0].modelMatrix

    for (i = 1; i < length; ++i) {
      if (!Matrix4.equals(modelMatrix, instances[i].modelMatrix)) {
        toWorld = true
        break
      }
    }
  }

  if (toWorld) {
    for (i = 0; i < length; ++i) {
      if (Defined(instances[i].geometry)) {
        GeometryPipeline.transformToWorldCoordinates(instances[i])
      }
    }
  } else {
    // Leave geometry in local coordinate system; auto update model-matrix.

    // 如果 instance的modelMatrix都相等或部分相等,那么直接使用第一个instance的modelMatrix保持
    Matrix4.multiplyTransformation(
      primitiveModelMatrix,
      instances[0].modelMatrix,
      primitiveModelMatrix
    )
  }
}

const addGeometryBatchId = (geometry: Geometry, batchId: number) => {
  const attributes = geometry.attributes
  const positionAttr = attributes.position!
  const numberOfComponents =
    positionAttr.values.length / positionAttr.componentsPerAttribute

  attributes.batchId = new GeometryAttribute({
    componentDatatype: ComponentDatatype.FLOAT,
    componentsPerAttribute: 1,
    values: new Float32Array(numberOfComponents)
  })

  const batchIds = attributes.batchId.values
  for (let i = 0; i < numberOfComponents; ++i) {
    batchIds[i] = batchId
  }
}
const addBatchIds = (instances: GeometryInstance[]) => {
  const length = instances.length

  for (let i = 0; i < length; ++i) {
    const instance = instances[i]
    if (Defined(instance.geometry)) {
      addGeometryBatchId(instance.geometry, i)
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
  const instances = parameters.instances
  // const projection = parameters.projection;
  const uintIndexSupport = parameters.elementIndexUintSupported
  const scene3DOnly = parameters.scene3DOnly
  const vertexCacheOptimize = parameters.vertexCacheOptimize
  const compressVertices = parameters.compressVertices
  const modelMatrix = parameters.modelMatrix

  let i
  let geometry
  let primitiveType
  let length = instances.length

  for (i = 0; i < length; ++i) {
    if (Defined(instances[i].geometry)) {
      primitiveType = instances[i].geometry.primitiveType
      break
    }
  }
  // >>includeStart('debug', pragmas.debug);
  for (i = 1; i < length; ++i) {
    if (
      Defined(instances[i].geometry) &&
      instances[i].geometry.primitiveType !== primitiveType
    ) {
      throw new Error(
        'All instance geometries must have the same primitiveType.'
      )
    }
  }
  // >>includeEnd('debug');

  // Unify to world coordinates before combining.
  transformToWorldCoordinates(instances, modelMatrix, scene3DOnly)

  // Clip to IDL  International Date Line（国际日期变更线）
  // 目的: 对跨越 180° 经线的几何体进行切割，以确保在 Cesium 中的 3D 地球上正确渲染
  // if (!scene3DOnly) {
  //   for (i = 0; i < length; ++i) {
  //     if (Defined(instances[i].geometry)) {
  //       GeometryPipeline.splitLongitude(instances[i]);
  //     }
  //   }
  // }

  addBatchIds(instances)

  // Optimize for vertex shader caches
  if (vertexCacheOptimize) {
    for (i = 0; i < length; ++i) {
      const instance = instances[i]
      if (Defined(instance.geometry)) {
        // https://www.cse.ust.hk/~psander/docs/tipsy.pdf
        GeometryPipeline.reorderForPostVertexCache(instance.geometry)
        GeometryPipeline.reorderForPreVertexCache(instance.geometry)
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

  // Combine into single geometry for better rendering performance.
  let geometries = GeometryPipeline.combineInstances(instances)

  length = geometries.length
  for (i = 0; i < length; ++i) {
    geometry = geometries[i]

    // Split positions for GPU RTE
    const attributes = geometry.attributes

    if (scene3DOnly) {
      for (const name in attributes) {
        const attributeName = name as GeometryAttributeType
        if (
          attributes[attributeName] &&
          attributes[attributeName].componentDatatype ===
            ComponentDatatype.DOUBLE
        ) {
          GeometryPipeline.encodeAttribute(
            geometry,
            attributeName,
            `${name}3DHigh` as GeometryAttributeType,
            `${name}3DLow` as GeometryAttributeType
          )
        }
      }
    }

    // oct encode and pack normals, compress texture coordinates
    if (compressVertices) {
      GeometryPipeline.compressVertices(geometry)
    }
  }

  if (!uintIndexSupport) {
    // Break into multiple geometries to fit within unsigned short indices if needed
    let splitGeometries: Geometry[] = []
    length = geometries.length
    for (i = 0; i < length; ++i) {
      geometry = geometries[i]
      splitGeometries = splitGeometries.concat(
        GeometryPipeline.fitToUnsignedShortIndices(geometry)
      )
    }

    geometries = splitGeometries
  }

  return geometries
}
export default class PrimitivePipeline {
  static combineGeometry: (
    parameters: CombineGeometryParameters
  ) => CombineGeometryResult
}

const createPickOffsets = (
  instances: GeometryInstance[],
  geometryName: GeometryType,
  geometries: Geometry[],
  pickOffsets: PickOffsets[]
) => {
  let offset
  let indexCount
  let geometryIndex

  const offsetIndex = pickOffsets.length - 1
  if (offsetIndex >= 0) {
    const pickOffset = pickOffsets[offsetIndex]
    offset = pickOffset.offset + pickOffset.count
    geometryIndex = pickOffset.index
    indexCount = geometries[geometryIndex].indices.length
  } else {
    offset = 0
    geometryIndex = 0
    indexCount = geometries[geometryIndex].indices.length
  }

  const length = instances.length
  for (let i = 0; i < length; ++i) {
    const instance = instances[i]
    const geometry = instance[geometryName]
    if (!Defined(geometry)) {
      continue
    }

    const count = geometry.indices.length

    if (offset + count > indexCount) {
      offset = 0
      indexCount = geometries[++geometryIndex].indices.length
    }

    pickOffsets.push({
      index: geometryIndex,
      offset: offset,
      count: count
    })
    offset += count
  }
}

const createInstancePickOffsets = (
  instances: GeometryInstance[],
  geometries: Geometry[]
) => {
  const pickOffsets: PickOffsets[] = []
  createPickOffsets(instances, GeometryType.GEOMETRY, geometries, pickOffsets)
  createPickOffsets(
    instances,
    GeometryType.WEST_HEMISPHERE_GEOMETRY,
    geometries,
    pickOffsets
  )
  createPickOffsets(
    instances,
    GeometryType.EAST_HEMISPHERE_GEOMETRY,
    geometries,
    pickOffsets
  )
  return pickOffsets
}

PrimitivePipeline.combineGeometry = function (
  parameters: CombineGeometryParameters
) {
  let geometries: Geometry[]
  let attributeLocations
  const instances = parameters.instances
  const length = instances.length
  let pickOffsets

  let offsetInstanceExtend: GeometryOffsetAttribute[]
  let hasOffset = false

  if (length > 0) {
    geometries = geometryPipeline(parameters)
    if (geometries.length > 0) {
      attributeLocations = GeometryPipeline.createAttributeLocations(
        geometries[0]
      )
      if (parameters.createPickOffsets) {
        pickOffsets = createInstancePickOffsets(instances, geometries)
      }
    }
    if (
      Defined(instances[0].attributes) &&
      Defined(instances[0].attributes.offset)
    ) {
      offsetInstanceExtend = new Array(length)
      hasOffset = true
    }
  }

  const boundingSpheres = new Array(length)
  const boundingSpheresCV = new Array(length)

  for (let i = 0; i < length; ++i) {
    const instance = instances[i]
    const geometry = instance.geometry

    if (Defined(geometry)) {
      boundingSpheres[i] = geometry.boundingSphere
      boundingSpheresCV[i] = geometry.boundingSphereCV
      if (hasOffset) {
        offsetInstanceExtend![i] = instance.geometry.offsetAttribute!
      }
    }

    const eastHemisphereGeometry = instance.eastHemisphereGeometry
    const westHemisphereGeometry = instance.westHemisphereGeometry
    if (Defined(eastHemisphereGeometry) && Defined(westHemisphereGeometry)) {
      if (
        Defined(eastHemisphereGeometry.boundingSphere) &&
        Defined(westHemisphereGeometry.boundingSphere)
      ) {
        boundingSpheres[i] = BoundingSphere.union(
          eastHemisphereGeometry.boundingSphere,
          westHemisphereGeometry.boundingSphere
        )
      }
      if (
        Defined(eastHemisphereGeometry.boundingSphereCV) &&
        Defined(westHemisphereGeometry.boundingSphereCV)
      ) {
        boundingSpheresCV[i] = BoundingSphere.union(
          eastHemisphereGeometry.boundingSphereCV,
          westHemisphereGeometry.boundingSphereCV
        )
      }
    }
  }

  return {
    geometries: geometries!,
    modelMatrix: parameters.modelMatrix,
    attributeLocations: attributeLocations,
    pickOffsets: pickOffsets,
    offsetInstanceExtend: offsetInstanceExtend!,
    boundingSpheres: boundingSpheres,
    boundingSpheresCV: boundingSpheresCV
  }
}
