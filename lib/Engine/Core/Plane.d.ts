import Cartesian3 from './Cartesian3';
export default class Plane {
    normal: Cartesian3;
    distance: number;
    static fromPointNormal: (point: Cartesian3, normal: Cartesian3, result?: Plane) => Plane;
    constructor(normal?: Cartesian3, distance?: number);
}
