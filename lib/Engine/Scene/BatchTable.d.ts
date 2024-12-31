import GeometryAttribute from '../Core/GeometryAttribute';
export default class BatchTable {
    _numberOfInstances: number;
    _attributes: GeometryAttribute[];
    constructor(attributes: GeometryAttribute[], numberOfInstances: number);
}
