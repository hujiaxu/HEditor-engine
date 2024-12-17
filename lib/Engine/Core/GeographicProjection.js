import Cartesian3 from './Cartesian3';
import Cartographic from './Cartographic';
import { defined } from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvZ3JhcGhpY1Byb2plY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvR2VvZ3JhcGhpY1Byb2plY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDbkMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFBO0FBRW5DLE1BQU0sQ0FBQyxPQUFPLE9BQU8sb0JBQW9CO0lBQy9CLFVBQVUsQ0FBVztJQUNyQixjQUFjLENBQVE7SUFDdEIscUJBQXFCLENBQVE7SUFFckMsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBQ3hCLENBQUM7SUFDRCxZQUFZLFlBQXVCLFNBQVMsQ0FBQyxPQUFPO1FBQ2xELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFBO1FBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQTtRQUM3QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUE7SUFDeEQsQ0FBQztJQUVNLE9BQU8sQ0FBQyxZQUEwQixFQUFFLE1BQW1CO1FBQzVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBRUQsTUFBTSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUE7UUFDdkQsTUFBTSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUE7UUFDdEQsTUFBTSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFBO1FBQzlCLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVNLFNBQVMsQ0FBQyxTQUFxQixFQUFFLE1BQXFCO1FBQzNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUM3QixDQUFDO1FBRUQsTUFBTSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQTtRQUMzRCxNQUFNLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFBO1FBQzFELE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUMzQixPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FDRiJ9