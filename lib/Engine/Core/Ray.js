import Cartesian3 from './Cartesian3';
export default class Ray {
    origin;
    direction;
    static getPoint;
    constructor(origin = new Cartesian3(), direction = new Cartesian3()) {
        this.origin = origin;
        this.direction = direction;
    }
}
Ray.getPoint = function (ray, t, result) {
    result = result || new Cartesian3();
    result = Cartesian3.multiplyByScalar(ray.direction, t, result);
    return Cartesian3.add(ray.origin, result, result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1JheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFFckMsTUFBTSxDQUFDLE9BQU8sT0FBTyxHQUFHO0lBQ3RCLE1BQU0sQ0FBWTtJQUNsQixTQUFTLENBQVk7SUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBMEQ7SUFDekUsWUFDRSxTQUFxQixJQUFJLFVBQVUsRUFBRSxFQUNyQyxZQUF3QixJQUFJLFVBQVUsRUFBRTtRQUV4QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtJQUM1QixDQUFDO0NBQ0Y7QUFFRCxHQUFHLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBUSxFQUFFLENBQVMsRUFBRSxNQUFtQjtJQUMvRCxNQUFNLEdBQUcsTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFLENBQUE7SUFDbkMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM5RCxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDbkQsQ0FBQyxDQUFBIn0=