import { GeometryAttributesOptions } from '../../type';
import GeometryAttribute from './GeometryAttribute';
export default class GeometryAttributes {
    position: GeometryAttribute | undefined;
    normal?: GeometryAttribute | undefined;
    st?: GeometryAttribute | undefined;
    binormal?: GeometryAttribute | undefined;
    tangent?: GeometryAttribute | undefined;
    bitangent?: GeometryAttribute | undefined;
    color?: GeometryAttribute | undefined;
    batchId?: GeometryAttribute | undefined;
    position3DHigh?: GeometryAttribute | undefined;
    position3DLow?: GeometryAttribute | undefined;
    [key: string]: GeometryAttribute | undefined;
    constructor(options?: GeometryAttributesOptions);
}
