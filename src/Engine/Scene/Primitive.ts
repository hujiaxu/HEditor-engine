import {
  BufferUsage,
  ComponentDatatype,
  GeometryAttributeType,
  GeometryAttributeValuesType,
  GeometryOffsetAttribute,
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
import Geometry from '../Core/Geometry'
import GeometryAttributes from '../Core/GeometryAttributes'
import BoundingSphere from '../Core/BoundingSphere'
import GeometryAttribute from '../Core/GeometryAttribute'
import PrimitivePipeline, { PickOffsets } from './PrimitivePipeline'
import EncodedCartesian3 from '../Core/EncodedCartesian3'
import VertexArray from '../Renderer/VertexArray'
import { Intersect } from '../Core/IntersectionTests'
import Plane from '../Core/Plane'

interface BoundingSphereAttributeIndices {
  center3DHigh: number
  center3DLow: number
  center2DHigh: number
  center2DLow: number
  radius: number
}
interface AttributeIndices {
  [name: string]: number
}

export default class Primitive {
  public geometryInstances: GeometryInstance[] | GeometryInstance | undefined
  public readonly primitiveType: PrimitiveType
  private _asynchronous: boolean
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

  public _interleave: boolean
  public _releaseGeometryInstances: boolean
  public _allowPicking: boolean
  private _compressVertices: boolean
  public _translucent: undefined
  public _state: PrimitiveState
  private _createPickOffsets: boolean
  private _vertexCacheOptimize: boolean
  private _pickOffsets: PickOffsets[] | undefined
  private _modelMatrix!: Matrix4
  private _createBoundingVolumeFunction: undefined | ((frameState: FrameState, geometry: Geometry) => void)

  public get pickOffsets() {
    return this._pickOffsets
  }
  public get asynchronous() {
    return this._asynchronous
  }
  public get vertexCacheOptimize() {
    return this._vertexCacheOptimize
  }
  public get compressVertices() {
    return this._compressVertices
  }

  public get releaseGeometryInstances() {
    return this._releaseGeometryInstances
  }
  public set releaseGeometryInstances(releaseGeometryInstances: boolean) {
    this._releaseGeometryInstances = releaseGeometryInstances
  }

  public _geometries: Geometry[] | undefined
  public _error: undefined | string
  public _numberOfInstances: number
  public _boundingSpheres: BoundingSphere[]
  public _boundingSphereWC: BoundingSphere[]
  public _boundingSphereCV: BoundingSphere[]
  public _boundingSphere2D: BoundingSphere[]
  public _boundingSphereMorph: BoundingSphere[]
  public _perInstanceAttributeCache: Map<string, number>
  public _instanceIds: string[]
  public _lastPerInstanceAttributeIndex: number

  public _isDestroyed = false
  public _va: VertexArray[]
  public _attributeLocations: undefined | { [key: string]: number }
  public _primitiveType!: PrimitiveType
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
  public _batchTableAttributeIndices: AttributeIndices | undefined
  public _offsetInstanceExtend: undefined | GeometryOffsetAttribute[]
  public _batchTableOffsetAttribute2DIndex: undefined | number
  public _batchTableOffsetsUpdated: boolean
  public _instanceBoundingSpheres!: BoundingSphere[]
  public _instanceBoundingSpheresCV: undefined | BoundingSphere[]
  public _tempBoundingSpheres: undefined | BoundingSphere[]
  public _recomputeBoundingSpheres: boolean
  public _batchTableBoundingSpheresUpdated: boolean
  public _batchTableBoundingSphereAttributeIndices:
    | BoundingSphereAttributeIndices
    | undefined

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
    this._createBoundingVolumeFunction = options.createBoundingVolumeFunction

    this._va = []
    this._attributeLocations = undefined

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

    this._createPickOffsets = options._createPickOffsets || false

    this._batchTable = undefined
    this._batchTableAttributeIndices = undefined
    this._offsetInstanceExtend = undefined
    this._batchTableOffsetAttribute2DIndex = undefined
    this._batchTableOffsetsUpdated = false
    this._instanceBoundingSpheresCV = undefined
    this._tempBoundingSpheres = undefined
    this._recomputeBoundingSpheres = false
    this._batchTableBoundingSpheresUpdated = false
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

    if (
      this._state !== PrimitiveState.COMPLETE &&
      this._state !== PrimitiveState.COMBINED
    ) {
      if (this.asynchronous) {
        this._loadAsynchronous(frameState)
      } else {
        this._loadSynchronous(frameState)
      }
    }

    if (this._state === PrimitiveState.COMBINED) {
      this._updateBatchTableBoundingSpheres(this, frameState)
      this._updateBatchTableOffsets(this, frameState)
      this._createVertexArray(this, frameState)
    }

    if (!this.show || this._state !== PrimitiveState.COMPLETE) {
      return
    }

    if (!this._batchTableOffsetsUpdated) {
      this._updateBatchTableOffsets(this, frameState)
    }
    if (this._recomputeBoundingSpheres) {
      this.recomputeBoundingSpheres(this, frameState)
    }
  }

  private recomputeBoundingSpheres(
    primitive: Primitive,
    frameState: FrameState
  ) {
    const offsetIndex = primitive._batchTableAttributeIndices!.offset
    if (!primitive._recomputeBoundingSpheres || !Defined(offsetIndex)) {
      primitive._recomputeBoundingSpheres = false
      return
    }

    let i
    const offsetInstanceExtend = primitive._offsetInstanceExtend!
    const boundingSpheres = primitive._instanceBoundingSpheres
    const length = boundingSpheres.length
    let newBoundingSpheres = primitive._tempBoundingSpheres

    if (!Defined(newBoundingSpheres)) {
      newBoundingSpheres = new Array(length)
      for (i = 0; i < length; i++) {
        newBoundingSpheres[i] = new BoundingSphere()
      }
      primitive._tempBoundingSpheres = newBoundingSpheres
    }

    for (i = 0; i < length; ++i) {
      let newBS = newBoundingSpheres[i]
      const offset = primitive._batchTable!.getBatchedAttribute(
        i,
        offsetIndex
      ) as Cartesian3
      newBS = boundingSpheres[i].clone(newBS)
      this._transformBoundingSphere(newBS, offset, offsetInstanceExtend[i])
    }
    const combinedBS = []
    const combinedWestBS = []
    const combinedEastBS = []

    for (i = 0; i < length; ++i) {
      const bs = newBoundingSpheres[i]

      const minX = bs.center.x - bs.radius
      if (
        minX > 0 ||
        BoundingSphere.intersectPlane(bs, Plane.ORIGIN_ZX_PLANE) !==
          Intersect.INTERSECTING
      ) {
        combinedBS.push(bs)
      } else {
        combinedWestBS.push(bs)
        combinedEastBS.push(bs)
      }
    }

    let resultBS1 = combinedBS[0]
    let resultBS2 = combinedEastBS[0]
    let resultBS3 = combinedWestBS[0]

    for (i = 1; i < combinedBS.length; i++) {
      resultBS1 = BoundingSphere.union(resultBS1, combinedBS[i])
    }
    for (i = 1; i < combinedEastBS.length; i++) {
      resultBS2 = BoundingSphere.union(resultBS2, combinedEastBS[i])
    }
    for (i = 1; i < combinedWestBS.length; i++) {
      resultBS3 = BoundingSphere.union(resultBS3, combinedWestBS[i])
    }
    const result = []
    if (Defined(resultBS1)) {
      result.push(resultBS1)
    }
    if (Defined(resultBS2)) {
      result.push(resultBS2)
    }
    if (Defined(resultBS3)) {
      result.push(resultBS3)
    }
    for (i = 0; i < result.length; i++) {
      const boundingSphere = result[i].clone(primitive._boundingSpheres[i])
      primitive._boundingSpheres[i] = boundingSphere
      primitive._boundingSphereCV[i] = BoundingSphere.projectTo2D(
        boundingSphere,
        frameState.mapProjection!,
        primitive._boundingSphereCV[i]
      )
    }
    this._updateBoundingVolumes(
      primitive,
      frameState,
      primitive.modelMatrix,
      true
    )
    primitive._recomputeBoundingSpheres = false
  }

  private _updateBoundingVolumes(
    primitive: Primitive,
    frameState: FrameState,
    modelMatrix: Matrix4,
    forceUpdate?: boolean
  ) {
    let i
    let length
    let boundingSphere

    if (forceUpdate || !Matrix4.equals(modelMatrix, primitive._modelMatrix)) {
      Matrix4.clone(modelMatrix, primitive._modelMatrix)
      length = primitive._boundingSpheres.length

      for (i = 0; i < length; ++i) {
        boundingSphere = primitive._boundingSpheres[i]
        if (Defined(boundingSphere)) {
          primitive._boundingSphereWC[i] = BoundingSphere.transform(
            boundingSphere,
            modelMatrix,
            primitive._boundingSphereWC[i]
          )
          if (!frameState.scene3DOnly) {
            primitive._boundingSphere2D[i] = BoundingSphere.clone(
              primitive._boundingSphereCV[i],
              primitive._boundingSphere2D[i]
            )
            primitive._boundingSphere2D[i].center.x = 0.0
            primitive._boundingSphereMorph[i] = BoundingSphere.union(
              primitive._boundingSphereWC[i],
              primitive._boundingSphereCV[i]
            )
          }
        }
      }
    }

    // Update bounding volumes for primitives that are sized in pixels.
    // The pixel size in meters varies based on the distance from the camera.
    const pixelSize = primitive.appearance.pixelSize
    if (Defined(pixelSize)) {
      length = primitive._boundingSpheres.length
      for (i = 0; i < length; ++i) {
        boundingSphere = primitive._boundingSpheres[i]
        const boundingSphereWC = primitive._boundingSphereWC[i]
        const pixelSizeInMeters = frameState.camera!.getPixelSize(
          boundingSphere,
          frameState.context.drawingBufferWidth,
          frameState.context.drawingBufferHeight
        )
        const sizeInMeters = pixelSizeInMeters * pixelSize
        boundingSphereWC.radius = boundingSphere.radius + sizeInMeters
      }
    }
  }

  private _transformBoundingSphere(
    boundingSphere: BoundingSphere,
    offset: Cartesian3,
    offsetAttribute: GeometryOffsetAttribute
  ) {
    if (offsetAttribute === GeometryOffsetAttribute.TOP) {
      const origBS = BoundingSphere.clone(boundingSphere)
      const offsetBS = BoundingSphere.clone(boundingSphere)
      offsetBS.center = Cartesian3.add(offsetBS.center, offset, offsetBS.center)
      boundingSphere = BoundingSphere.union(origBS, offsetBS, boundingSphere)
    } else if (offsetAttribute === GeometryOffsetAttribute.ALL) {
      boundingSphere.center = Cartesian3.add(
        boundingSphere.center,
        offset,
        boundingSphere.center
      )
    }
    return boundingSphere
  }

  private _createVertexArray(primitive: Primitive, frameState: FrameState) {
    const attributeLocations = primitive._attributeLocations!
    const geometries = primitive._geometries as Geometry[]
    const scene3DOnly = frameState.scene3DOnly
    const context = frameState.context

    const va: VertexArray[] = []
    const length = geometries.length

    for (let i = 0; i < length; ++i) {
      const geometry = geometries[i]

      va.push(
        VertexArray.fromGeometry({
          context: context,
          geometry: geometry,
          attributeLocations: attributeLocations,
          bufferUsage: BufferUsage.STATIC_DRAW,
          interleave: primitive._interleave
        })
      )

      if (Defined(primitive._createBoundingVolumeFunction)) {
        primitive._createBoundingVolumeFunction(frameState, geometry)
      } else {
        primitive._boundingSpheres.push(
          BoundingSphere.clone(geometry.boundingSphere)
        )
        primitive._boundingSphereWC.push(new BoundingSphere())

        if (!scene3DOnly) {
          const center = geometry.boundingSphereCV!.center
          const x = center.x
          const y = center.y
          const z = center.z
          center.x = z
          center.y = x
          center.z = y

          primitive._boundingSphereCV.push(
            BoundingSphere.clone(geometry.boundingSphereCV!)
          )
          primitive._boundingSphere2D.push(new BoundingSphere())
          primitive._boundingSphereMorph.push(new BoundingSphere())
        }
      }
    }

    primitive._va = va
    primitive._primitiveType = geometries[0].primitiveType

    if (primitive.releaseGeometryInstances) {
      primitive.geometryInstances = undefined
    }
    primitive._geometries = undefined
    this._setReady(primitive, frameState, PrimitiveState.COMPLETE, undefined)
  }
  private _updateBatchTableOffsets(
    primitive: Primitive,
    frameState: FrameState
  ) {
    const hasOffset = Defined(primitive._batchTableAttributeIndices?.offset)
    if (
      !hasOffset ||
      primitive._batchTableOffsetsUpdated ||
      frameState.scene3DOnly
    ) {
      return
    }

    const index2D = primitive._batchTableOffsetAttribute2DIndex

    const projection = frameState.mapProjection!
    const ellipsoid = projection.ellipsoid

    const batchTable = primitive._batchTable!
    const boundingSpheres = primitive._instanceBoundingSpheres!
    const length = boundingSpheres.length

    for (let i = 0; i < length; ++i) {
      let boundingSphere = boundingSpheres[i]
      if (!Defined(boundingSphere)) {
        continue
      }
      const offset = batchTable.getBatchedAttribute(
        i,
        primitive._batchTableAttributeIndices!.offset
      ) as Cartesian3
      if (Cartesian3.equals(offset, Cartesian3.ZERO)) {
        batchTable.setBatchedAttribute(i, index2D!, Cartesian3.ZERO)
        continue
      }

      const modelMatrix = primitive.modelMatrix
      if (Defined(modelMatrix)) {
        boundingSphere = BoundingSphere.transform(boundingSphere, modelMatrix)
      }

      let center = boundingSphere.center
      center = ellipsoid.scaleToGeodeticSurface(center)!
      let cartographic = ellipsoid.cartesianToCartographic(center)
      const center2D = projection.project(cartographic)

      const newPoint = Cartesian3.add(offset, center)
      cartographic = ellipsoid.cartesianToCartographic(newPoint, cartographic)

      const newPointProjected = projection.project(cartographic)

      const newVector = Cartesian3.subtract(newPointProjected, center2D)

      const x = newVector.x
      newVector.x = newVector.z
      newVector.z = newVector.y
      newVector.y = x

      batchTable.setBatchedAttribute(i, index2D!, newVector)
    }
    primitive._batchTableOffsetsUpdated = true
  }
  private _updateBatchTableBoundingSpheres(
    primitive: Primitive,
    frameState: FrameState
  ) {
    const hasDistanceDisplayCondition = Defined(
      primitive._batchTableAttributeIndices?.distanceDisplayCondition
    )
    if (
      !hasDistanceDisplayCondition ||
      primitive._batchTableBoundingSpheresUpdated
    ) {
      return
    }

    const indices = primitive._batchTableBoundingSphereAttributeIndices!
    const center3DHighIndex = indices.center3DHigh
    const center3DLowIndex = indices.center3DLow
    const center2DHighIndex = indices.center2DHigh
    const center2DLowIndex = indices.center2DLow
    const radiusIndex = indices.radius

    const projection = frameState.mapProjection!
    const ellipsoid = projection.ellipsoid

    const batchTable = primitive._batchTable!
    const boundingSpheres = primitive._instanceBoundingSpheres!
    const length = boundingSpheres.length

    for (let i = 0; i < length; i++) {
      let boundingSphere = boundingSpheres[i]
      if (!Defined(boundingSphere)) {
        continue
      }
      const modelMatrix = primitive.modelMatrix
      if (Defined(modelMatrix)) {
        boundingSphere = BoundingSphere.transform(boundingSphere, modelMatrix)
      }

      const center = boundingSphere.center
      const radius = boundingSphere.radius

      let encodedCenter = EncodedCartesian3.fromCartesian(center)
      batchTable.setBatchedAttribute(i, center3DHighIndex, encodedCenter.high)
      batchTable.setBatchedAttribute(i, center3DLowIndex, encodedCenter.low)

      if (!frameState.scene3DOnly) {
        const cartographic = ellipsoid.cartesianToCartographic(center)
        const center2D = projection.project(cartographic)
        encodedCenter = EncodedCartesian3.fromCartesian(center2D)
        batchTable.setBatchedAttribute(i, center2DHighIndex, encodedCenter.high)
        batchTable.setBatchedAttribute(i, center2DLowIndex, encodedCenter.low)
      }
      batchTable.setBatchedAttribute(i, radiusIndex, radius)
    }
    primitive._batchTableBoundingSpheresUpdated = true
  }

  private _loadAsynchronous(frameState: FrameState) {}
  private _loadSynchronous(frameState: FrameState) {
    const instances = Array.isArray(this.geometryInstances)
      ? this.geometryInstances
      : ([this.geometryInstances] as GeometryInstance[])
    const length = (this._numberOfInstances = instances.length)
    const clonedInstances = new Array(length)
    const instanceIds = this._instanceIds

    let instance
    let i

    let geometryIndex = 0
    for (i = 0; i < length; i++) {
      instance = instances[i]
      const geometry = instance.geometry

      let createdGeometry
      if (Defined(geometry.attributes) && Defined(geometry.primitiveType)) {
        createdGeometry = this._cloneGeometry(geometry)
      }
      // else {
      // createdGeometry = geometry.constructor.createGeometry(geometry);
      // }

      clonedInstances[geometryIndex++] = this._cloneInstance(
        instance,
        createdGeometry!
      )
      instanceIds.push(instance.id)
    }

    clonedInstances.length = geometryIndex

    const scene3DOnly = frameState.scene3DOnly
    const projection = frameState.mapProjection

    const result = PrimitivePipeline.combineGeometry({
      instances: clonedInstances,
      ellipsoid: projection!.ellipsoid,
      projection: projection!,
      elementIndexUintSupported: frameState.context.elementIndexUint,
      scene3DOnly: scene3DOnly,
      vertexCacheOptimize: this.vertexCacheOptimize,
      compressVertices: this.compressVertices,
      modelMatrix: this.modelMatrix,
      createPickOffsets: this._createPickOffsets
    })
    this._geometries = result.geometries
    this._attributeLocations = result.attributeLocations
    this.modelMatrix = Matrix4.clone(result.modelMatrix, this.modelMatrix)
    this._pickOffsets = result.pickOffsets
    this._offsetInstanceExtend = result.offsetInstanceExtend
    this._instanceBoundingSpheres = result.boundingSpheres
    this._instanceBoundingSpheresCV = result.boundingSpheresCV

    if (Defined(this._geometries) && this._geometries.length > 0) {
      this._recomputeBoundingSpheres = true
      this._state = PrimitiveState.COMBINED
    } else {
      this._setReady(this, frameState, PrimitiveState.FAILED, undefined)
    }
  }

  private _setReady(
    primitive: Primitive,
    frameState: FrameState,
    state: PrimitiveState,
    error?: string
  ) {
    primitive._state = state
    primitive._error = error

    frameState.afterRender.push(function () {
      primitive._ready =
        primitive._state === PrimitiveState.COMPLETE ||
        primitive._state === PrimitiveState.FAILED
    })
  }

  private _cloneInstance(instance: GeometryInstance, geometry: Geometry) {
    return new GeometryInstance({
      geometry: geometry,
      id: instance.id,
      modelMatrix: Matrix4.clone(instance.modelMatrix),
      pickPrimitive: instance.pickPrimitive,
      attributes: instance.attributes
    })
  }

  private _cloneGeometry(geometry: Geometry) {
    const attributes = geometry.attributes
    const newAttributes = new GeometryAttributes()

    for (const property in attributes) {
      if (
        attributes.hasOwnProperty(property) &&
        Defined(attributes[property as GeometryAttributeType])
      ) {
        newAttributes[property as GeometryAttributeType] = this._cloneAttribute(
          attributes[property as GeometryAttributeType]!
        )
      }
    }

    let indices
    if (Defined(geometry.indices)) {
      const sourceValues = geometry.indices
      if (Array.isArray(sourceValues)) {
        indices = sourceValues.slice(0)
      }
      // else {
      //   indices = new sourceValues.constructor(sourceValues);
      // }
    }

    return new Geometry({
      attributes: newAttributes,
      indices: indices!,
      primitiveType: geometry.primitiveType,
      boundingSphere: BoundingSphere.clone(geometry.boundingSphere)
    })
  }

  private _cloneAttribute(attribute: GeometryAttribute) {
    let clonedValues
    // if (Array.isArray(attribute.values)) {
    clonedValues = attribute.values.slice(0)
    // } else {
    //   clonedValues = [attribute.values];
    // }
    return new GeometryAttribute({
      componentDatatype: attribute.componentDatatype,
      componentsPerAttribute: attribute.componentsPerAttribute,
      normalize: attribute.normalize,
      values: clonedValues
    })
  }

  private _createBatchTable(context: Context) {
    const geometryInstances = this.geometryInstances
    const instances = Array.isArray(geometryInstances)
      ? geometryInstances
      : ([geometryInstances] as GeometryInstance[])
    const numberOfInstances = instances.length
    if (numberOfInstances === 0) {
      return
    }

    const names = this._getCommonPerInstanceAttributeNames(instances)
    const length = names.length

    const attributes = []
    const attributeIndices: AttributeIndices = {}
    const boundingSphereAttributeIndices: BoundingSphereAttributeIndices = {
      center3DHigh: 0,
      center3DLow: 0,
      center2DHigh: 0,
      center2DLow: 0,
      radius: 0
    }
    let offset2DIndex

    const firstInstance = instances[0]
    let instanceAttributes = firstInstance.attributes!

    let i, name, attribute

    for (i = 0; i < length; ++i) {
      name = names[i]
      attribute = instanceAttributes[name]

      if (names.indexOf('distanceDisplayCondition') !== -1) {
        attributes.push(
          {
            functionName: 'czm_batchTable_boundingSphereCenter3DHigh',
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 3
          },
          {
            functionName: 'czm_batchTable_boundingSphereCenter3DLow',
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 3
          },
          {
            functionName: 'czm_batchTable_boundingSphereCenter2DHigh',
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 3
          },
          {
            functionName: 'czm_batchTable_boundingSphereCenter2DLow',
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 3
          },
          {
            functionName: 'czm_batchTable_boundingSphereRadius',
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 1
          }
        )
        boundingSphereAttributeIndices.center3DHigh = attributes.length - 5
        boundingSphereAttributeIndices.center3DLow = attributes.length - 4
        boundingSphereAttributeIndices.center2DHigh = attributes.length - 3
        boundingSphereAttributeIndices.center2DLow = attributes.length - 2
        boundingSphereAttributeIndices.radius = attributes.length - 1
      }

      attributeIndices[name] = i
      attributes.push({
        functionName: `czm_batchTable_${name}`,
        componentDatatype: attribute.componentDatatype,
        componentsPerAttribute: attribute.componentsPerAttribute,
        normalize: attribute.normalize
      })
    }

    if (names.indexOf('offset') !== -1) {
      attributes.push({
        functionName: 'czm_batchTable_offset2D',
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 3
      })
      offset2DIndex = attributes.length - 1
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
    this._batchTableAttributeIndices = attributeIndices
    this._batchTableBoundingSphereAttributeIndices =
      boundingSphereAttributeIndices
    this._batchTableOffsetAttribute2DIndex = offset2DIndex
    this._batchTable = batchTable
  }

  private _getAttributeValue(values: GeometryAttributeValuesType) {
    const componentsPerAttribute = values.length
    if (componentsPerAttribute === 1) {
      return values[0]
    } else if (componentsPerAttribute === 2) {
      return Cartesian2.unpack([...values], 0)
    } else if (componentsPerAttribute === 3) {
      return Cartesian3.unpack(values, 0)
    } else if (componentsPerAttribute === 4) {
      return Cartesian4.unpack([...values], 0)
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
