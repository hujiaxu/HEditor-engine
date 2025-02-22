import { ComponentDatatype, InstanceGeometryType, PrimitiveType } from '../../type';
import AttributeCompression from './AttributeCompression';
import BoundingSphere from './BoundingSphere';
import Cartesian2 from './Cartesian2';
import Cartesian3 from './Cartesian3';
import Defined from './Defined';
import EncodedCartesian3 from './EncodedCartesian3';
import Geometry from './Geometry';
import GeometryAttribute from './GeometryAttribute';
import IndexDatatype from './IndexDatatype';
import HEditorMath from './Math';
import Matrix3 from './Matrix3';
import Matrix4 from './Matrix4';
import Tipsify from './Tipsify';
const scratchCartesian3 = new Cartesian3();
const transformPoint = (matrix, attribute) => {
    if (Defined(attribute)) {
        const values = attribute.values;
        const length = values.length;
        for (let i = 0; i < length; i += 3) {
            Cartesian3.unpack(values, i, scratchCartesian3);
            Matrix4.multiplyByPoint(matrix, scratchCartesian3, scratchCartesian3);
            Cartesian3.pack(scratchCartesian3, [...values], i);
        }
    }
};
const transformVector = (matrix, attribute) => {
    if (Defined(attribute)) {
        const values = attribute.values;
        const length = values.length;
        for (let i = 0; i < length; i += 3) {
            Cartesian3.unpack(values, i, scratchCartesian3);
            Matrix3.multiplyByVector(matrix, scratchCartesian3, scratchCartesian3);
            Cartesian3.normalize(scratchCartesian3, scratchCartesian3);
            Cartesian3.pack(scratchCartesian3, [...values], i);
        }
    }
};
export default class GeometryPipeline {
    static transformToWorldCoordinates;
    static reorderForPostVertexCache;
    static reorderForPreVertexCache;
    static combineInstances;
    static encodeAttribute;
    static createAttributeLocations;
    static compressVertices;
    static fitToUnsignedShortIndices;
}
const inverseTranspose = new Matrix4();
const normalMatrix = new Matrix3();
GeometryPipeline.transformToWorldCoordinates = (instance) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(instance)) {
        throw new Error('instance is required.');
    }
    // >>includeEnd('debug');
    const modelMatrix = instance.modelMatrix;
    if (Matrix4.equals(modelMatrix, Matrix4.IDENTITY)) {
        // Already in world coordinates
        return instance;
    }
    const attributes = instance.geometry.attributes;
    // Transform attributes in known vertex formats
    transformPoint(modelMatrix, attributes.position);
    // transformPoint(modelMatrix, attributes.prevPosition);
    // transformPoint(modelMatrix, attributes.nextPosition);
    if (Defined(attributes.normal) ||
        Defined(attributes.tangent) ||
        Defined(attributes.bitangent)) {
        Matrix4.inverse(modelMatrix, inverseTranspose);
        Matrix4.transpose(inverseTranspose, inverseTranspose);
        Matrix4.getMatrix3(inverseTranspose, normalMatrix);
        transformVector(normalMatrix, attributes.normal);
        transformVector(normalMatrix, attributes.tangent);
        transformVector(normalMatrix, attributes.bitangent);
    }
    const boundingSphere = instance.geometry.boundingSphere;
    if (Defined(boundingSphere)) {
        instance.geometry.boundingSphere = BoundingSphere.transform(boundingSphere, modelMatrix, boundingSphere);
    }
    instance.modelMatrix = Matrix4.clone(Matrix4.IDENTITY);
    return instance;
};
GeometryPipeline.reorderForPostVertexCache = (geometry, cacheCapacity) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(geometry)) {
        throw new Error('geometry is required.');
    }
    // >>includeEnd('debug');
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
            cacheSize: cacheCapacity
        });
    }
    return geometry;
};
GeometryPipeline.reorderForPreVertexCache = (geometry) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(geometry)) {
        throw new Error('geometry is required.');
    }
    // >>includeEnd('debug');
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
            }
            else {
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
            if (Defined(attributes[property]) &&
                Defined(attributes[property].values)) {
                const attribute = attributes[property];
                const elementsIn = attribute.values;
                let intoElementsIn = 0;
                const numComponents = attribute.componentsPerAttribute;
                const elementsOut = ComponentDatatype.createTypedArray(attribute.componentDatatype, new ArrayBuffer(nextIndex * numComponents));
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
};
const findAttributesInAllGeometries = (instances, propertyName) => {
    const length = instances.length;
    const attributesInAllGeometries = {
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
    };
    const attributes0 = instances[0][propertyName].attributes;
    let name;
    for (name in attributes0) {
        if (Defined(attributes0[name]) && Defined(attributes0[name]?.values)) {
            const attribute = attributes0[name];
            let numberOfComponents = attribute.values.length;
            let inAllGeometries = true;
            // Does this same attribute exist in all geometries?
            for (let i = 1; i < length; ++i) {
                const otherAttribute = instances[i][propertyName].attributes[name];
                if (!Defined(otherAttribute) ||
                    attribute.componentDatatype !== otherAttribute.componentDatatype ||
                    attribute.componentsPerAttribute !==
                        otherAttribute.componentsPerAttribute ||
                    attribute.normalize !== otherAttribute.normalize) {
                    inAllGeometries = false;
                    break;
                }
                numberOfComponents += otherAttribute.values.length;
            }
            if (inAllGeometries) {
                attributesInAllGeometries[name] =
                    new GeometryAttribute({
                        componentDatatype: attribute.componentDatatype,
                        componentsPerAttribute: attribute.componentsPerAttribute,
                        normalize: attribute.normalize,
                        values: ComponentDatatype.createTypedArray(attribute.componentDatatype, new ArrayBuffer(numberOfComponents))
                    });
            }
        }
    }
    return attributesInAllGeometries;
};
const combineGeometries = (instances, propertyName) => {
    const length = instances.length;
    let name;
    let i;
    let j;
    let k;
    const m = instances[0].modelMatrix;
    const haveIndices = Defined(instances[0][propertyName].indices);
    const primitiveType = instances[0][propertyName].primitiveType;
    // >>includeStart('debug', pragmas.debug);
    for (i = 1; i < length; ++i) {
        if (!Matrix4.equals(instances[i].modelMatrix, m)) {
            throw new Error('All instances must have the same modelMatrix.');
        }
        if (Defined(instances[i][propertyName].indices) !== haveIndices) {
            throw new Error('All instance geometries must have an indices or not have one.');
        }
        if (instances[i][propertyName].primitiveType !== primitiveType) {
            throw new Error('All instance geometries must have the same primitiveType.');
        }
    }
    // >>includeEnd('debug');
    // Find subset of attributes in all geometries
    const attributes = findAttributesInAllGeometries(instances, propertyName);
    let values;
    let sourceValues;
    let sourceValuesLength;
    // Combine attributes from each geometry into a single typed array
    for (name in attributes) {
        // if (attributes.hasOwnProperty(name)) {
        const attributeName = name;
        values = attributes[attributeName].values;
        k = 0;
        for (i = 0; i < length; ++i) {
            sourceValues =
                instances[i][propertyName].attributes[attributeName].values;
            sourceValuesLength = sourceValues.length;
            for (j = 0; j < sourceValuesLength; ++j) {
                values[k++] = sourceValues[j];
            }
        }
        // }
    }
    // Combine index lists
    let indices;
    if (haveIndices) {
        let numberOfIndices = 0;
        for (i = 0; i < length; ++i) {
            numberOfIndices += instances[i][propertyName].indices.length;
        }
        const numberOfVertices = Geometry.computeNumberOfVertices(new Geometry({
            attributes: attributes,
            primitiveType: PrimitiveType.POINTS
        }));
        const destIndices = IndexDatatype.createTypedArray(numberOfVertices, numberOfIndices);
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
    let center = new Cartesian3();
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
            const tempRadius = Cartesian3.magnitude(Cartesian3.subtract(bs.center, center)) + bs.radius;
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
            : undefined
    });
};
GeometryPipeline.combineInstances = (instances) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(instances) || instances.length < 1) {
        throw new Error('instances is required and must have length greater than zero.');
    }
    // >>includeEnd('debug');
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
};
GeometryPipeline.encodeAttribute = (geometry, attributeName, attributeHighName, attributeLowName) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(geometry)) {
        throw new Error('geometry is required.');
    }
    if (!Defined(attributeName)) {
        throw new Error('attributeName is required.');
    }
    if (!Defined(attributeHighName)) {
        throw new Error('attributeHighName is required.');
    }
    if (!Defined(attributeLowName)) {
        throw new Error('attributeLowName is required.');
    }
    if (!Defined(geometry.attributes[attributeName])) {
        throw new Error(`geometry must have attribute matching the attributeName argument: ${attributeName}.`);
    }
    if (geometry.attributes[attributeName].componentDatatype !==
        ComponentDatatype.DOUBLE) {
        throw new Error('The attribute componentDatatype must be ComponentDatatype.DOUBLE.');
    }
    // >>includeEnd('debug');
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
        values: highValues
    });
    geometry.attributes[attributeLowName] = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: componentsPerAttribute,
        values: lowValues
    });
    delete geometry.attributes[attributeName];
    return geometry;
};
const scratchCartesian2 = new Cartesian2();
const toEncode1 = new Cartesian3();
const toEncode2 = new Cartesian3();
const toEncode3 = new Cartesian3();
let encodeResult2 = new Cartesian2();
GeometryPipeline.compressVertices = (geometry) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(geometry)) {
        throw new Error('geometry is required.');
    }
    // >>includeEnd('debug');
    const extrudeAttribute = geometry.attributes.extrudeDirection;
    let i;
    let numVertices;
    if (Defined(extrudeAttribute)) {
        // only shadow volumes use extrudeDirection, and shadow volumes use vertexFormat: POSITION_ONLY so we don't need to check other attributes
        const extrudeDirections = extrudeAttribute.values;
        numVertices = extrudeDirections.length / 3.0;
        const compressedDirections = new Float32Array(numVertices * 2);
        let i2 = 0;
        for (i = 0; i < numVertices; ++i) {
            Cartesian3.fromArray(extrudeDirections, i * 3.0, toEncode1);
            if (Cartesian3.equals(toEncode1, Cartesian3.ZERO)) {
                i2 += 2;
                continue;
            }
            encodeResult2 = AttributeCompression.octEncodeInRange(toEncode1, 65535, encodeResult2);
            compressedDirections[i2++] = encodeResult2.x;
            compressedDirections[i2++] = encodeResult2.y;
        }
        geometry.attributes.compressedAttributes = new GeometryAttribute({
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: compressedDirections
        });
        delete geometry.attributes.extrudeDirection;
        return geometry;
    }
    const normalAttribute = geometry.attributes.normal;
    const stAttribute = geometry.attributes.st;
    const hasNormal = Defined(normalAttribute);
    const hasSt = Defined(stAttribute);
    if (!hasNormal && !hasSt) {
        return geometry;
    }
    const tangentAttribute = geometry.attributes.tangent;
    const bitangentAttribute = geometry.attributes.bitangent;
    const hasTangent = Defined(tangentAttribute);
    const hasBitangent = Defined(bitangentAttribute);
    let normals;
    let st;
    let tangents;
    let bitangents;
    if (hasNormal) {
        normals = normalAttribute.values;
    }
    if (hasSt) {
        st = stAttribute.values;
    }
    if (hasTangent) {
        tangents = tangentAttribute.values;
    }
    if (hasBitangent) {
        bitangents = bitangentAttribute.values;
    }
    const length = hasNormal ? normals?.length : st?.length;
    const numComponents = hasNormal ? 3.0 : 2.0;
    numVertices = length / numComponents;
    let compressedLength = numVertices;
    let numCompressedComponents = hasSt && hasNormal ? 2.0 : 1.0;
    numCompressedComponents += hasTangent || hasBitangent ? 1.0 : 0.0;
    compressedLength *= numCompressedComponents;
    const compressedAttributes = new Float32Array(compressedLength);
    let normalIndex = 0;
    for (i = 0; i < numVertices; ++i) {
        if (hasSt) {
            Cartesian2.fromArray(st, i * 2.0, scratchCartesian2);
            compressedAttributes[normalIndex++] =
                AttributeCompression.compressTextureCoordinates(scratchCartesian2);
        }
        const index = i * 3.0;
        if (hasNormal && Defined(tangents) && Defined(bitangents)) {
            Cartesian3.fromArray(normals, index, toEncode1);
            Cartesian3.fromArray(tangents, index, toEncode2);
            Cartesian3.fromArray(bitangents, index, toEncode3);
            AttributeCompression.octPack(toEncode1, toEncode2, toEncode3, scratchCartesian2);
            compressedAttributes[normalIndex++] = scratchCartesian2.x;
            compressedAttributes[normalIndex++] = scratchCartesian2.y;
        }
        else {
            if (hasNormal) {
                Cartesian3.fromArray(normals, index, toEncode1);
                compressedAttributes[normalIndex++] =
                    AttributeCompression.octEncodeFloat(toEncode1);
            }
            if (hasTangent) {
                Cartesian3.fromArray(tangents, index, toEncode1);
                compressedAttributes[normalIndex++] =
                    AttributeCompression.octEncodeFloat(toEncode1);
            }
            if (hasBitangent) {
                Cartesian3.fromArray(bitangents, index, toEncode1);
                compressedAttributes[normalIndex++] =
                    AttributeCompression.octEncodeFloat(toEncode1);
            }
        }
    }
    geometry.attributes.compressedAttributes = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: numCompressedComponents,
        values: compressedAttributes
    });
    if (hasNormal) {
        delete geometry.attributes.normal;
    }
    if (hasSt) {
        delete geometry.attributes.st;
    }
    if (hasBitangent) {
        delete geometry.attributes.bitangent;
    }
    if (hasTangent) {
        delete geometry.attributes.tangent;
    }
    return geometry;
};
GeometryPipeline.createAttributeLocations = (geometry) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(geometry)) {
        throw new Error('geometry is required.');
    }
    // >>includeEnd('debug');
    // There can be a WebGL performance hit when attribute 0 is disabled, so
    // assign attribute locations to well-known attributes.
    const semantics = [
        'position',
        'positionHigh',
        'positionLow',
        // From VertexFormat.position - after 2D projection and high-precision encoding
        'position3DHigh',
        'position3DLow',
        'position2DHigh',
        'position2DLow',
        // From Primitive
        'pickColor',
        // From VertexFormat
        'normal',
        'st',
        'tangent',
        'bitangent',
        // For shadow volumes
        'extrudeDirection',
        // From compressing texture coordinates and normals
        'compressedAttributes'
    ];
    const attributes = geometry.attributes;
    const indices = {};
    let j = 0;
    let i;
    const len = semantics.length;
    // Attribute locations for well-known attributes
    for (i = 0; i < len; ++i) {
        const semantic = semantics[i];
        if (Defined(attributes[semantic])) {
            indices[semantic] = j++;
        }
    }
    // Locations for custom attributes
    for (const name in attributes) {
        if (!Defined(indices[name])) {
            indices[name] = j++;
        }
    }
    return indices;
};
const copyAttributesDescriptions = (attributes) => {
    const newAttributes = {
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
    };
    for (const attribute in attributes) {
        if (Defined(attributes[attribute]) &&
            Defined(attributes[attribute].values)) {
            const attr = attributes[attribute];
            newAttributes[attribute] = new GeometryAttribute({
                componentDatatype: attr.componentDatatype,
                componentsPerAttribute: attr.componentsPerAttribute,
                normalize: attr.normalize,
                values: new Float32Array(0)
            });
        }
    }
    return newAttributes;
};
const copyVertex = (destinationAttributes, sourceAttributes, index) => {
    for (const attribute in sourceAttributes) {
        if (Defined(sourceAttributes[attribute]) &&
            Defined(sourceAttributes[attribute].values)) {
            const attr = sourceAttributes[attribute];
            for (let k = 0; k < attr.componentsPerAttribute; ++k) {
                destinationAttributes[attribute] &&
                    (destinationAttributes[attribute].values[destinationAttributes[attribute].values.length] = attr.values[index * attr.componentsPerAttribute + k]);
            }
        }
    }
};
GeometryPipeline.fitToUnsignedShortIndices = (geometry) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(geometry)) {
        throw new Error('geometry is required.');
    }
    if (Defined(geometry.indices) &&
        geometry.primitiveType !== PrimitiveType.TRIANGLES &&
        geometry.primitiveType !== PrimitiveType.LINES &&
        geometry.primitiveType !== PrimitiveType.POINTS) {
        throw new Error('geometry.primitiveType must equal to PrimitiveType.TRIANGLES, PrimitiveType.LINES, or PrimitiveType.POINTS.');
    }
    // >>includeEnd('debug');
    const geometries = [];
    // If there's an index list and more than 64K attributes, it is possible that
    // some indices are outside the range of unsigned short [0, 64K - 1]
    const numberOfVertices = Geometry.computeNumberOfVertices(geometry);
    if (Defined(geometry.indices) &&
        numberOfVertices >= HEditorMath.SIXTY_FOUR_KILOBYTES) {
        let oldToNewIndex = [];
        let newIndices = [];
        let currentIndex = 0;
        let newAttributes = copyAttributesDescriptions(geometry.attributes);
        const originalIndices = geometry.indices;
        const numberOfIndices = originalIndices.length;
        let indicesPerPrimitive = 0;
        if (geometry.primitiveType === PrimitiveType.TRIANGLES) {
            indicesPerPrimitive = 3;
        }
        else if (geometry.primitiveType === PrimitiveType.LINES) {
            indicesPerPrimitive = 2;
        }
        else if (geometry.primitiveType === PrimitiveType.POINTS) {
            indicesPerPrimitive = 1;
        }
        for (let j = 0; j < numberOfIndices; j += indicesPerPrimitive) {
            for (let k = 0; k < indicesPerPrimitive; ++k) {
                const x = originalIndices[j + k];
                let i = oldToNewIndex[x];
                if (!Defined(i)) {
                    i = currentIndex++;
                    oldToNewIndex[x] = i;
                    copyVertex(newAttributes, geometry.attributes, x);
                }
                newIndices.push(i);
            }
            if (currentIndex + indicesPerPrimitive >=
                HEditorMath.SIXTY_FOUR_KILOBYTES) {
                geometries.push(new Geometry({
                    attributes: newAttributes,
                    indices: IndexDatatype.createTypedArray(currentIndex + indicesPerPrimitive, newIndices),
                    primitiveType: geometry.primitiveType,
                    boundingSphere: geometry.boundingSphere,
                    boundingSphereCV: geometry.boundingSphereCV
                }));
                // Reset for next vertex-array
                oldToNewIndex = [];
                newIndices = [];
                currentIndex = 0;
                newAttributes = copyAttributesDescriptions(geometry.attributes);
            }
        }
        if (newIndices.length !== 0) {
            geometries.push(new Geometry({
                attributes: newAttributes,
                indices: IndexDatatype.createTypedArray(newIndices.length, newIndices),
                primitiveType: geometry.primitiveType,
                boundingSphere: geometry.boundingSphere,
                boundingSphereCV: geometry.boundingSphereCV
            }));
        }
    }
    else {
        // No need to split into multiple geometries
        geometries.push(geometry);
    }
    return geometries;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnlQaXBlbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9HZW9tZXRyeVBpcGVsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxpQkFBaUIsRUFFakIsb0JBQW9CLEVBQ3BCLGFBQWEsRUFDZCxNQUFNLFlBQVksQ0FBQTtBQUNuQixPQUFPLG9CQUFvQixNQUFNLHdCQUF3QixDQUFBO0FBQ3pELE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUE7QUFDbkQsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUE7QUFHbkQsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUE7QUFDM0MsT0FBTyxXQUFXLE1BQU0sUUFBUSxDQUFBO0FBQ2hDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRS9CLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtBQUMxQyxNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWUsRUFBRSxTQUE0QixFQUFFLEVBQUU7SUFDdkUsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUN2QixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFBO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxD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