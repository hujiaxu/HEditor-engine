import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import Ellipsoid from './Ellipsoid';
export default class GeographicProjection {
    private _ellipsoid;
    private _semimajorAxis;
    private _oneOverSemimajorAxis;
    get ellipsoid(): Ellipsoid;
    constructor(ellipsoid?: Ellipsoid);
    project(cartographic: Cartographic, result?: Cartesian3): Cartesian3;
    unproject(cartesian: Cartesian3, result?: Cartographic): Cartographic;
}
