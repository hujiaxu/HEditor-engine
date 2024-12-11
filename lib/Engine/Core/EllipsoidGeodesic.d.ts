import Cartographic from './Cartographic';
import Ellipsoid from './Ellipsoid';
export default class EllipsoidGeodesic {
    private _ellipsoid;
    private _start;
    private _end;
    private _constants;
    private _startHeading;
    private _endHeading;
    private _distance;
    private _uSquared;
    get ellipsoid(): Ellipsoid;
    constructor(start: Cartographic | undefined, end: Cartographic | undefined, ellipsoid: Ellipsoid);
    setEndPoints(start: Cartographic, end: Cartographic): void;
    interpolateUsingFraction(fraction: number, result?: Cartographic): Cartographic;
    interpolateUsingSurfaceDistance(distance: number, result?: Cartographic): Cartographic;
    private _computeProperties;
    private _setConstants;
    private _vincentyInverseFormula;
    private _computeDeltaLambda;
    private _computeC;
}
