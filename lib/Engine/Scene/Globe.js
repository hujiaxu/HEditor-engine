import defaultValue from '../Core/DefaultValue';
import Ellipsoid from '../Core/Ellipsoid';
import EllipsoidTerrainProvider from '../Core/EllipsoidTerrainProvider';
export default class Globe {
    _ellipsoid;
    _terrainProvider;
    get ellipsoid() {
        return this._ellipsoid;
    }
    get terrainProvider() {
        return this._terrainProvider;
    }
    constructor(ellipsoid) {
        ellipsoid = defaultValue(ellipsoid, Ellipsoid.default);
        this._ellipsoid = ellipsoid;
        this._terrainProvider = new EllipsoidTerrainProvider({
            ellipsoid: ellipsoid
        });
    }
    pickWorldCoordinates(ray, scene, cameraUnderground) {
        if (cameraUnderground) {
            console.log(scene);
        }
        return ray.origin;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL0dsb2JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8sd0JBQXdCLE1BQU0sa0NBQWtDLENBQUE7QUFJdkUsTUFBTSxDQUFDLE9BQU8sT0FBTyxLQUFLO0lBQ2hCLFVBQVUsQ0FBVztJQUNyQixnQkFBZ0IsQ0FBMEI7SUFFbEQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBQ3hCLENBQUM7SUFDRCxJQUFJLGVBQWU7UUFDakIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUE7SUFDOUIsQ0FBQztJQUNELFlBQVksU0FBb0I7UUFDOUIsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFBO1FBRTNCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHdCQUF3QixDQUFDO1lBQ25ELFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSxvQkFBb0IsQ0FDekIsR0FBUSxFQUNSLEtBQVksRUFDWixpQkFBMEI7UUFFMUIsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDcEIsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQTtJQUNuQixDQUFDO0NBQ0YifQ==