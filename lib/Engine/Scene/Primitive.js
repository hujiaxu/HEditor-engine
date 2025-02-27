import { BufferUsage, ComponentDatatype, GeometryOffsetAttribute, PrimitiveState, SceneMode } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import Cartesian4 from '../Core/Cartesian4';
import Color from '../Core/Color';
import defaultValue from '../Core/DefaultValue';
import Defined from '../Core/Defined';
import Matrix4 from '../Core/Matrix4';
import BatchTable from './BatchTable';
import GeometryInstance from '../Core/GeometryInstance';
import ContextLimits from '../Renderer/ContextLimits';
import Geometry from '../Core/Geometry';
import GeometryAttributes from '../Core/GeometryAttributes';
import BoundingSphere from '../Core/BoundingSphere';
import GeometryAttribute from '../Core/GeometryAttribute';
import PrimitivePipeline from './PrimitivePipeline';
import EncodedCartesian3 from '../Core/EncodedCartesian3';
import VertexArray from '../Renderer/VertexArray';
import { Intersect } from '../Core/IntersectionTests';
import Plane from '../Core/Plane';
export default class Primitive {
    geometryInstances;
    primitiveType;
    _asynchronous;
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
    _interleave;
    _releaseGeometryInstances;
    _allowPicking;
    _compressVertices;
    _translucent;
    _state;
    _createPickOffsets;
    _vertexCacheOptimize;
    _pickOffsets;
    _modelMatrix;
    _createBoundingVolumeFunction;
    get pickOffsets() {
        return this._pickOffsets;
    }
    get asynchronous() {
        return this._asynchronous;
    }
    get vertexCacheOptimize() {
        return this._vertexCacheOptimize;
    }
    get compressVertices() {
        return this._compressVertices;
    }
    get releaseGeometryInstances() {
        return this._releaseGeometryInstances;
    }
    set releaseGeometryInstances(releaseGeometryInstances) {
        this._releaseGeometryInstances = releaseGeometryInstances;
    }
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
    _batchTableBoundingSpheresUpdated;
    _batchTableBoundingSphereAttributeIndices;
    constructor(options) {
        this.geometryInstances = options.geometryInstances;
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
        this._createBoundingVolumeFunction = options.createBoundingVolumeFunction;
        this._va = [];
        this._attributeLocations = undefined;
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
        this._createPickOffsets = options._createPickOffsets || false;
        this._batchTable = undefined;
        this._batchTableAttributeIndices = undefined;
        this._offsetInstanceExtend = undefined;
        this._batchTableOffsetAttribute2DIndex = undefined;
        this._batchTableOffsetsUpdated = false;
        this._instanceBoundingSpheresCV = undefined;
        this._tempBoundingSpheres = undefined;
        this._recomputeBoundingSpheres = false;
        this._batchTableBoundingSpheresUpdated = false;
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
        const context = frameState.context;
        if (!Defined(this._batchTable)) {
            this._createBatchTable(context);
        }
        if (this._batchTable && this._batchTable.attributes.length > 0) {
            if (ContextLimits.maximumVertexTextureImageUnits === 0) {
                throw new Error('Vertex texture fetch support is required to render primitives with per-instance attributes. The maximum number of vertex texture image units must be greater than zero.');
            }
            this._batchTable.update(frameState);
        }
        if (this._state !== PrimitiveState.COMPLETE &&
            this._state !== PrimitiveState.COMBINED) {
            if (this.asynchronous) {
                this._loadAsynchronous(frameState);
            }
            else {
                this._loadSynchronous(frameState);
            }
        }
        if (this._state === PrimitiveState.COMBINED) {
            this._updateBatchTableBoundingSpheres(this, frameState);
            this._updateBatchTableOffsets(this, frameState);
            this._createVertexArray(this, frameState);
        }
        if (!this.show || this._state !== PrimitiveState.COMPLETE) {
            return;
        }
        if (!this._batchTableOffsetsUpdated) {
            this._updateBatchTableOffsets(this, frameState);
        }
        if (this._recomputeBoundingSpheres) {
            this.recomputeBoundingSpheres(this, frameState);
        }
    }
    recomputeBoundingSpheres(primitive, frameState) {
        const offsetIndex = primitive._batchTableAttributeIndices.offset;
        if (!primitive._recomputeBoundingSpheres || !Defined(offsetIndex)) {
            primitive._recomputeBoundingSpheres = false;
            return;
        }
        let i;
        const offsetInstanceExtend = primitive._offsetInstanceExtend;
        const boundingSpheres = primitive._instanceBoundingSpheres;
        const length = boundingSpheres.length;
        let newBoundingSpheres = primitive._tempBoundingSpheres;
        if (!Defined(newBoundingSpheres)) {
            newBoundingSpheres = new Array(length);
            for (i = 0; i < length; i++) {
                newBoundingSpheres[i] = new BoundingSphere();
            }
            primitive._tempBoundingSpheres = newBoundingSpheres;
        }
        for (i = 0; i < length; ++i) {
            let newBS = newBoundingSpheres[i];
            const offset = primitive._batchTable.getBatchedAttribute(i, offsetIndex);
            newBS = boundingSpheres[i].clone(newBS);
            this._transformBoundingSphere(newBS, offset, offsetInstanceExtend[i]);
        }
        const combinedBS = [];
        const combinedWestBS = [];
        const combinedEastBS = [];
        for (i = 0; i < length; ++i) {
            const bs = newBoundingSpheres[i];
            const minX = bs.center.x - bs.radius;
            if (minX > 0 ||
                BoundingSphere.intersectPlane(bs, Plane.ORIGIN_ZX_PLANE) !==
                    Intersect.INTERSECTING) {
                combinedBS.push(bs);
            }
            else {
                combinedWestBS.push(bs);
                combinedEastBS.push(bs);
            }
        }
        let resultBS1 = combinedBS[0];
        let resultBS2 = combinedEastBS[0];
        let resultBS3 = combinedWestBS[0];
        for (i = 1; i < combinedBS.length; i++) {
            resultBS1 = BoundingSphere.union(resultBS1, combinedBS[i]);
        }
        for (i = 1; i < combinedEastBS.length; i++) {
            resultBS2 = BoundingSphere.union(resultBS2, combinedEastBS[i]);
        }
        for (i = 1; i < combinedWestBS.length; i++) {
            resultBS3 = BoundingSphere.union(resultBS3, combinedWestBS[i]);
        }
        const result = [];
        if (Defined(resultBS1)) {
            result.push(resultBS1);
        }
        if (Defined(resultBS2)) {
            result.push(resultBS2);
        }
        if (Defined(resultBS3)) {
            result.push(resultBS3);
        }
        for (i = 0; i < result.length; i++) {
            const boundingSphere = result[i].clone(primitive._boundingSpheres[i]);
            primitive._boundingSpheres[i] = boundingSphere;
            primitive._boundingSphereCV[i] = BoundingSphere.projectTo2D(boundingSphere, frameState.mapProjection, primitive._boundingSphereCV[i]);
        }
        this._updateBoundingVolumes(primitive, frameState, primitive.modelMatrix, true);
        primitive._recomputeBoundingSpheres = false;
    }
    _updateBoundingVolumes(primitive, frameState, modelMatrix, forceUpdate) {
        let i;
        let length;
        let boundingSphere;
        if (forceUpdate || !Matrix4.equals(modelMatrix, primitive._modelMatrix)) {
            Matrix4.clone(modelMatrix, primitive._modelMatrix);
            length = primitive._boundingSpheres.length;
            for (i = 0; i < length; ++i) {
                boundingSphere = primitive._boundingSpheres[i];
                if (Defined(boundingSphere)) {
                    primitive._boundingSphereWC[i] = BoundingSphere.transform(boundingSphere, modelMatrix, primitive._boundingSphereWC[i]);
                    if (!frameState.scene3DOnly) {
                        primitive._boundingSphere2D[i] = BoundingSphere.clone(primitive._boundingSphereCV[i], primitive._boundingSphere2D[i]);
                        primitive._boundingSphere2D[i].center.x = 0.0;
                        primitive._boundingSphereMorph[i] = BoundingSphere.union(primitive._boundingSphereWC[i], primitive._boundingSphereCV[i]);
                    }
                }
            }
        }
        // Update bounding volumes for primitives that are sized in pixels.
        // The pixel size in meters varies based on the distance from the camera.
        const pixelSize = primitive.appearance.pixelSize;
        if (Defined(pixelSize)) {
            length = primitive._boundingSpheres.length;
            for (i = 0; i < length; ++i) {
                boundingSphere = primitive._boundingSpheres[i];
                const boundingSphereWC = primitive._boundingSphereWC[i];
                const pixelSizeInMeters = frameState.camera.getPixelSize(boundingSphere, frameState.context.drawingBufferWidth, frameState.context.drawingBufferHeight);
                const sizeInMeters = pixelSizeInMeters * pixelSize;
                boundingSphereWC.radius = boundingSphere.radius + sizeInMeters;
            }
        }
    }
    _transformBoundingSphere(boundingSphere, offset, offsetAttribute) {
        if (offsetAttribute === GeometryOffsetAttribute.TOP) {
            const origBS = BoundingSphere.clone(boundingSphere);
            const offsetBS = BoundingSphere.clone(boundingSphere);
            offsetBS.center = Cartesian3.add(offsetBS.center, offset, offsetBS.center);
            boundingSphere = BoundingSphere.union(origBS, offsetBS, boundingSphere);
        }
        else if (offsetAttribute === GeometryOffsetAttribute.ALL) {
            boundingSphere.center = Cartesian3.add(boundingSphere.center, offset, boundingSphere.center);
        }
        return boundingSphere;
    }
    _createVertexArray(primitive, frameState) {
        const attributeLocations = primitive._attributeLocations;
        const geometries = primitive._geometries;
        const scene3DOnly = frameState.scene3DOnly;
        const context = frameState.context;
        const va = [];
        const length = geometries.length;
        for (let i = 0; i < length; ++i) {
            const geometry = geometries[i];
            va.push(VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                bufferUsage: BufferUsage.STATIC_DRAW,
                interleave: primitive._interleave
            }));
            if (Defined(primitive._createBoundingVolumeFunction)) {
                primitive._createBoundingVolumeFunction(frameState, geometry);
            }
            else {
                primitive._boundingSpheres.push(BoundingSphere.clone(geometry.boundingSphere));
                primitive._boundingSphereWC.push(new BoundingSphere());
                if (!scene3DOnly) {
                    const center = geometry.boundingSphereCV.center;
                    const x = center.x;
                    const y = center.y;
                    const z = center.z;
                    center.x = z;
                    center.y = x;
                    center.z = y;
                    primitive._boundingSphereCV.push(BoundingSphere.clone(geometry.boundingSphereCV));
                    primitive._boundingSphere2D.push(new BoundingSphere());
                    primitive._boundingSphereMorph.push(new BoundingSphere());
                }
            }
        }
        primitive._va = va;
        primitive._primitiveType = geometries[0].primitiveType;
        if (primitive.releaseGeometryInstances) {
            primitive.geometryInstances = undefined;
        }
        primitive._geometries = undefined;
        this._setReady(primitive, frameState, PrimitiveState.COMPLETE, undefined);
    }
    _updateBatchTableOffsets(primitive, frameState) {
        const hasOffset = Defined(primitive._batchTableAttributeIndices?.offset);
        if (!hasOffset ||
            primitive._batchTableOffsetsUpdated ||
            frameState.scene3DOnly) {
            return;
        }
        const index2D = primitive._batchTableOffsetAttribute2DIndex;
        const projection = frameState.mapProjection;
        const ellipsoid = projection.ellipsoid;
        const batchTable = primitive._batchTable;
        const boundingSpheres = primitive._instanceBoundingSpheres;
        const length = boundingSpheres.length;
        for (let i = 0; i < length; ++i) {
            let boundingSphere = boundingSpheres[i];
            if (!Defined(boundingSphere)) {
                continue;
            }
            const offset = batchTable.getBatchedAttribute(i, primitive._batchTableAttributeIndices.offset);
            if (Cartesian3.equals(offset, Cartesian3.ZERO)) {
                batchTable.setBatchedAttribute(i, index2D, Cartesian3.ZERO);
                continue;
            }
            const modelMatrix = primitive.modelMatrix;
            if (Defined(modelMatrix)) {
                boundingSphere = BoundingSphere.transform(boundingSphere, modelMatrix);
            }
            let center = boundingSphere.center;
            center = ellipsoid.scaleToGeodeticSurface(center);
            let cartographic = ellipsoid.cartesianToCartographic(center);
            const center2D = projection.project(cartographic);
            const newPoint = Cartesian3.add(offset, center);
            cartographic = ellipsoid.cartesianToCartographic(newPoint, cartographic);
            const newPointProjected = projection.project(cartographic);
            const newVector = Cartesian3.subtract(newPointProjected, center2D);
            const x = newVector.x;
            newVector.x = newVector.z;
            newVector.z = newVector.y;
            newVector.y = x;
            batchTable.setBatchedAttribute(i, index2D, newVector);
        }
        primitive._batchTableOffsetsUpdated = true;
    }
    _updateBatchTableBoundingSpheres(primitive, frameState) {
        const hasDistanceDisplayCondition = Defined(primitive._batchTableAttributeIndices?.distanceDisplayCondition);
        if (!hasDistanceDisplayCondition ||
            primitive._batchTableBoundingSpheresUpdated) {
            return;
        }
        const indices = primitive._batchTableBoundingSphereAttributeIndices;
        const center3DHighIndex = indices.center3DHigh;
        const center3DLowIndex = indices.center3DLow;
        const center2DHighIndex = indices.center2DHigh;
        const center2DLowIndex = indices.center2DLow;
        const radiusIndex = indices.radius;
        const projection = frameState.mapProjection;
        const ellipsoid = projection.ellipsoid;
        const batchTable = primitive._batchTable;
        const boundingSpheres = primitive._instanceBoundingSpheres;
        const length = boundingSpheres.length;
        for (let i = 0; i < length; i++) {
            let boundingSphere = boundingSpheres[i];
            if (!Defined(boundingSphere)) {
                continue;
            }
            const modelMatrix = primitive.modelMatrix;
            if (Defined(modelMatrix)) {
                boundingSphere = BoundingSphere.transform(boundingSphere, modelMatrix);
            }
            const center = boundingSphere.center;
            const radius = boundingSphere.radius;
            let encodedCenter = EncodedCartesian3.fromCartesian(center);
            batchTable.setBatchedAttribute(i, center3DHighIndex, encodedCenter.high);
            batchTable.setBatchedAttribute(i, center3DLowIndex, encodedCenter.low);
            if (!frameState.scene3DOnly) {
                const cartographic = ellipsoid.cartesianToCartographic(center);
                const center2D = projection.project(cartographic);
                encodedCenter = EncodedCartesian3.fromCartesian(center2D);
                batchTable.setBatchedAttribute(i, center2DHighIndex, encodedCenter.high);
                batchTable.setBatchedAttribute(i, center2DLowIndex, encodedCenter.low);
            }
            batchTable.setBatchedAttribute(i, radiusIndex, radius);
        }
        primitive._batchTableBoundingSpheresUpdated = true;
    }
    _loadAsynchronous(frameState) {
        console.log('frameState: ', frameState);
    }
    _loadSynchronous(frameState) {
        const instances = Array.isArray(this.geometryInstances)
            ? this.geometryInstances
            : [this.geometryInstances];
        const length = (this._numberOfInstances = instances.length);
        const clonedInstances = new Array(length);
        const instanceIds = this._instanceIds;
        let instance;
        let i;
        let geometryIndex = 0;
        for (i = 0; i < length; i++) {
            instance = instances[i];
            const geometry = instance.geometry;
            let createdGeometry;
            if (Defined(geometry.attributes) && Defined(geometry.primitiveType)) {
                createdGeometry = this._cloneGeometry(geometry);
            }
            // else {
            // createdGeometry = geometry.constructor.createGeometry(geometry);
            // }
            clonedInstances[geometryIndex++] = this._cloneInstance(instance, createdGeometry);
            instanceIds.push(instance.id);
        }
        clonedInstances.length = geometryIndex;
        const scene3DOnly = frameState.scene3DOnly;
        const projection = frameState.mapProjection;
        const result = PrimitivePipeline.combineGeometry({
            instances: clonedInstances,
            ellipsoid: projection.ellipsoid,
            projection: projection,
            elementIndexUintSupported: frameState.context.elementIndexUint,
            scene3DOnly: scene3DOnly,
            vertexCacheOptimize: this.vertexCacheOptimize,
            compressVertices: this.compressVertices,
            modelMatrix: this.modelMatrix,
            createPickOffsets: this._createPickOffsets
        });
        this._geometries = result.geometries;
        this._attributeLocations = result.attributeLocations;
        this.modelMatrix = Matrix4.clone(result.modelMatrix, this.modelMatrix);
        this._pickOffsets = result.pickOffsets;
        this._offsetInstanceExtend = result.offsetInstanceExtend;
        this._instanceBoundingSpheres = result.boundingSpheres;
        this._instanceBoundingSpheresCV = result.boundingSpheresCV;
        if (Defined(this._geometries) && this._geometries.length > 0) {
            this._recomputeBoundingSpheres = true;
            this._state = PrimitiveState.COMBINED;
        }
        else {
            this._setReady(this, frameState, PrimitiveState.FAILED, undefined);
        }
    }
    _setReady(primitive, frameState, state, error) {
        primitive._state = state;
        primitive._error = error;
        frameState.afterRender.push(function () {
            primitive._ready =
                primitive._state === PrimitiveState.COMPLETE ||
                    primitive._state === PrimitiveState.FAILED;
        });
    }
    _cloneInstance(instance, geometry) {
        return new GeometryInstance({
            geometry: geometry,
            id: instance.id,
            modelMatrix: Matrix4.clone(instance.modelMatrix),
            pickPrimitive: instance.pickPrimitive,
            attributes: instance.attributes
        });
    }
    _cloneGeometry(geometry) {
        const attributes = geometry.attributes;
        const newAttributes = new GeometryAttributes();
        for (const property in attributes) {
            if (Defined(attributes[property])) {
                newAttributes[property] = this._cloneAttribute(attributes[property]);
            }
        }
        let indices;
        if (Defined(geometry.indices)) {
            const sourceValues = geometry.indices;
            if (Array.isArray(sourceValues)) {
                indices = sourceValues.slice(0);
            }
            // else {
            //   indices = new sourceValues.constructor(sourceValues);
            // }
        }
        return new Geometry({
            attributes: newAttributes,
            indices: indices,
            primitiveType: geometry.primitiveType,
            boundingSphere: BoundingSphere.clone(geometry.boundingSphere)
        });
    }
    _cloneAttribute(attribute) {
        // let clonedValues
        // if (Array.isArray(attribute.values)) {
        const clonedValues = attribute.values.slice(0);
        // } else {
        //   clonedValues = [attribute.values];
        // }
        return new GeometryAttribute({
            componentDatatype: attribute.componentDatatype,
            componentsPerAttribute: attribute.componentsPerAttribute,
            normalize: attribute.normalize,
            values: clonedValues
        });
    }
    _createBatchTable(context) {
        const geometryInstances = this.geometryInstances;
        const instances = Array.isArray(geometryInstances)
            ? geometryInstances
            : [geometryInstances];
        const numberOfInstances = instances.length;
        if (numberOfInstances === 0) {
            return;
        }
        const names = this._getCommonPerInstanceAttributeNames(instances);
        const length = names.length;
        const attributes = [];
        const attributeIndices = {};
        const boundingSphereAttributeIndices = {
            center3DHigh: 0,
            center3DLow: 0,
            center2DHigh: 0,
            center2DLow: 0,
            radius: 0
        };
        let offset2DIndex;
        const firstInstance = instances[0];
        let instanceAttributes = firstInstance.attributes;
        let i, name, attribute;
        for (i = 0; i < length; ++i) {
            name = names[i];
            attribute = instanceAttributes[name];
            if (names.indexOf('distanceDisplayCondition') !== -1) {
                attributes.push({
                    functionName: 'czm_batchTable_boundingSphereCenter3DHigh',
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3
                }, {
                    functionName: 'czm_batchTable_boundingSphereCenter3DLow',
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3
                }, {
                    functionName: 'czm_batchTable_boundingSphereCenter2DHigh',
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3
                }, {
                    functionName: 'czm_batchTable_boundingSphereCenter2DLow',
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3
                }, {
                    functionName: 'czm_batchTable_boundingSphereRadius',
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 1
                });
                boundingSphereAttributeIndices.center3DHigh = attributes.length - 5;
                boundingSphereAttributeIndices.center3DLow = attributes.length - 4;
                boundingSphereAttributeIndices.center2DHigh = attributes.length - 3;
                boundingSphereAttributeIndices.center2DLow = attributes.length - 2;
                boundingSphereAttributeIndices.radius = attributes.length - 1;
            }
            attributeIndices[name] = i;
            attributes.push({
                functionName: `czm_batchTable_${name}`,
                componentDatatype: attribute.componentDatatype,
                componentsPerAttribute: attribute.componentsPerAttribute,
                normalize: attribute.normalize
            });
        }
        if (names.indexOf('offset') !== -1) {
            attributes.push({
                functionName: 'czm_batchTable_offset2D',
                componentDatatype: ComponentDatatype.FLOAT,
                componentsPerAttribute: 3
            });
            offset2DIndex = attributes.length - 1;
        }
        attributes.push({
            functionName: 'czm_batchTable_pickColor',
            componentDatatype: ComponentDatatype.UNSIGNED_BYTE,
            componentsPerAttribute: 4,
            normalize: true
        });
        const attributesLength = attributes.length;
        const batchTable = new BatchTable(context, attributes, numberOfInstances);
        for (i = 0; i < numberOfInstances; ++i) {
            const instance = instances[i];
            instanceAttributes = instance.attributes;
            for (let j = 0; j < length; ++j) {
                name = names[j];
                attribute = instanceAttributes[name];
                const value = this._getAttributeValue(attribute.values);
                const attributeIndex = attributeIndices[name];
                batchTable.setBatchedAttribute(i, attributeIndex, value);
            }
            const pickObject = {
                primitive: defaultValue(instance.pickPrimitive, this),
                id: ''
            };
            if (Defined(instance.id)) {
                pickObject.id = instance.id;
            }
            const pickId = context.createPickId(pickObject);
            this._pickIds.push(pickId);
            const pickColor = pickId.color;
            const color = new Cartesian4();
            color.x = Color.floatToByte(pickColor.red);
            color.y = Color.floatToByte(pickColor.green);
            color.z = Color.floatToByte(pickColor.blue);
            color.w = Color.floatToByte(pickColor.alpha);
            batchTable.setBatchedAttribute(i, attributesLength - 1, color);
        }
        this._batchTable = batchTable;
        this._batchTableAttributeIndices = attributeIndices;
        this._batchTableBoundingSphereAttributeIndices =
            boundingSphereAttributeIndices;
        this._batchTableOffsetAttribute2DIndex = offset2DIndex;
        this._batchTable = batchTable;
    }
    _getAttributeValue(values) {
        const componentsPerAttribute = values.length;
        if (componentsPerAttribute === 1) {
            return values[0];
        }
        else if (componentsPerAttribute === 2) {
            return Cartesian2.unpack([...values], 0);
        }
        else if (componentsPerAttribute === 3) {
            return Cartesian3.unpack(values, 0);
        }
        else if (componentsPerAttribute === 4) {
            return Cartesian4.unpack([...values], 0);
        }
    }
    _getCommonPerInstanceAttributeNames(instances) {
        const length = instances.length;
        const attributesInAllInstances = [];
        const attribtues0 = instances[0].attributes;
        let name;
        for (name in attribtues0) {
            if (Defined(attribtues0[name])) {
                const attribute = attribtues0[name];
                let inAllInstances = true;
                for (let i = 1; i < length; ++i) {
                    const otherAttribute = instances[i].attributes[name];
                    if (!Defined(otherAttribute) ||
                        attribute.componentDatatype !== otherAttribute.componentDatatype ||
                        attribute.componentsPerAttribute !==
                            otherAttribute.componentsPerAttribute ||
                        attribute.normalize !== otherAttribute.normalize) {
                        inAllInstances = false;
                        break;
                    }
                }
                if (inAllInstances) {
                    attributesInAllInstances.push(name);
                }
            }
        }
        return attributesInAllInstances;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9QcmltaXRpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFdBQVcsRUFDWCxpQkFBaUIsRUFHakIsdUJBQXVCLEVBRXZCLGNBQWMsRUFFZCxTQUFTLEVBQ1YsTUFBTSxZQUFZLENBQUE7QUFDbkIsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBQ2pDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBSXJDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUVyQyxPQUFPLGdCQUFnQixNQUFNLDBCQUEwQixDQUFBO0FBRXZELE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sUUFBUSxNQUFNLGtCQUFrQixDQUFBO0FBQ3ZDLE9BQU8sa0JBQWtCLE1BQU0sNEJBQTRCLENBQUE7QUFDM0QsT0FBTyxjQUFjLE1BQU0sd0JBQXdCLENBQUE7QUFDbkQsT0FBTyxpQkFBaUIsTUFBTSwyQkFBMkIsQ0FBQTtBQUN6RCxPQUFPLGlCQUFrQyxNQUFNLHFCQUFxQixDQUFBO0FBQ3BFLE9BQU8saUJBQWlCLE1BQU0sMkJBQTJCLENBQUE7QUFDekQsT0FBTyxXQUFXLE1BQU0seUJBQXlCLENBQUE7QUFDakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQTtBQWFqQyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUFDckIsaUJBQWlCLENB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