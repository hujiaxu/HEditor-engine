import { ComponentDatatype } from '../../type';
import PixelDatatype from '../Renderer/PixelDatatype';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import Cartesian4 from '../Core/Cartesian4';
import Defined from '../Core/Defined';
import PixelFormat from '../Renderer/PixelFormat';
import ContextLimits from '../Renderer/ContextLimits';
import Sampler from '../Renderer/Sampler';
import Texture from '../Renderer/Texture';
const setAttributeScratchValues = [
    undefined,
    undefined,
    new Cartesian2(),
    new Cartesian3(),
    new Cartesian4()
];
export default class BatchTable {
    _numberOfInstances;
    _attributes;
    _batchValuesDirty;
    _batchValues;
    _texture;
    _offsets;
    _stride;
    _packFloats;
    _pixelDatatype;
    _textureStep;
    _textureDimensions;
    get attributes() {
        return this._attributes;
    }
    get textureStep() {
        return this._textureStep;
    }
    constructor(context, attributes, numberOfInstances) {
        if (!Defined(numberOfInstances)) {
            throw new Error('numberOfInstances is required.');
        }
        if (!Defined(attributes)) {
            throw new Error('attributes is required.');
        }
        this._numberOfInstances = numberOfInstances;
        this._attributes = attributes;
        if (attributes.length === 0) {
            return;
        }
        const pixelDatatype = this._getDataType(attributes);
        const textureFloatsSupported = context.floatingPointTexture;
        const packFloats = pixelDatatype === PixelDatatype.FLOAT && !textureFloatsSupported;
        const offsets = this._createOffsets(attributes, packFloats);
        const stride = this._getStride(offsets, attributes, packFloats);
        const maxNumberOfInstancesPerRow = Math.floor(ContextLimits.maximumTextureSize / stride);
        const instancesPerWidth = Math.min(numberOfInstances, maxNumberOfInstancesPerRow);
        const width = stride * instancesPerWidth;
        const height = Math.ceil(numberOfInstances / instancesPerWidth);
        const stepX = 1.0 / width;
        const centerX = 0.5 * stepX;
        const stepY = 1.0 / height;
        const centerY = 0.5 * stepY;
        this._textureDimensions = new Cartesian2(width, height);
        this._textureStep = new Cartesian4(stepX, centerX, stepY, centerY);
        this._pixelDatatype = !packFloats
            ? pixelDatatype
            : PixelDatatype.UNSIGNED_BYTE;
        this._packFloats = packFloats;
        this._stride = stride;
        this._offsets = offsets;
        this._texture = undefined;
        const batchLength = 4 * width * height;
        this._batchValues =
            pixelDatatype === PixelDatatype.FLOAT && !packFloats
                ? new Float32Array(batchLength)
                : new Uint8Array(batchLength);
        this._batchValuesDirty = false;
    }
    _getStride(offsets, attributes, packFloats) {
        const length = offsets.length;
        const lastOffset = offsets[length - 1];
        const lastAttribute = attributes[length - 1];
        const componentDatatype = lastAttribute.componentDatatype;
        if (componentDatatype !== ComponentDatatype.UNSIGNED_BYTE && packFloats) {
            return lastOffset + 4;
        }
        return lastOffset + 1;
    }
    _createOffsets(attributes, packFloats) {
        const offsets = new Array(attributes.length);
        let currentOffset = 0;
        const attributesLength = attributes.length;
        for (let i = 0; i < attributesLength; ++i) {
            const attribute = attributes[i];
            const componentDatatype = attribute.componentDatatype;
            offsets[i] = currentOffset;
            if (componentDatatype !== ComponentDatatype.UNSIGNED_BYTE && packFloats) {
                currentOffset += 4;
            }
            else {
                ++currentOffset;
            }
        }
        return offsets;
    }
    _getDataType(attributes) {
        let foundFloatDatatype = false;
        const length = attributes.length;
        for (let i = 0; i < length; ++i) {
            if (attributes[i].componentDatatype !== ComponentDatatype.UNSIGNED_BYTE) {
                foundFloatDatatype = true;
                break;
            }
        }
        return foundFloatDatatype
            ? PixelDatatype.FLOAT
            : PixelDatatype.UNSIGNED_BYTE;
    }
    _createTexture(context) {
        const dimensions = this._textureDimensions;
        this._texture = new Texture({
            context: context,
            pixelFormat: PixelFormat.RGBA,
            pixelDatatype: this._pixelDatatype,
            width: dimensions.x,
            height: dimensions.y,
            sampler: Sampler.NEAREST,
            flipY: false
        });
    }
    _updateTexture() { }
    update(frameState) {
        if ((Defined(this._texture) && !this._batchValuesDirty) ||
            this._attributes.length === 0) {
            return;
        }
        this._batchValuesDirty = false;
        if (!Defined(this._texture)) {
            this._createTexture(frameState.context);
        }
        this._updateTexture();
    }
    setBatchedAttribute(instanceIndex, attributeIndex, value) {
        if (instanceIndex < 0 || instanceIndex >= this._numberOfInstances) {
            throw new Error('instanceIndex is out of range.');
        }
        if (attributeIndex < 0 || attributeIndex >= this._attributes.length) {
            throw new Error('attributeIndex is out of range.');
        }
        if (!Defined(value)) {
            throw new Error('value is required.');
        }
        const attributes = this._attributes;
        const result = setAttributeScratchValues[attributes[attributeIndex].componentsPerAttribute];
        const currentAttribute = this.getBatchedAttribute(instanceIndex, attributeIndex, result);
        const attributeType = this._getAttributeType(this._attributes, attributeIndex);
        const entriesEqual = 'equals' in attributeType
            ? attributeType.equals(currentAttribute, value)
            : currentAttribute === value;
        if (entriesEqual) {
            return;
        }
        const attributeValue = new Cartesian4();
        attributeValue.x = typeof value === 'number' ? value : value.x;
        attributeValue.y = typeof value === 'number' ? value : value.y || 0.0;
        attributeValue.z =
            typeof value === 'number' ? value : value.z || 0.0;
        attributeValue.w =
            typeof value === 'number' ? value : value.w || 0.0;
        const offset = this._offsets[attributeIndex];
        const stride = this._stride;
        const index = 4 * stride * instanceIndex + 4 * offset;
        if (this._packFloats &&
            attributes[attributeIndex].componentDatatype !==
                ComponentDatatype.UNSIGNED_BYTE) {
            this._setPackedAttribute(attributeValue, this._batchValues, index);
        }
        else {
            Cartesian4.pack(attributeValue, this._batchValues, index);
        }
        this._batchValuesDirty = true;
    }
    getBatchedAttribute(instanceIndex, attributeIndex, result) {
        if (instanceIndex < 0 || instanceIndex >= this._numberOfInstances) {
            throw new Error('instanceIndex is out of range.');
        }
        if (attributeIndex < 0 || attributeIndex >= this._attributes.length) {
            throw new Error('attributeIndex is out of range');
        }
        const attributes = this._attributes;
        const offset = this._offsets[attributeIndex];
        const stride = this._stride;
        const index = 4 * stride * instanceIndex + 4 * offset;
        let value;
        if (this._packFloats &&
            attributes[attributeIndex].componentDatatype !==
                ComponentDatatype.UNSIGNED_BYTE) {
            value = this._getPackedFloat(this._batchValues.values().toArray(), index);
        }
        else {
            value = Cartesian4.unpack(this._batchValues.values().toArray(), index);
        }
        const attributeType = this._getAttributeType(attributes, attributeIndex);
        if (attributeType === Cartesian2 || attributeType === Cartesian3) {
            return attributeType.fromCartesian4(value, result);
        }
        else if (attributeType === Cartesian4) {
            return attributeType.clone(value, result);
        }
        return value.x;
    }
    _setPackedAttribute(value, array, index) {
        let packed = Cartesian4.packFloat(value.x);
        Cartesian4.pack(packed, array, index);
        packed = Cartesian4.packFloat(value.y, packed);
        Cartesian4.pack(packed, array, index + 4);
        packed = Cartesian4.packFloat(value.z, packed);
        Cartesian4.pack(packed, array, index + 8);
        packed = Cartesian4.packFloat(value.w, packed);
        Cartesian4.pack(packed, array, index + 12);
    }
    _getPackedFloat(array, index) {
        let packed = Cartesian4.unpack(array, index);
        const x = Cartesian4.unpackFloat(packed);
        packed = Cartesian4.unpack(array, index + 4);
        const y = Cartesian4.unpackFloat(packed);
        packed = Cartesian4.unpack(array, index + 8);
        const z = Cartesian4.unpackFloat(packed);
        packed = Cartesian4.unpack(array, index + 12);
        const w = Cartesian4.unpackFloat(packed);
        return Cartesian4.fromElements(x, y, z, w);
    }
    _getAttributeType(attributes, attributeIndex) {
        const componentsPerAttribute = attributes[attributeIndex].componentsPerAttribute;
        if (componentsPerAttribute === 2) {
            return Cartesian2;
        }
        else if (componentsPerAttribute === 3) {
            return Cartesian3;
        }
        else if (componentsPerAttribute === 4) {
            return Cartesian4;
        }
        return Number;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF0Y2hUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvU2NlbmUvQmF0Y2hUYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXVCLGlCQUFpQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ25FLE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sV0FBVyxNQUFNLHlCQUF5QixDQUFBO0FBRWpELE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sT0FBTyxNQUFNLHFCQUFxQixDQUFBO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLHFCQUFxQixDQUFBO0FBR3pDLE1BQU0seUJBQXlCLEdBQUc7SUFDaEMsU0FBUztJQUNULFNBQVM7SUFDVCxJQUFJLFVBQVUsRUFBRTtJQUNoQixJQUFJLFVBQVUsRUFBRTtJQUNoQixJQUFJLFVBQVUsRUFBRTtDQUNqQixDQUFBO0FBRUQsTUFBTSxDQUFDLE9BQU8sT0FBTyxVQUFVO0lBQ3JCLGtCQUFrQixDQUFRO0lBQzFCLFdBQVcsQ0FBdUI7SUFDbEMsaUJBQWlCLENBQVU7SUFDM0IsWUFBWSxDQUFzRDtJQUNsRSxRQUFRLENBQXFCO0lBQzdCLFFBQVEsQ0FBVztJQUNuQixPQUFPLENBQVM7SUFDaEIsV0FBVyxDQUFVO0lBQ3JCLGNBQWMsQ0FBUztJQUN2QixZQUFZLENBQWE7SUFDekIsa0JBQWtCLENBQWE7SUFFdkMsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFBO0lBQ3pCLENBQUM7SUFDRCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxZQUFZLENB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