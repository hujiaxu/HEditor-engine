import { BatchTableAttribute, ComponentDatatype } from '../../type'
import PixelDatatype from '../Renderer/PixelDatatype'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import Cartesian4 from '../Core/Cartesian4'
import Defined from '../Core/Defined'
import PixelFormat from '../Renderer/PixelFormat'
import Context from '../Renderer/Context'
import ContextLimits from '../Renderer/ContextLimits'
import Sampler from '../Renderer/Sampler'
import Texture from '../Renderer/Texture'
import FrameState from './FrameState'

const setAttributeScratchValues = [
  undefined,
  undefined,
  new Cartesian2(),
  new Cartesian3(),
  new Cartesian4()
]

export default class BatchTable {
  private _numberOfInstances: number
  private _attributes: BatchTableAttribute[]
  private _batchValuesDirty!: boolean
  private _batchValues!: Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>
  private _texture: undefined | Texture
  private _offsets!: number[]
  private _stride!: number
  private _packFloats!: boolean
  private _pixelDatatype!: number
  private _textureStep!: Cartesian4
  private _textureDimensions!: Cartesian2

  get attributes() {
    return this._attributes
  }
  get textureStep() {
    return this._textureStep
  }

  constructor(
    context: Context,
    attributes: BatchTableAttribute[],
    numberOfInstances: number
  ) {
    if (!Defined(numberOfInstances)) {
      throw new Error('numberOfInstances is required.')
    }
    if (!Defined(attributes)) {
      throw new Error('attributes is required.')
    }

    this._numberOfInstances = numberOfInstances
    this._attributes = attributes

    if (attributes.length === 0) {
      return
    }

    const pixelDatatype = this._getDataType(attributes)
    const textureFloatsSupported = context.floatingPointTexture
    const packFloats =
      pixelDatatype === PixelDatatype.FLOAT && !textureFloatsSupported
    const offsets = this._createOffsets(attributes, packFloats)

    const stride = this._getStride(offsets, attributes, packFloats)

    const maxNumberOfInstancesPerRow = Math.floor(
      ContextLimits.maximumTextureSize / stride
    )

    const instancesPerWidth = Math.min(
      numberOfInstances,
      maxNumberOfInstancesPerRow
    )
    const width = stride * instancesPerWidth
    const height = Math.ceil(numberOfInstances / instancesPerWidth)

    const stepX = 1.0 / width
    const centerX = 0.5 * stepX
    const stepY = 1.0 / height
    const centerY = 0.5 * stepY

    this._textureDimensions = new Cartesian2(width, height)
    this._textureStep = new Cartesian4(stepX, centerX, stepY, centerY)
    this._pixelDatatype = !packFloats
      ? pixelDatatype
      : PixelDatatype.UNSIGNED_BYTE
    this._packFloats = packFloats
    this._stride = stride
    this._offsets = offsets

    this._texture = undefined

    const batchLength = 4 * width * height
    this._batchValues =
      pixelDatatype === PixelDatatype.FLOAT && !packFloats
        ? new Float32Array(batchLength)
        : new Uint8Array(batchLength)

    this._batchValuesDirty = false
  }

  private _getStride(
    offsets: number[],
    attributes: BatchTableAttribute[],
    packFloats: boolean
  ) {
    const length = offsets.length
    const lastOffset = offsets[length - 1]
    const lastAttribute = attributes[length - 1]
    const componentDatatype = lastAttribute.componentDatatype

    if (componentDatatype !== ComponentDatatype.UNSIGNED_BYTE && packFloats) {
      return lastOffset + 4
    }
    return lastOffset + 1
  }

  private _createOffsets(
    attributes: BatchTableAttribute[],
    packFloats: boolean
  ) {
    const offsets = new Array(attributes.length)

    let currentOffset = 0
    const attributesLength = attributes.length
    for (let i = 0; i < attributesLength; ++i) {
      const attribute = attributes[i]
      const componentDatatype = attribute.componentDatatype

      offsets[i] = currentOffset

      if (componentDatatype !== ComponentDatatype.UNSIGNED_BYTE && packFloats) {
        currentOffset += 4
      } else {
        ++currentOffset
      }
    }

    return offsets
  }

  private _getDataType(attributes: BatchTableAttribute[]) {
    let foundFloatDatatype = false
    const length = attributes.length
    for (let i = 0; i < length; ++i) {
      if (attributes[i].componentDatatype !== ComponentDatatype.UNSIGNED_BYTE) {
        foundFloatDatatype = true
        break
      }
    }
    return foundFloatDatatype
      ? PixelDatatype.FLOAT
      : PixelDatatype.UNSIGNED_BYTE
  }

  private _createTexture(context: Context) {
    const dimensions = this._textureDimensions
    this._texture = new Texture({
      context: context,
      pixelFormat: PixelFormat.RGBA,
      pixelDatatype: this._pixelDatatype,
      width: dimensions.x,
      height: dimensions.y,
      sampler: Sampler.NEAREST,
      flipY: false
    })
  }
  private _updateTexture() {}

  public update(frameState: FrameState) {
    if (
      (Defined(this._texture) && !this._batchValuesDirty) ||
      this._attributes.length === 0
    ) {
      return
    }

    this._batchValuesDirty = false

    if (!Defined(this._texture)) {
      this._createTexture(frameState.context)
    }

    this._updateTexture()
  }

  public setBatchedAttribute(
    instanceIndex: number,
    attributeIndex: number,
    value: number | Cartesian2 | Cartesian3 | Cartesian4
  ) {
    if (instanceIndex < 0 || instanceIndex >= this._numberOfInstances) {
      throw new Error('instanceIndex is out of range.')
    }
    if (attributeIndex < 0 || attributeIndex >= this._attributes.length) {
      throw new Error('attributeIndex is out of range.')
    }

    if (!Defined(value)) {
      throw new Error('value is required.')
    }

    const attributes = this._attributes
    const result = setAttributeScratchValues[
      attributes[attributeIndex].componentsPerAttribute
    ] as Cartesian4
    const currentAttribute = this.getBatchedAttribute(
      instanceIndex,
      attributeIndex,
      result
    )
    const attributeType = this._getAttributeType(
      this._attributes,
      attributeIndex
    )

    const entriesEqual =
      'equals' in attributeType
        ? attributeType.equals(
            currentAttribute as Cartesian4,
            value as Cartesian4
          )
        : currentAttribute === value
    if (entriesEqual) {
      return
    }

    const attributeValue = new Cartesian4()
    attributeValue.x = typeof value === 'number' ? value : value.x
    attributeValue.y = typeof value === 'number' ? value : value.y || 0.0
    attributeValue.z =
      typeof value === 'number' ? value : (value as Cartesian3).z || 0.0
    attributeValue.w =
      typeof value === 'number' ? value : (value as Cartesian4).w || 0.0

    const offset = this._offsets[attributeIndex]
    const stride = this._stride
    const index = 4 * stride * instanceIndex + 4 * offset

    if (
      this._packFloats &&
      attributes[attributeIndex].componentDatatype !==
        ComponentDatatype.UNSIGNED_BYTE
    ) {
      this._setPackedAttribute(attributeValue, this._batchValues, index)
    } else {
      Cartesian4.pack(attributeValue, this._batchValues, index)
    }

    this._batchValuesDirty = true
  }
  public getBatchedAttribute(
    instanceIndex: number,
    attributeIndex: number,
    result?: Cartesian4
  ) {
    if (instanceIndex < 0 || instanceIndex >= this._numberOfInstances) {
      throw new Error('instanceIndex is out of range.')
    }
    if (attributeIndex < 0 || attributeIndex >= this._attributes.length) {
      throw new Error('attributeIndex is out of range')
    }

    const attributes = this._attributes
    const offset = this._offsets[attributeIndex]
    const stride = this._stride

    const index = 4 * stride * instanceIndex + 4 * offset
    let value
    if (
      this._packFloats &&
      attributes[attributeIndex].componentDatatype !==
        ComponentDatatype.UNSIGNED_BYTE
    ) {
      value = this._getPackedFloat(this._batchValues.values().toArray(), index)
    } else {
      value = Cartesian4.unpack(this._batchValues.values().toArray(), index)
    }

    const attributeType = this._getAttributeType(attributes, attributeIndex)

    if (attributeType === Cartesian2 || attributeType === Cartesian3) {
      return attributeType.fromCartesian4(value, result)
    } else if (attributeType === Cartesian4) {
      return attributeType.clone(value, result)
    }

    return value.x
  }

  /**
   * Gets a function that will update a vertex shader to contain functions for looking up values in the batch table.
   *
   * @returns {BatchTable.updateVertexShaderSourceCallback} A callback for updating a vertex shader source.
   */
  public getVertexShaderCallback() {
    const attributes = this._attributes
    if (attributes.length === 0) {
      return function (source: string) {
        return source
      }
    }

    let batchTableShader = 'uniform highp sampler2D batchTexture; \n'
    batchTableShader += `${this._getGlslComputeSt(this)}\n`

    const length = attributes.length
    for (let i = 0; i < length; ++i) {
      batchTableShader += this._getGlslAttributeFunction(this, i)
    }

    return function (source: string) {
      const mainIndex = source.indexOf('void main')
      const beforeMain = source.substring(0, mainIndex)
      const afterMain = source.substring(mainIndex)
      return `${beforeMain}\n${batchTableShader}\n${afterMain}`
    }
  }

  private _getGlslAttributeFunction(
    batchTable: BatchTable,
    attributeIndex: number
  ) {
    const attributes = batchTable._attributes
    const attribute = attributes[attributeIndex]
    const componentsPerAttribute = attribute.componentsPerAttribute
    const functionName = attribute.functionName
    const functionReturnType = this._getComponentType(componentsPerAttribute)
    const functionReturnValue = this._getComponentSwizzle(
      componentsPerAttribute
    )

    const offset = batchTable._offsets[attributeIndex]
    let glslFunction =
      `${functionReturnType} ${functionName}(float batchId) \n` +
      `{ \n` +
      `    vec2 st = computeSt(batchId); \n` +
      `    st.x += batchTextureStep.x * float(${offset}); \n`

    if (
      batchTable._packFloats &&
      attribute.componentDatatype !== PixelDatatype.UNSIGNED_BYTE
    ) {
      glslFunction +=
        'vec4 textureValue; \n' +
        'textureValue.x = czm_unpackFloat(texture(batchTexture, st)); \n' +
        'textureValue.y = czm_unpackFloat(texture(batchTexture, st + vec2(batchTextureStep.x, 0.0))); \n' +
        'textureValue.z = czm_unpackFloat(texture(batchTexture, st + vec2(batchTextureStep.x * 2.0, 0.0))); \n' +
        'textureValue.w = czm_unpackFloat(texture(batchTexture, st + vec2(batchTextureStep.x * 3.0, 0.0))); \n'
    } else {
      glslFunction += '    vec4 textureValue = texture(batchTexture, st); \n'
    }

    glslFunction += `    ${functionReturnType} value = textureValue${functionReturnValue}; \n`

    if (
      batchTable._pixelDatatype === PixelDatatype.UNSIGNED_BYTE &&
      attribute.componentDatatype === ComponentDatatype.UNSIGNED_BYTE &&
      !attribute.normalize
    ) {
      glslFunction += 'value *= 255.0; \n'
    } else if (
      batchTable._pixelDatatype === PixelDatatype.FLOAT &&
      attribute.componentDatatype === ComponentDatatype.UNSIGNED_BYTE &&
      attribute.normalize
    ) {
      glslFunction += 'value /= 255.0; \n'
    }

    glslFunction += `    return value; \n` + `} \n`
    return glslFunction
  }

  private _getComponentType(componentsPerAttribute: number) {
    if (componentsPerAttribute === 1) {
      return 'float'
    }

    return `vec${componentsPerAttribute}`
  }

  private _getComponentSwizzle(componentsPerAttribute: number) {
    if (componentsPerAttribute === 1) {
      return '.x'
    } else if (componentsPerAttribute === 2) {
      return '.xy'
    } else if (componentsPerAttribute === 3) {
      return '.xyz'
    }

    return ''
  }

  private _getGlslComputeSt(batchTable: BatchTable) {
    const stride = batchTable._stride

    // GLSL batchId is zero-based: [0, numberOfInstances - 1]
    if (batchTable._textureDimensions.y === 1) {
      return (
        `${
          'uniform vec4 batchTextureStep; \n' +
          'vec2 computeSt(float batchId) \n' +
          '{ \n' +
          '    float stepX = batchTextureStep.x; \n' +
          '    float centerX = batchTextureStep.y; \n' +
          '    float numberOfAttributes = float('
        }${stride}); \n` +
        `    return vec2(centerX + (batchId * numberOfAttributes * stepX), 0.5); \n` +
        `} \n
        `
      )
    }

    return (
      `${
        'uniform vec4 batchTextureStep; \n' +
        'uniform vec2 batchTextureDimensions; \n' +
        'vec2 computeSt(float batchId) \n' +
        '{ \n' +
        '    float stepX = batchTextureStep.x; \n' +
        '    float centerX = batchTextureStep.y; \n' +
        '    float stepY = batchTextureStep.z; \n' +
        '    float centerY = batchTextureStep.w; \n' +
        '    float numberOfAttributes = float('
      }${stride}); \n` +
      `    float xId = mod(batchId * numberOfAttributes, batchTextureDimensions.x); \n` +
      `    float yId = floor(batchId * numberOfAttributes / batchTextureDimensions.x); \n` +
      `    return vec2(centerX + (xId * stepX), centerY + (yId * stepY)); \n` +
      `} \n`
    )
  }

  private _setPackedAttribute(
    value: Cartesian4,
    array: number[] | Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer>,
    index: number
  ) {
    let packed = Cartesian4.packFloat(value.x)
    Cartesian4.pack(packed, array, index)

    packed = Cartesian4.packFloat(value.y, packed)
    Cartesian4.pack(packed, array, index + 4)

    packed = Cartesian4.packFloat(value.z, packed)
    Cartesian4.pack(packed, array, index + 8)

    packed = Cartesian4.packFloat(value.w, packed)
    Cartesian4.pack(packed, array, index + 12)
  }

  private _getPackedFloat(array: number[], index: number) {
    let packed = Cartesian4.unpack(array, index)
    const x = Cartesian4.unpackFloat(packed)

    packed = Cartesian4.unpack(array, index + 4)
    const y = Cartesian4.unpackFloat(packed)

    packed = Cartesian4.unpack(array, index + 8)
    const z = Cartesian4.unpackFloat(packed)

    packed = Cartesian4.unpack(array, index + 12)
    const w = Cartesian4.unpackFloat(packed)

    return Cartesian4.fromElements(x, y, z, w)
  }
  private _getAttributeType(
    attributes: BatchTableAttribute[],
    attributeIndex: number
  ) {
    const componentsPerAttribute =
      attributes[attributeIndex].componentsPerAttribute
    if (componentsPerAttribute === 2) {
      return Cartesian2
    } else if (componentsPerAttribute === 3) {
      return Cartesian3
    } else if (componentsPerAttribute === 4) {
      return Cartesian4
    }
    return Number
  }
}
