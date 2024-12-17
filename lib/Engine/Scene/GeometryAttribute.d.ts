import { ComponentDatatype, GeometryAttributeOptions } from '../../type';
export default class GeometryAttribute {
    componentDatatype: ComponentDatatype;
    values: number[];
    componentsPerAttribute: number;
    constructor({ componentsPerAttribute, componentDatatype, values }: GeometryAttributeOptions);
}
