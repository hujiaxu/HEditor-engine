import {
  ComponentDatatype,
  GeometryAttributeType,
  InstanceGeometryType,
  PrimitiveType
} from '../../type'
import AttributeCompression from './AttributeCompression'
import BoundingSphere from './BoundingSphere'
import Cartesian2 from './Cartesian2'
import Cartesian3 from './Cartesian3'
import Defined from './Defined'
import EncodedCartesian3 from './EncodedCartesian3'
import Geometry from './Geometry'
import GeometryAttribute from './GeometryAttribute'
import GeometryAttributes from './GeometryAttributes'
import GeometryInstance from './GeometryInstance'
import IndexDatatype from './IndexDatatype'
import HEditorMath from './Math'
import Matrix3 from './Matrix3'
import Matrix4 from './Matrix4'
import Tipsify from './Tipsify'

const scratchCartesian3 = new Cartesian3()
const transformPoint = (matrix: Matrix4, attribute: GeometryAttribute) => {
  if (Defined(attribute)) {
    const values = attribute.values
    const length = values.length
    for (let i = 0; i < length; i += 3) {
      Cartesian3.unpack(values, i, scratchCartesian3)
      Matrix4.multiplyByPoint(matrix, scratchCartesian3, scratchCartesian3)
      Cartesian3.pack(scratchCartesian3, [...values], i)
    }
  }
}
const transformVector = (matrix: Matrix3, attribute: GeometryAttribute) => {
  if (Defined(attribute)) {
    const values = attribute.values
    const length = values.length
    for (let i = 0; i < length; i += 3) {
      Cartesian3.unpack(values, i, scratchCartesian3)
      Matrix3.multiplyByVector(matrix, scratchCartesian3, scratchCartesian3)
      Cartesian3.normalize(scratchCartesian3, scratchCartesian3)
      Cartesian3.pack(scratchCartesian3, [...values], i)
    }
  }
}

export default class GeometryPipeline {
  static transformToWorldCoordinates: (instance: GeometryInstance) => void
  static reorderForPostVertexCache: (
    geometry: Geometry,
    cacheCapacity?: number
  ) => Geometry
  static reorderForPreVertexCache: (geometry: Geometry) => Geometry
  static combineInstances: (instances: GeometryInstance[]) => Geometry[]
  static encodeAttribute: (
    geometry: Geometry,
    attributeName: GeometryAttributeType,
    attributeHighName: GeometryAttributeType,
    attributeLowName: GeometryAttributeType
  ) => Geometry
  static createAttributeLocations: (geometry: Geometry) => {
    [key: string]: number
  }
  static compressVertices: (geometry: Geometry) => Geometry
  static fitToUnsignedShortIndices: (geometry: Geometry) => Geometry[]
}

const inverseTranspose = new Matrix4()
const normalMatrix = new Matrix3()
GeometryPipeline.transformToWorldCoordinates = (instance: GeometryInstance) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(instance)) {
    throw new Error('instance is required.')
  }
  // >>includeEnd('debug');

  const modelMatrix = instance.modelMatrix

  if (Matrix4.equals(modelMatrix, Matrix4.IDENTITY)) {
    // Already in world coordinates
    return instance
  }
  const attributes = instance.geometry.attributes

  // Transform attributes in known vertex formats
  transformPoint(modelMatrix, attributes.position!)
  // transformPoint(modelMatrix, attributes.prevPosition);
  // transformPoint(modelMatrix, attributes.nextPosition);

  if (
    Defined(attributes.normal) ||
    Defined(attributes.tangent) ||
    Defined(attributes.bitangent)
  ) {
    Matrix4.inverse(modelMatrix, inverseTranspose)
    Matrix4.transpose(inverseTranspose, inverseTranspose)
    Matrix4.getMatrix3(inverseTranspose, normalMatrix)

    transformVector(normalMatrix, attributes.normal!)
    transformVector(normalMatrix, attributes.tangent!)
    transformVector(normalMatrix, attributes.bitangent!)
  }

  const boundingSphere = instance.geometry.boundingSphere
  if (Defined(boundingSphere)) {
    instance.geometry.boundingSphere = BoundingSphere.transform(
      boundingSphere,
      modelMatrix,
      boundingSphere
    )
  }

  instance.modelMatrix = Matrix4.clone(Matrix4.IDENTITY)

  return instance
}

GeometryPipeline.reorderForPostVertexCache = (
  geometry: Geometry,
  cacheCapacity?: number
) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error('geometry is required.')
  }
  // >>includeEnd('debug');
  const indices = geometry.indices

  if (geometry.primitiveType === PrimitiveType.TRIANGLES && Defined(indices)) {
    const numIndices = indices.length
    let maximumIndex = 0
    for (let j = 0; j < numIndices; j++) {
      if (indices[j] > maximumIndex) {
        maximumIndex = indices[j]
      }
    }

    geometry.indices = Tipsify.tipsify({
      indices: indices,
      maximumIndex: maximumIndex,
      cacheSize: cacheCapacity
    })
  }

  return geometry
}
GeometryPipeline.reorderForPreVertexCache = (geometry: Geometry) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error('geometry is required.')
  }
  // >>includeEnd('debug');

  const numVertices = Geometry.computeNumberOfVertices(geometry)

  const indices = geometry.indices

  if (Defined(indices)) {
    const indexCrossReferenceOldToNew = new Int32Array(numVertices)
    for (let i = 0; i < numVertices; i++) {
      indexCrossReferenceOldToNew[i] = -1
    }

    // Construct cross reference and reorder indices
    const indicesIn = indices
    const numIndices = indicesIn.length
    const indicesOut = IndexDatatype.createTypedArray(numVertices, numIndices)

    let intoIndicesIn = 0
    let intoIndicesOut = 0
    let nextIndex = 0
    let tempIndex
    while (intoIndicesIn < numIndices) {
      tempIndex = indexCrossReferenceOldToNew[indicesIn[intoIndicesIn]]
      if (tempIndex !== -1) {
        indicesOut[intoIndicesOut] = tempIndex
      } else {
        tempIndex = indicesIn[intoIndicesIn]
        indexCrossReferenceOldToNew[tempIndex] = nextIndex

        indicesOut[intoIndicesOut] = nextIndex
        ++nextIndex
      }
      ++intoIndicesIn
      ++intoIndicesOut
    }
    geometry.indices = indicesOut

    // Reorder attributes
    const attributes = geometry.attributes
    for (const property in attributes) {
      if (
        Defined(attributes[property as GeometryAttributeType]) &&
        Defined(attributes[property as GeometryAttributeType]!.values)
      ) {
        const attribute = attributes[property as GeometryAttributeType]!
        const elementsIn = attribute.values
        let intoElementsIn = 0
        const numComponents = attribute.componentsPerAttribute
        const elementsOut = ComponentDatatype.createTypedArray(
          attribute.componentDatatype,
          new ArrayBuffer(nextIndex * numComponents)
        )
        while (intoElementsIn < numVertices) {
          const temp = indexCrossReferenceOldToNew[intoElementsIn]
          if (temp !== -1) {
            for (let j = 0; j < numComponents; j++) {
              elementsOut[numComponents * temp + j] =
                elementsIn[numComponents * intoElementsIn + j]
            }
          }
          ++intoElementsIn
        }
        attribute.values = elementsOut
      }
    }
  }
  return geometry
}

const findAttributesInAllGeometries = (
  instances: GeometryInstance[],
  propertyName: InstanceGeometryType
) => {
  const length = instances.length

  const attributesInAllGeometries: {
    [key in GeometryAttributeType]: GeometryAttribute | undefined
  } = {
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

  const attributes0 = instances[0][propertyName].attributes
  let name: GeometryAttributeType | string

  for (name in attributes0) {
    if (Defined(attributes0[name]) && Defined(attributes0[name]?.values)) {
      const attribute = attributes0[name]!
      let numberOfComponents = attribute.values.length
      let inAllGeometries = true

      // Does this same attribute exist in all geometries?
      for (let i = 1; i < length; ++i) {
        const otherAttribute = instances[i][propertyName].attributes[name]

        if (
          !Defined(otherAttribute) ||
          attribute.componentDatatype !== otherAttribute.componentDatatype ||
          attribute.componentsPerAttribute !==
            otherAttribute.componentsPerAttribute ||
          attribute.normalize !== otherAttribute.normalize
        ) {
          inAllGeometries = false
          break
        }

        numberOfComponents += otherAttribute.values.length
      }

      if (inAllGeometries) {
        attributesInAllGeometries[name as GeometryAttributeType] =
          new GeometryAttribute({
            componentDatatype: attribute.componentDatatype,
            componentsPerAttribute: attribute.componentsPerAttribute,
            normalize: attribute.normalize,
            values: ComponentDatatype.createTypedArray(
              attribute.componentDatatype,
              new ArrayBuffer(numberOfComponents)
            )
          })
      }
    }
  }
  return attributesInAllGeometries
}

const combineGeometries = (
  instances: GeometryInstance[],
  propertyName: InstanceGeometryType
) => {
  const length = instances.length

  let name
  let i
  let j
  let k

  const m = instances[0].modelMatrix
  const haveIndices = Defined(instances[0][propertyName].indices)
  const primitiveType = instances[0][propertyName].primitiveType

  // >>includeStart('debug', pragmas.debug);
  for (i = 1; i < length; ++i) {
    if (!Matrix4.equals(instances[i].modelMatrix, m)) {
      throw new Error('All instances must have the same modelMatrix.')
    }
    if (Defined(instances[i][propertyName].indices) !== haveIndices) {
      throw new Error(
        'All instance geometries must have an indices or not have one.'
      )
    }
    if (instances[i][propertyName].primitiveType !== primitiveType) {
      throw new Error(
        'All instance geometries must have the same primitiveType.'
      )
    }
  }
  // >>includeEnd('debug');

  // Find subset of attributes in all geometries
  const attributes = findAttributesInAllGeometries(instances, propertyName)
  let values
  let sourceValues
  let sourceValuesLength

  // Combine attributes from each geometry into a single typed array
  for (name in attributes) {
    // if (attributes.hasOwnProperty(name)) {
    const attributeName = name as GeometryAttributeType
    values = attributes[attributeName]!.values

    k = 0
    for (i = 0; i < length; ++i) {
      sourceValues =
        instances[i][propertyName].attributes[attributeName]!.values
      sourceValuesLength = sourceValues.length

      for (j = 0; j < sourceValuesLength; ++j) {
        values[k++] = sourceValues[j]
      }
    }
    // }
  }

  // Combine index lists
  let indices

  if (haveIndices) {
    let numberOfIndices = 0
    for (i = 0; i < length; ++i) {
      numberOfIndices += instances[i][propertyName].indices.length
    }

    const numberOfVertices = Geometry.computeNumberOfVertices(
      new Geometry({
        attributes: attributes,
        primitiveType: PrimitiveType.POINTS
      })
    )
    const destIndices = IndexDatatype.createTypedArray(
      numberOfVertices,
      numberOfIndices
    )

    let destOffset = 0
    let offset = 0

    for (i = 0; i < length; ++i) {
      const sourceIndices = instances[i][propertyName].indices
      const sourceIndicesLen = sourceIndices.length

      for (k = 0; k < sourceIndicesLen; ++k) {
        destIndices[destOffset++] = offset + sourceIndices[k]
      }

      offset += Geometry.computeNumberOfVertices(instances[i][propertyName])
    }

    indices = destIndices
  }

  // Create bounding sphere that includes all instances
  let center: Cartesian3 | undefined = new Cartesian3()
  let radius = 0.0
  let bs

  for (i = 0; i < length; ++i) {
    bs = instances[i][propertyName].boundingSphere
    if (!Defined(bs)) {
      // If any geometries have an undefined bounding sphere, then so does the combined geometry
      center = undefined
      break
    }

    Cartesian3.add(bs.center, center, center)
  }

  if (Defined(center)) {
    Cartesian3.divideByScalar(center, length, center)

    for (i = 0; i < length; ++i) {
      bs = instances[i][propertyName].boundingSphere
      const tempRadius =
        Cartesian3.magnitude(Cartesian3.subtract(bs.center, center)) + bs.radius

      if (tempRadius > radius) {
        radius = tempRadius
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
  })
}
GeometryPipeline.combineInstances = (instances: GeometryInstance[]) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(instances) || instances.length < 1) {
    throw new Error(
      'instances is required and must have length greater than zero.'
    )
  }
  // >>includeEnd('debug');

  const instanceGeometry = []
  // const instanceSplitGeometry = [];
  const length = instances.length
  for (let i = 0; i < length; ++i) {
    const instance = instances[i]

    if (Defined(instance.geometry)) {
      instanceGeometry.push(instance)
    }
    // else if (
    //   Defined(instance.westHemisphereGeometry) &&
    //   Defined(instance.eastHemisphereGeometry)
    // ) {
    //   instanceSplitGeometry.push(instance);
    // }
  }

  const geometries = []
  if (instanceGeometry.length > 0) {
    geometries.push(
      combineGeometries(instanceGeometry, InstanceGeometryType.GEOMETRY)
    )
  }

  // if (instanceSplitGeometry.length > 0) {
  //   geometries.push(
  //     combineGeometries(instanceSplitGeometry, "westHemisphereGeometry"),
  //   );
  //   geometries.push(
  //     combineGeometries(instanceSplitGeometry, "eastHemisphereGeometry"),
  //   );
  // }

  return geometries
}

GeometryPipeline.encodeAttribute = (
  geometry: Geometry,
  attributeName: GeometryAttributeType,
  attributeHighName: GeometryAttributeType,
  attributeLowName: GeometryAttributeType
) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error('geometry is required.')
  }
  if (!Defined(attributeName)) {
    throw new Error('attributeName is required.')
  }
  if (!Defined(attributeHighName)) {
    throw new Error('attributeHighName is required.')
  }
  if (!Defined(attributeLowName)) {
    throw new Error('attributeLowName is required.')
  }
  if (!Defined(geometry.attributes[attributeName])) {
    throw new Error(
      `geometry must have attribute matching the attributeName argument: ${attributeName}.`
    )
  }
  if (
    geometry.attributes[attributeName].componentDatatype !==
    ComponentDatatype.DOUBLE
  ) {
    throw new Error(
      'The attribute componentDatatype must be ComponentDatatype.DOUBLE.'
    )
  }
  // >>includeEnd('debug');

  const attribute = geometry.attributes[attributeName]
  const values = attribute.values
  const length = values.length
  const highValues = new Float32Array(length)
  const lowValues = new Float32Array(length)

  for (let i = 0; i < length; ++i) {
    const encodedResult = EncodedCartesian3.encode(values[i])
    highValues[i] = encodedResult.high
    lowValues[i] = encodedResult.low
  }

  const componentsPerAttribute = attribute.componentsPerAttribute

  geometry.attributes[attributeHighName] = new GeometryAttribute({
    componentDatatype: ComponentDatatype.FLOAT,
    componentsPerAttribute: componentsPerAttribute,
    values: highValues
  })
  geometry.attributes[attributeLowName] = new GeometryAttribute({
    componentDatatype: ComponentDatatype.FLOAT,
    componentsPerAttribute: componentsPerAttribute,
    values: lowValues
  })
  delete geometry.attributes[attributeName]

  return geometry
}

const scratchCartesian2 = new Cartesian2()
const toEncode1 = new Cartesian3()
const toEncode2 = new Cartesian3()
const toEncode3 = new Cartesian3()
let encodeResult2 = new Cartesian2()
GeometryPipeline.compressVertices = (geometry: Geometry) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error('geometry is required.')
  }
  // >>includeEnd('debug');

  const extrudeAttribute = geometry.attributes.extrudeDirection
  let i
  let numVertices

  if (Defined(extrudeAttribute)) {
    // only shadow volumes use extrudeDirection, and shadow volumes use vertexFormat: POSITION_ONLY so we don't need to check other attributes
    const extrudeDirections = extrudeAttribute.values
    numVertices = extrudeDirections.length / 3.0
    const compressedDirections = new Float32Array(numVertices * 2)

    let i2 = 0
    for (i = 0; i < numVertices; ++i) {
      Cartesian3.fromArray(extrudeDirections, i * 3.0, toEncode1)
      if (Cartesian3.equals(toEncode1, Cartesian3.ZERO)) {
        i2 += 2
        continue
      }
      encodeResult2 = AttributeCompression.octEncodeInRange(
        toEncode1,
        65535,
        encodeResult2
      )
      compressedDirections[i2++] = encodeResult2.x
      compressedDirections[i2++] = encodeResult2.y
    }

    geometry.attributes.compressedAttributes = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 2,
      values: compressedDirections
    })
    delete geometry.attributes.extrudeDirection
    return geometry
  }

  const normalAttribute = geometry.attributes.normal
  const stAttribute = geometry.attributes.st

  const hasNormal = Defined(normalAttribute)
  const hasSt = Defined(stAttribute)
  if (!hasNormal && !hasSt) {
    return geometry
  }

  const tangentAttribute = geometry.attributes.tangent
  const bitangentAttribute = geometry.attributes.bitangent

  const hasTangent = Defined(tangentAttribute)
  const hasBitangent = Defined(bitangentAttribute)

  let normals: ArrayLike<number> | undefined
  let st: ArrayLike<number> | undefined
  let tangents: ArrayLike<number> | undefined
  let bitangents: ArrayLike<number> | undefined

  if (hasNormal) {
    normals = normalAttribute.values
  }
  if (hasSt) {
    st = stAttribute.values
  }
  if (hasTangent) {
    tangents = tangentAttribute.values
  }
  if (hasBitangent) {
    bitangents = bitangentAttribute.values
  }

  const length = hasNormal ? normals?.length : st?.length
  const numComponents = hasNormal ? 3.0 : 2.0
  numVertices = length! / numComponents

  let compressedLength = numVertices
  let numCompressedComponents = hasSt && hasNormal ? 2.0 : 1.0
  numCompressedComponents += hasTangent || hasBitangent ? 1.0 : 0.0
  compressedLength *= numCompressedComponents

  const compressedAttributes = new Float32Array(compressedLength)

  let normalIndex = 0
  for (i = 0; i < numVertices; ++i) {
    if (hasSt) {
      Cartesian2.fromArray(st!, i * 2.0, scratchCartesian2)
      compressedAttributes[normalIndex++] =
        AttributeCompression.compressTextureCoordinates(scratchCartesian2)
    }

    const index = i * 3.0
    if (hasNormal && Defined(tangents) && Defined(bitangents)) {
      Cartesian3.fromArray(normals!, index, toEncode1)
      Cartesian3.fromArray(tangents, index, toEncode2)
      Cartesian3.fromArray(bitangents, index, toEncode3)

      AttributeCompression.octPack(
        toEncode1,
        toEncode2,
        toEncode3,
        scratchCartesian2
      )
      compressedAttributes[normalIndex++] = scratchCartesian2.x
      compressedAttributes[normalIndex++] = scratchCartesian2.y
    } else {
      if (hasNormal) {
        Cartesian3.fromArray(normals!, index, toEncode1)
        compressedAttributes[normalIndex++] =
          AttributeCompression.octEncodeFloat(toEncode1)
      }

      if (hasTangent) {
        Cartesian3.fromArray(tangents!, index, toEncode1)
        compressedAttributes[normalIndex++] =
          AttributeCompression.octEncodeFloat(toEncode1)
      }

      if (hasBitangent) {
        Cartesian3.fromArray(bitangents!, index, toEncode1)
        compressedAttributes[normalIndex++] =
          AttributeCompression.octEncodeFloat(toEncode1)
      }
    }
  }

  geometry.attributes.compressedAttributes = new GeometryAttribute({
    componentDatatype: ComponentDatatype.FLOAT,
    componentsPerAttribute: numCompressedComponents,
    values: compressedAttributes
  })

  if (hasNormal) {
    delete geometry.attributes.normal
  }
  if (hasSt) {
    delete geometry.attributes.st
  }
  if (hasBitangent) {
    delete geometry.attributes.bitangent
  }
  if (hasTangent) {
    delete geometry.attributes.tangent
  }

  return geometry
}

GeometryPipeline.createAttributeLocations = (geometry: Geometry) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error('geometry is required.')
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
  ]

  const attributes = geometry.attributes
  const indices: { [key: string]: number } = {}
  let j = 0
  let i
  const len = semantics.length

  // Attribute locations for well-known attributes
  for (i = 0; i < len; ++i) {
    const semantic = semantics[i]

    if (Defined(attributes[semantic])) {
      indices[semantic] = j++
    }
  }

  // Locations for custom attributes
  for (const name in attributes) {
    if (!Defined(indices[name])) {
      indices[name] = j++
    }
  }

  return indices
}

const copyAttributesDescriptions = (attributes: GeometryAttributes) => {
  const newAttributes: GeometryAttributes = {
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

  for (const attribute in attributes) {
    if (
      Defined(attributes[attribute as GeometryAttributeType]) &&
      Defined(attributes[attribute as GeometryAttributeType]!.values)
    ) {
      const attr = attributes[attribute as GeometryAttributeType]!

      newAttributes[attribute] = new GeometryAttribute({
        componentDatatype: attr.componentDatatype,
        componentsPerAttribute: attr.componentsPerAttribute,
        normalize: attr.normalize,
        values: new Float32Array(0)
      })
    }
  }

  return newAttributes
}

const copyVertex = (
  destinationAttributes: GeometryAttributes,
  sourceAttributes: GeometryAttributes,
  index: number
) => {
  for (const attribute in sourceAttributes) {
    if (
      Defined(sourceAttributes[attribute]) &&
      Defined(sourceAttributes[attribute].values)
    ) {
      const attr = sourceAttributes[attribute]

      for (let k = 0; k < attr.componentsPerAttribute; ++k) {
        destinationAttributes[attribute] &&
          (destinationAttributes[attribute].values[
            destinationAttributes[attribute].values.length
          ] = attr.values[index * attr.componentsPerAttribute + k])
      }
    }
  }
}

GeometryPipeline.fitToUnsignedShortIndices = (geometry: Geometry) => {
  // >>includeStart('debug', pragmas.debug);
  if (!Defined(geometry)) {
    throw new Error('geometry is required.')
  }
  if (
    Defined(geometry.indices) &&
    geometry.primitiveType !== PrimitiveType.TRIANGLES &&
    geometry.primitiveType !== PrimitiveType.LINES &&
    geometry.primitiveType !== PrimitiveType.POINTS
  ) {
    throw new Error(
      'geometry.primitiveType must equal to PrimitiveType.TRIANGLES, PrimitiveType.LINES, or PrimitiveType.POINTS.'
    )
  }
  // >>includeEnd('debug');

  const geometries = []

  // If there's an index list and more than 64K attributes, it is possible that
  // some indices are outside the range of unsigned short [0, 64K - 1]
  const numberOfVertices = Geometry.computeNumberOfVertices(geometry)
  if (
    Defined(geometry.indices) &&
    numberOfVertices >= HEditorMath.SIXTY_FOUR_KILOBYTES
  ) {
    let oldToNewIndex = []
    let newIndices = []
    let currentIndex = 0
    let newAttributes = copyAttributesDescriptions(geometry.attributes)

    const originalIndices = geometry.indices
    const numberOfIndices = originalIndices.length

    let indicesPerPrimitive = 0

    if (geometry.primitiveType === PrimitiveType.TRIANGLES) {
      indicesPerPrimitive = 3
    } else if (geometry.primitiveType === PrimitiveType.LINES) {
      indicesPerPrimitive = 2
    } else if (geometry.primitiveType === PrimitiveType.POINTS) {
      indicesPerPrimitive = 1
    }

    for (let j = 0; j < numberOfIndices; j += indicesPerPrimitive) {
      for (let k = 0; k < indicesPerPrimitive; ++k) {
        const x = originalIndices[j + k]
        let i: number = oldToNewIndex[x]
        if (!Defined(i)) {
          i = currentIndex++
          oldToNewIndex[x] = i
          copyVertex(newAttributes, geometry.attributes, x)
        }
        newIndices.push(i)
      }

      if (
        currentIndex + indicesPerPrimitive >=
        HEditorMath.SIXTY_FOUR_KILOBYTES
      ) {
        geometries.push(
          new Geometry({
            attributes: newAttributes,
            indices: IndexDatatype.createTypedArray(
              currentIndex + indicesPerPrimitive,
              newIndices
            ),
            primitiveType: geometry.primitiveType,
            boundingSphere: geometry.boundingSphere,
            boundingSphereCV: geometry.boundingSphereCV
          })
        )

        // Reset for next vertex-array
        oldToNewIndex = []
        newIndices = []
        currentIndex = 0
        newAttributes = copyAttributesDescriptions(geometry.attributes)
      }
    }
    if (newIndices.length !== 0) {
      geometries.push(
        new Geometry({
          attributes: newAttributes,
          indices: IndexDatatype.createTypedArray(
            newIndices.length,
            newIndices
          ),
          primitiveType: geometry.primitiveType,
          boundingSphere: geometry.boundingSphere,
          boundingSphereCV: geometry.boundingSphereCV
        })
      )
    }
  } else {
    // No need to split into multiple geometries
    geometries.push(geometry)
  }

  return geometries
}
