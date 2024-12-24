import Ellipsoid from '../Core/Ellipsoid';
import EllipsoidTerrainProvider from '../Core/EllipsoidTerrainProvider';
import Ray from '../Core/Ray';
import Scene from './Scene';
export default class Globe {
    private _ellipsoid;
    private _terrainProvider;
    get ellipsoid(): Ellipsoid;
    get terrainProvider(): EllipsoidTerrainProvider;
    constructor(ellipsoid: Ellipsoid);
    pickWorldCoordinates(ray: Ray, scene: Scene, cameraUnderground: boolean): import("..").Cartesian3;
}
