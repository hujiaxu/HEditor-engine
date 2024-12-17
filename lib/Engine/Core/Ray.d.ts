import Cartesian3 from './Cartesian3';
export default class Ray {
    origin: Cartesian3;
    direction: Cartesian3;
    static getPoint: (ray: Ray, t: number, result?: Cartesian3) => Cartesian3;
    constructor(origin?: Cartesian3, direction?: Cartesian3);
}
