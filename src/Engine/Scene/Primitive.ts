import {
  ComponentDatatype,
  PrimitiveOptions,
  PrimitiveState,
  PrimitiveType,
  SceneMode
} from '../../type'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import Cartesian4 from '../Core/Cartesian4'
import Color from '../Core/Color'
import defaultValue from '../Core/DefaultValue'
import Defined from '../Core/Defined'
import Matrix4 from '../Core/Matrix4'
import PickId from '../Core/PickId'
import Context from '../Renderer/Context'
import Appearance from './Appearance'
import BatchTable from './BatchTable'
import FrameState from './FrameState'
import GeometryInstance from '../Core/GeometryInstance'
import Material from './Material'
import ContextLimits from '../Renderer/ContextLimits'

export default class Primitive {
  public readonly geometryInstances: GeometryInstance[] | GeometryInstance
  public readonly primitiveType: PrimitiveType
  public show: boolean
  public modelMatrix: Matrix4
  public cull: boolean
  public rtcCenter: Cartesian3 | undefined

  public readonly appearance: Appearance
  public readonly depthFailAppearance?: Appearance
  public _appearance: undefined | Appearance
  public _material: undefined | Material
  public _depthFailAppearance: undefined | Appearance
  public _depthFailMaterial: undefined | Material

  public _vertexCacheOptimize: boolean
  public _interleave: boolean
  public _releaseGeometryInstances: boolean
  public _allowPicking: boolean
  public _asynchronous: boolean
  public _compressVertices: boolean
  public _translucent: undefined
  public _state: PrimitiveState

  public _geometries: GeometryInstance[]
  public _error: undefined | string
  public _numberOfInstances: number
  public _boundingSpheres: Cartesian3[]
  public _boundingSphereWC: Cartesian3[]
  public _boundingSphereCV: Cartesian3[]
  public _boundingSphere2D: Cartesian3[]
  public _boundingSphereMorph: Cartesian3[]
  public _perInstanceAttributeCache: Map<string, number>
  public _instanceIds: string[]
  public _lastPerInstanceAttributeIndex: number

  public _isDestroyed = false
  public _va: never[]
  public _attributeLocations: undefined
  public _primitiveType: undefined
  public _frontFaceRS: undefined
  public _backFaceRS: undefined
  public _sp: undefined
  public _spDepthFail: undefined
  public _frontFaceDepthFailRS: undefined
  public _backFaceDepthFailRS: undefined
  private _pickIds: PickId[]
  public _colorCommands: never[]
  public _pickCommands: never[]
  public _ready: boolean
  private _batchTable: undefined | BatchTable
  public _batchTableAttributeIndices: undefined
  public _offsetInstanceExtend: undefined
  public _batchTableOffsetAttribute2DIndex: undefined
  public _batchTableOffsetsUpdated: boolean
  public _instanceBoundingSpheres: undefined
  public _instanceBoundingSpheresCV: undefined
  public _tempBoundingSpheres: undefined
  public _recomputeBoundingSpheres: boolean
  public _batchTableBoundingSphereUpdated: boolean
  public _batchTableBoundingSphereAttributeIndices: undefined

  constructor(options: PrimitiveOptions) {
    this.geometryInstances = options.GeometryInstances
    this.primitiveType = options.primitiveType

    this.appearance = options.appearance
    this._appearance = undefined
    this._material = undefined

    this.depthFailAppearance = options.depthFailAppearance
    this._depthFailAppearance = undefined
    this._depthFailMaterial = undefined

    this.show = defaultValue(options.show, true)
    this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY)

    this._vertexCacheOptimize = defaultValue(options.vertexCacheOptimize, true)
    this._interleave = defaultValue(options.interleave, false)
    this._releaseGeometryInstances = defaultValue(
      options.releaseGeometryInstances,
      true
    )
    this._allowPicking = defaultValue(options.allowPicking, true)
    this._asynchronous = defaultValue(options.asynchronous, true)
    this._compressVertices = defaultValue(options.compressVertices, true)

    this.cull = defaultValue(options.cull, true)

    this.rtcCenter = defaultValue(options.rtcCenter, undefined)

    this._translucent = undefined
    this._geometries = []
    this._error = undefined
    this._numberOfInstances = 0

    this._boundingSpheres = []
    this._boundingSphereWC = []
    this._boundingSphereCV = []
    this._boundingSphere2D = []
    this._boundingSphereMorph = []
    this._perInstanceAttributeCache = new Map()
    this._instanceIds = []
    this._lastPerInstanceAttributeIndex = 0

    this._va = []
    this._attributeLocations = undefined
    this._primitiveType = undefined

    this._frontFaceRS = undefined
    this._backFaceRS = undefined
    this._sp = undefined

    this._depthFailAppearance = undefined
    this._spDepthFail = undefined
    this._frontFaceDepthFailRS = undefined
    this._backFaceDepthFailRS = undefined

    this._pickIds = []

    this._colorCommands = []
    this._pickCommands = []

    this._state = PrimitiveState.READY

    this._ready = false

    this._batchTable = undefined
    this._batchTableAttributeIndices = undefined
    this._offsetInstanceExtend = undefined
    this._batchTableOffsetAttribute2DIndex = undefined
    this._batchTableOffsetsUpdated = false
    this._instanceBoundingSpheres = undefined
    this._instanceBoundingSpheresCV = undefined
    this._tempBoundingSpheres = undefined
    this._recomputeBoundingSpheres = false
    this._batchTableBoundingSphereUpdated = false
    this._batchTableBoundingSphereAttributeIndices = undefined
  }

  public update(frameState: FrameState) {
    if (
      (!Defined(this.geometryInstances) && this._va.length === 0) ||
      (Defined(this.geometryInstances) &&
        Array.isArray(this.geometryInstances) &&
        this.geometryInstances.length === 0) ||
      (frameState.mode !== SceneMode.SCENE3D && frameState.scene3DOnly) ||
      (!frameState.passes.render && !frameState.passes.pick)
    ) {
      return
    }

    if (Defined(this._error)) {
      throw this._error
    }

    if (this._state === PrimitiveState.FAILED) {
      return
    }

    const context = frameState.context
    if (!Defined(this._batchTable)) {
      this._createBatchTable(context)
    }

    if (this._batchTable && this._batchTable.attributes.length > 0) {
      if (ContextLimits.maximumVertexTextureImageUnits === 0) {
        throw new Error(
          'Vertex texture fetch support is required to render primitives with per-instance attributes. The maximum number of vertex texture image units must be greater than zero.'
        )
      }
      this._batchTable.update(frameState)
    }
  }

  private _createBatchTable(context: Context) {
    const geometryInstances = this.geometryInstances
    const instances = Array.isArray(geometryInstances)
      ? geometryInstances
      : [geometryInstances]
    const numberOfInstances = instances.length
    if (numberOfInstances === 0) {
      return
    }

    const names = this._getCommonPerInstanceAttributeNames(instances)
    const length = names.length

    const attributes = []
    const attributeIndices: { [name: string]: number } = {}
    const boundingSphereAttributeIndices = {}
    let offset2DIndex

    const firstInstance = instances[0]
    let instanceAttributes = firstInstance.attributes!

    let i, name, attribute

    for (i = 0; i < length; ++i) {
      name = names[i]
      attribute = instanceAttributes[name]

      attributeIndices[name] = i
      attributes.push({
        functionName: `czm_batchTable_${name}`,
        componentDatatype: attribute.componentDatatype,
        componentsPerAttribute: attribute.componentsPerAttribute,
        normalize: attribute.normalize
      })
    }

    attributes.push({
      functionName: 'czm_batchTable_pickColor',
      componentDatatype: ComponentDatatype.UNSIGNED_BYTE,
      componentsPerAttribute: 4,
      normalize: true
    })

    const attributesLength = attributes.length
    const batchTable = new BatchTable(context, attributes, numberOfInstances)

    for (i = 0; i < numberOfInstances; ++i) {
      const instance = instances[i]
      instanceAttributes = instance.attributes!

      for (let j = 0; j < length; ++j) {
        name = names[j]
        attribute = instanceAttributes[name]

        const value = this._getAttributeValue(attribute.values)!
        const attributeIndex = attributeIndices[name]
        batchTable.setBatchedAttribute(i, attributeIndex, value)
      }

      const pickObject = {
        primitive: defaultValue(instance.pickPrimitive, this),
        id: ''
      }

      if (Defined(instance.id)) {
        pickObject.id = instance.id
      }

      const pickId = context.createPickId(pickObject)
      this._pickIds.push(pickId)

      const pickColor = pickId.color
      const color = new Cartesian4()
      color.x = Color.floatToByte(pickColor.red)
      color.y = Color.floatToByte(pickColor.green)
      color.z = Color.floatToByte(pickColor.blue)
      color.w = Color.floatToByte(pickColor.alpha)
      batchTable.setBatchedAttribute(i, attributesLength - 1, color)
    }

    this._batchTable = batchTable
  }

  private _getAttributeValue(values: number[]) {
    const componentsPerAttribute = values.length
    if (componentsPerAttribute === 1) {
      return values[0]
    } else if (componentsPerAttribute === 2) {
      return Cartesian2.unpack(values, 0)
    } else if (componentsPerAttribute === 3) {
      return Cartesian3.unpack(values, 0)
    } else if (componentsPerAttribute === 4) {
      return Cartesian4.unpack(values, 0)
    }
  }
  private _getCommonPerInstanceAttributeNames(instances: GeometryInstance[]) {
    const length = instances.length

    const attributesInAllInstances = []
    const attribtues0 = instances[0].attributes!
    let name

    for (name in attribtues0) {
      if (attribtues0.hasOwnProperty(name) && Defined(attribtues0[name])) {
        const attribute = attribtues0[name]
        let inAllInstances = true

        for (let i = 1; i < length; ++i) {
          const otherAttribute = instances[i].attributes![name]

          if (
            !Defined(otherAttribute) ||
            attribute.componentDatatype !== otherAttribute.componentDatatype ||
            attribute.componentsPerAttribute !==
              otherAttribute.componentsPerAttribute ||
            attribute.normalize !== otherAttribute.normalize
          ) {
            inAllInstances = false
            break
          }
        }

        if (inAllInstances) {
          attributesInAllInstances.push(name)
        }
      }
    }

    return attributesInAllInstances
  }
}
