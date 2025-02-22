import { ComponentDatatype, GeometryType } from '../../type';
import BoundingSphere from '../Core/BoundingSphere';
import Defined from '../Core/Defined';
import GeometryAttribute from '../Core/GeometryAttribute';
import GeometryPipeline from '../Core/GeometryPipeline';
import Matrix4 from '../Core/Matrix4';
const transformToWorldCoordinates = (instances, primitiveModelMatrix, scene3DOnly) => {
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
    }
    else {
        // Leave geometry in local coordinate system; auto update model-matrix.
        // 如果 instance的modelMatrix都相等或部分相等,那么直接使用第一个instance的modelMatrix保持
        Matrix4.multiplyTransformation(primitiveModelMatrix, instances[0].modelMatrix, primitiveModelMatrix);
    }
};
const addGeometryBatchId = (geometry, batchId) => {
    const attributes = geometry.attributes;
    const positionAttr = attributes.position;
    const numberOfComponents = positionAttr.values.length / positionAttr.componentsPerAttribute;
    attributes.batchId = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 1,
        values: new Float32Array(numberOfComponents)
    });
    const batchIds = attributes.batchId.values;
    for (let i = 0; i < numberOfComponents; ++i) {
        batchIds[i] = batchId;
    }
};
const addBatchIds = (instances) => {
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
};
const geometryPipeline = (parameters) => {
    const instances = parameters.instances;
    // const projection = parameters.projection;
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
    // >>includeStart('debug', pragmas.debug);
    for (i = 1; i < length; ++i) {
        if (Defined(instances[i].geometry) &&
            instances[i].geometry.primitiveType !== primitiveType) {
            throw new Error('All instance geometries must have the same primitiveType.');
        }
    }
    // >>includeEnd('debug');
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
    // Combine into single geometry for better rendering performance.
    let geometries = GeometryPipeline.combineInstances(instances);
    length = geometries.length;
    for (i = 0; i < length; ++i) {
        geometry = geometries[i];
        // Split positions for GPU RTE
        const attributes = geometry.attributes;
        if (scene3DOnly) {
            for (const name in attributes) {
                const attributeName = name;
                if (attributes[attributeName] &&
                    attributes[attributeName].componentDatatype ===
                        ComponentDatatype.DOUBLE) {
                    GeometryPipeline.encodeAttribute(geometry, attributeName, `${name}3DHigh`, `${name}3DLow`);
                }
            }
        }
        // oct encode and pack normals, compress texture coordinates
        if (compressVertices) {
            GeometryPipeline.compressVertices(geometry);
        }
    }
    if (!uintIndexSupport) {
        // Break into multiple geometries to fit within unsigned short indices if needed
        let splitGeometries = [];
        length = geometries.length;
        for (i = 0; i < length; ++i) {
            geometry = geometries[i];
            splitGeometries = splitGeometries.concat(GeometryPipeline.fitToUnsignedShortIndices(geometry));
        }
        geometries = splitGeometries;
    }
    return geometries;
};
export default class PrimitivePipeline {
    static combineGeometry;
}
const createPickOffsets = (instances, geometryName, geometries, pickOffsets) => {
    let offset;
    let indexCount;
    let geometryIndex;
    const offsetIndex = pickOffsets.length - 1;
    if (offsetIndex >= 0) {
        const pickOffset = pickOffsets[offsetIndex];
        offset = pickOffset.offset + pickOffset.count;
        geometryIndex = pickOffset.index;
        indexCount = geometries[geometryIndex].indices.length;
    }
    else {
        offset = 0;
        geometryIndex = 0;
        indexCount = geometries[geometryIndex].indices.length;
    }
    const length = instances.length;
    for (let i = 0; i < length; ++i) {
        const instance = instances[i];
        const geometry = instance[geometryName];
        if (!Defined(geometry)) {
            continue;
        }
        const count = geometry.indices.length;
        if (offset + count > indexCount) {
            offset = 0;
            indexCount = geometries[++geometryIndex].indices.length;
        }
        pickOffsets.push({
            index: geometryIndex,
            offset: offset,
            count: count
        });
        offset += count;
    }
};
const createInstancePickOffsets = (instances, geometries) => {
    const pickOffsets = [];
    createPickOffsets(instances, GeometryType.GEOMETRY, geometries, pickOffsets);
    createPickOffsets(instances, GeometryType.WEST_HEMISPHERE_GEOMETRY, geometries, pickOffsets);
    createPickOffsets(instances, GeometryType.EAST_HEMISPHERE_GEOMETRY, geometries, pickOffsets);
    return pickOffsets;
};
PrimitivePipeline.combineGeometry = function (parameters) {
    let geometries;
    let attributeLocations;
    const instances = parameters.instances;
    const length = instances.length;
    let pickOffsets;
    let offsetInstanceExtend;
    let hasOffset = false;
    if (length > 0) {
        geometries = geometryPipeline(parameters);
        if (geometries.length > 0) {
            attributeLocations = GeometryPipeline.createAttributeLocations(geometries[0]);
            if (parameters.createPickOffsets) {
                pickOffsets = createInstancePickOffsets(instances, geometries);
            }
        }
        if (Defined(instances[0].attributes) &&
            Defined(instances[0].attributes.offset)) {
            offsetInstanceExtend = new Array(length);
            hasOffset = true;
        }
    }
    const boundingSpheres = new Array(length);
    const boundingSpheresCV = new Array(length);
    for (let i = 0; i < length; ++i) {
        const instance = instances[i];
        const geometry = instance.geometry;
        if (Defined(geometry)) {
            boundingSpheres[i] = geometry.boundingSphere;
            boundingSpheresCV[i] = geometry.boundingSphereCV;
            if (hasOffset) {
                offsetInstanceExtend[i] = instance.geometry.offsetAttribute;
            }
        }
        const eastHemisphereGeometry = instance.eastHemisphereGeometry;
        const westHemisphereGeometry = instance.westHemisphereGeometry;
        if (Defined(eastHemisphereGeometry) && Defined(westHemisphereGeometry)) {
            if (Defined(eastHemisphereGeometry.boundingSphere) &&
                Defined(westHemisphereGeometry.boundingSphere)) {
                boundingSpheres[i] = BoundingSphere.union(eastHemisphereGeometry.boundingSphere, westHemisphereGeometry.boundingSphere);
            }
            if (Defined(eastHemisphereGeometry.boundingSphereCV) &&
                Defined(westHemisphereGeometry.boundingSphereCV)) {
                boundingSpheresCV[i] = BoundingSphere.union(eastHemisphereGeometry.boundingSphereCV, westHemisphereGeometry.boundingSphereCV);
            }
        }
    }
    return {
        geometries: geometries,
        modelMatrix: parameters.modelMatrix,
        attributeLocations: attributeLocations,
        pickOffsets: pickOffsets,
        offsetInstanceExtend: offsetInstanceExtend,
        boundingSpheres: boundingSpheres,
        boundingSpheresCV: boundingSpheresCV
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpbWl0aXZlUGlwZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1ByaW1pdGl2ZVBpcGVsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxpQkFBaUIsRUFHakIsWUFBWSxFQUNiLE1BQU0sWUFBWSxDQUFBO0FBRW5CLE9BQU8sY0FBYyxNQUFNLHdCQUF3QixDQUFBO0FBQ25ELE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBRXJDLE9BQU8saUJBQWlCLE1BQU0sMkJBQTJCLENBQUE7QUFFekQsT0FBTyxnQkFBZ0IsTUFBTSwwQkFBMEIsQ0FBQTtBQUN2RCxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQWtCckMsTUFBTSwyQkFBMkIsR0FBRyxDQUNsQyxTQUE2QixFQUM3QixvQkFBNkIsRUFDN0IsV0FBb0IsRUFDcEIsRUFBRTtJQUNGLElBQUksT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFBO0lBQzFCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUE7SUFDL0IsSUFBSSxDQUFDLENBQUE7SUFFTCxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMzQixNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFBO1FBRTVDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUMzRCxPQUFPLEdBQUcsSUFBSSxDQUFBO2dCQUNkLE1BQUs7WUFDUCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ1os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