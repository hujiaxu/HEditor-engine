import Cartesian3 from './Cartesian3';
import Ellipsoid from './Ellipsoid';
import Interval from './Interval';
import Matrix3 from './Matrix3';
import Plane from './Plane';
import Ray from './Ray';
export default class IntersectionTests {
    static rayPlane: (ray: Ray, plane: Plane, result?: Cartesian3) => Cartesian3 | undefined;
    static rayEllipsoid: (ray: Ray, ellipsoid: Ellipsoid) => Interval | undefined;
    static quadraticVectorExpression: (A: Matrix3, b: Cartesian3, c: number, x: number, w: number) => Cartesian3[];
    static grazingAltitudeLocation: (ray: Ray, ellipsoid: Ellipsoid) => Cartesian3 | undefined;
}
