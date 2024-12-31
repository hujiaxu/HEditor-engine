import { PrimitiveState, SceneMode } from '../../type';
import defaultValue from '../Core/DefaultValue';
import Defined from '../Core/Defined';
import Matrix4 from '../Core/Matrix4';
export default class Primitive {
    geometryInstances;
    primitiveType;
    show;
    modelMatrix;
    cull;
    rtcCenter;
    appearance;
    depthFailAppearance;
    _appearance;
    _material;
    _depthFailAppearance;
    _depthFailMaterial;
    _vertexCacheOptimize;
    _interleave;
    _releaseGeometryInstances;
    _allowPicking;
    _asynchronous;
    _compressVertices;
    _translucent;
    _state;
    _geometries;
    _error;
    _numberOfInstances;
    _boundingSpheres;
    _boundingSphereWC;
    _boundingSphereCV;
    _boundingSphere2D;
    _boundingSphereMorph;
    _perInstanceAttributeCache;
    _instanceIds;
    _lastPerInstanceAttributeIndex;
    _isDestroyed = false;
    _va;
    _attributeLocations;
    _primitiveType;
    _frontFaceRS;
    _backFaceRS;
    _sp;
    _spDepthFail;
    _frontFaceDepthFailRS;
    _backFaceDepthFailRS;
    _pickIds;
    _colorCommands;
    _pickCommands;
    _ready;
    _batchTable;
    _batchTableAttributeIndices;
    _offsetInstanceExtend;
    _batchTableOffsetAttribute2DIndex;
    _batchTableOffsetsUpdated;
    _instanceBoundingSpheres;
    _instanceBoundingSpheresCV;
    _tempBoundingSpheres;
    _recomputeBoundingSpheres;
    _batchTableBoundingSphereUpdated;
    _batchTableBoundingSphereAttributeIndices;
    constructor(options) {
        this.geometryInstances = options.GeometryInstances;
        this.primitiveType = options.primitiveType;
        this.appearance = options.appearance;
        this._appearance = undefined;
        this._material = undefined;
        this.depthFailAppearance = options.depthFailAppearance;
        this._depthFailAppearance = undefined;
        this._depthFailMaterial = undefined;
        this.show = defaultValue(options.show, true);
        this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY);
        this._vertexCacheOptimize = defaultValue(options.vertexCacheOptimize, true);
        this._interleave = defaultValue(options.interleave, false);
        this._releaseGeometryInstances = defaultValue(options.releaseGeometryInstances, true);
        this._allowPicking = defaultValue(options.allowPicking, true);
        this._asynchronous = defaultValue(options.asynchronous, true);
        this._compressVertices = defaultValue(options.compressVertices, true);
        this.cull = defaultValue(options.cull, true);
        this.rtcCenter = defaultValue(options.rtcCenter, undefined);
        this._translucent = undefined;
        this._geometries = [];
        this._error = undefined;
        this._numberOfInstances = 0;
        this._boundingSpheres = [];
        this._boundingSphereWC = [];
        this._boundingSphereCV = [];
        this._boundingSphere2D = [];
        this._boundingSphereMorph = [];
        this._perInstanceAttributeCache = new Map();
        this._instanceIds = [];
        this._lastPerInstanceAttributeIndex = 0;
        this._va = [];
        this._attributeLocations = undefined;
        this._primitiveType = undefined;
        this._frontFaceRS = undefined;
        this._backFaceRS = undefined;
        this._sp = undefined;
        this._depthFailAppearance = undefined;
        this._spDepthFail = undefined;
        this._frontFaceDepthFailRS = undefined;
        this._backFaceDepthFailRS = undefined;
        this._pickIds = [];
        this._colorCommands = [];
        this._pickCommands = [];
        this._state = PrimitiveState.READY;
        this._ready = false;
        this._batchTable = undefined;
        this._batchTableAttributeIndices = undefined;
        this._offsetInstanceExtend = undefined;
        this._batchTableOffsetAttribute2DIndex = undefined;
        this._batchTableOffsetsUpdated = false;
        this._instanceBoundingSpheres = undefined;
        this._instanceBoundingSpheresCV = undefined;
        this._tempBoundingSpheres = undefined;
        this._recomputeBoundingSpheres = false;
        this._batchTableBoundingSphereUpdated = false;
        this._batchTableBoundingSphereAttributeIndices = undefined;
    }
    update(frameState) {
        if ((!Defined(this.geometryInstances) && this._va.length === 0) ||
            (Defined(this.geometryInstances) &&
                Array.isArray(this.geometryInstances) &&
                this.geometryInstances.length === 0) ||
            (frameState.mode !== SceneMode.SCENE3D && frameState.scene3DOnly) ||
            (!frameState.passes.render && !frameState.passes.pick)) {
            return;
        }
        if (Defined(this._error)) {
            throw this._error;
        }
        if (this._state === PrimitiveState.FAILED) {
            return;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9QcmltaXRpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLGNBQWMsRUFFZCxTQUFTLEVBQ1YsTUFBTSxZQUFZLENBQUE7QUFFbkIsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFDckMsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFNckMsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBQ1osaUJBQWlCLENBQXVDO0lBQ3hELGFBQWEsQ0FBZTtJQUNyQyxJQUFJLENBQVM7SUFDYixXQUFXLENBQVM7SUFDcEIsSUFBSSxDQUFTO0lBQ2IsU0FBUyxDQUF3QjtJQUV4QixVQUFVLENBQVk7SUFDdEIsbUJBQW1CLENBQWE7SUFDekMsV0FBVyxDQUF3QjtJQUNuQyxTQUFTLENBQXNCO0lBQy9CLG9CQUFvQixDQUF3QjtJQUM1QyxrQkFBa0IsQ0FBc0I7SUFFeEMsb0JBQW9CLENBQVM7SUFDN0IsV0FBVyxDQUFTO0lBQ3BCLHlCQUF5QixDQUFTO0lBQ2xDLGFBQWEsQ0FBUztJQUN0QixhQUFhLENBQVM7SUFDdEIsaUJBQWlCLENBQVM7SUFDMUIsWUFBWSxDQUFXO0lBQ3ZCLE1BQU0sQ0FBZ0I7SUFFdEIsV0FBVyxDQUFvQjtJQUMvQixNQUFNLENBQW9CO0lBQzFCLGtCQUFrQixDQUFRO0lBQzFCLGdCQUFnQixDQUFjO0lBQzlCLGlCQUFpQixDQUFjO0lBQy9CLGlCQUFpQixDQUFjO0lBQy9CLGlCQUFpQixDQUFjO0lBQy9CLG9CQUFvQixDQUFjO0lBQ2xDLDBCQUEwQixDQUFxQjtJQUMvQyxZQUFZLENBQVU7SUFDdEIsOEJBQThCLENBQVE7SUFFdEMsWUFBWSxHQUFHLEtBQUssQ0FBQTtJQUNwQixHQUFHLENBQVM7SUFDWixtQkFBbUIsQ0FBVztJ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