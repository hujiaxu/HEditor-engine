import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import defined from './Defined';
import Ellipsoid from './Ellipsoid';
export default class GeographicProjection {
    _ellipsoid;
    _semimajorAxis;
    _oneOverSemimajorAxis;
    get ellipsoid() {
        return this._ellipsoid;
    }
    constructor(ellipsoid = Ellipsoid.default) {
        this._ellipsoid = ellipsoid;
        this._semimajorAxis = ellipsoid.maximumRadius;
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis;
    }
    project(cartographic, result) {
        if (!defined(result)) {
            result = new Cartesian3();
        }
        result.x = cartographic.longitude * this._semimajorAxis;
        result.y = cartographic.latitude * this._semimajorAxis;
        result.z = cartographic.height;
        return result;
    }
    unproject(cartesian, result) {
        if (!defined(result)) {
            result = new Cartographic();
        }
        result.longitude = cartesian.x * this._oneOverSemimajorAxis;
        result.latitude = cartesian.y * this._oneOverSemimajorAxis;
        result.height = cartesian.z;
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvZ3JhcGhpY1Byb2plY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvR2VvZ3JhcGhpY1Byb2plY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUE7QUFFbkMsTUFBTSxDQUFDLE9BQU8sT0FBTyxvQkFBb0I7SUFDL0IsVUFBVSxDQUFXO0lBQ3JCLGNBQWMsQ0FBUTtJQUN0QixxQkFBcUIsQ0FBUTtJQUVyQyxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7SUFDeEIsQ0FBQztJQUNELFlBQVksWUFBdUIsU0FBUyxDQUFDLE9BQU87UUFDbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUE7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFBO1FBQzdDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQTtJQUN4RCxDQUFDO0lBRU0sT0FBTyxDQUFDLFlBQTBCLEVBQUUsTUFBbUI7UUFDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO1FBQzNCLENBQUM7UUFFRCxNQUFNLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQTtRQUN2RCxNQUFNLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQTtRQUN0RCxNQUFNLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUE7UUFDOUIsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRU0sU0FBUyxDQUFDLFNBQXFCLEVBQUUsTUFBcUI7UUFDM0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO1FBQzdCLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFBO1FBQzNELE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUE7UUFDMUQsTUFBTSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBQzNCLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztDQUNGIn0=