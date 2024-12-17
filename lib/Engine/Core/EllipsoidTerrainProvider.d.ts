import Ellipsoid from './Ellipsoid';
export default class EllipsoidTerrainProvider {
    private _ellipsoid;
    get ellipsoid(): Ellipsoid;
    constructor({ ellipsoid }: {
        ellipsoid: Ellipsoid;
    });
}
