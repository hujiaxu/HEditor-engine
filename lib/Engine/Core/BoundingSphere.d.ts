import Cartesian3 from './Cartesian3';
import GeographicProjection from './GeographicProjection';
import { Intersect } from './IntersectionTests';
import Matrix4 from './Matrix4';
import Plane from './Plane';
export default class BoundingSphere {
    center: Cartesian3;
    radius: number;
    static transform: (sphere: BoundingSphere, transform: Matrix4, result?: BoundingSphere) => BoundingSphere;
    static union: (left: BoundingSphere, right: BoundingSphere, result?: BoundingSphere) => BoundingSphere;
    static clone: (sphere: BoundingSphere, result?: BoundingSphere) => BoundingSphere;
    static intersectPlane: (sphere: BoundingSphere, plane: Plane) => Intersect;
    static fromPoints: (positions: Cartesian3[], result?: BoundingSphere) => BoundingSphere;
    static projectTo2D: (sphere: BoundingSphere, projection: GeographicProjection, result?: BoundingSphere) => BoundingSphere;
    constructor(center?: Cartesian3, radius?: number);
    clone(result?: BoundingSphere): BoundingSphere;
}
