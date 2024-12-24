import { PrimitiveOptions, PrimitiveState, PrimitiveType } from '../../type'
import Cartesian3 from '../Core/Cartesian3'
import defaultValue from '../Core/DefaultValue'
import Matrix4 from '../Core/Matrix4'
import Appearance from './Appearance'
import GeometryInstance from './GeometryInstance'
import Material from './Material'

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
  public _pickIds: never[]
  public _colorCommands: never[]
  public _pickCommands: never[]
  public _ready: boolean
  public _batchTable: undefined
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
}
