import { GeometryAttributeOptions } from '../../type';
export default class GeometryAttribute {
    componentDatatype: number;
    values: Float32Array<ArrayBuffer> | Int16Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Int32Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | Float64Array<ArrayBuffer> | Int8Array<ArrayBuffer> | Uint8Array<ArrayBuffer>;
    componentsPerAttribute: number;
    normalize: boolean;
    constructor(options: GeometryAttributeOptions);
}
