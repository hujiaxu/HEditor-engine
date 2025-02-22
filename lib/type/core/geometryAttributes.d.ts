import { GeometryAttribute } from '../../Engine';
export declare const ComponentDatatype: {
    BYTE: 5120;
    FLOAT: 5126;
    SHORT: 5122;
    UNSIGNED_BYTE: 5121;
    UNSIGNED_SHORT: 5123;
    UNSIGNED_INT: 5125;
    DOUBLE: number;
    INT: 5124;
    validate: (componentDatatype: number) => boolean;
    getSizeInBytes: (componentDatatype: number) => number;
    createTypedArray: (componentDatatype: number, valuesOrLength: GeometryAttributeValuesType | ArrayBuffer) => Float32Array<ArrayBuffer> | Uint8Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | Int16Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Int32Array<ArrayBuffer> | Float64Array<ArrayBuffer> | Int8Array<ArrayBuffer>;
};
export type GeometryAttributeValuesType = Int8Array<ArrayBuffer> | Uint8Array<ArrayBuffer> | Float32Array<ArrayBuffer> | Int16Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Int32Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | Float64Array<ArrayBuffer>;
export type GeometryIndicesType = Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
export interface GeometryAttributeOptions {
    componentDatatype: number;
    componentsPerAttribute: number;
    values: GeometryAttributeValuesType;
    normalize?: boolean;
    functionName?: string;
}
export interface GeometryAttributesOptions {
    position: GeometryAttribute;
    position3DHigh?: GeometryAttribute;
    position3DLow?: GeometryAttribute;
    normal?: GeometryAttribute;
    st?: GeometryAttribute;
    binormal?: GeometryAttribute;
    tangent?: GeometryAttribute;
    bitangent?: GeometryAttribute;
    color?: GeometryAttribute;
    batchId?: GeometryAttribute;
    extrudeDirection?: GeometryAttribute;
}
export type GeometryAttributeType = 'position' | 'position3DHigh' | 'position3DLow' | 'normal' | 'st' | 'binormal' | 'tangent' | 'bitangent' | 'color' | 'batchId';
export declare enum GeometryOffsetAttribute {
    NONE = 0,
    TOP = 1,
    ALL = 2
}
