import { defined } from './Defined';
export default class Cartographic {
    longitude;
    latitude;
    height;
    static clone;
    constructor(longitude = 0.0, latitude = 0.0, height = 0.0) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.height = height;
    }
}
Cartographic.clone = (cartographic, result) => {
    if (!defined(cartographic)) {
        throw new Error('cartographic is required.');
    }
    if (!defined(result)) {
        result = new Cartographic();
    }
    result.longitude = cartographic.longitude;
    result.latitude = cartographic.latitude;
    result.height = cartographic.height;
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydG9ncmFwaGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL0NhcnRvZ3JhcGhpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBRW5DLE1BQU0sQ0FBQyxPQUFPLE9BQU8sWUFBWTtJQUMvQixTQUFTLENBQVE7SUFDakIsUUFBUSxDQUFRO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLE1BQU0sQ0FBQyxLQUFLLENBR0s7SUFFakIsWUFDRSxZQUFvQixHQUFHLEVBQ3ZCLFdBQW1CLEdBQUcsRUFDdEIsU0FBaUIsR0FBRztRQUVwQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUN0QixDQUFDO0NBQ0Y7QUFDRCxZQUFZLENBQUMsS0FBSyxHQUFHLENBQUMsWUFBMEIsRUFBRSxNQUFxQixFQUFFLEVBQUU7SUFDekUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1FBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO0lBQzdCLENBQUM7SUFDRCxNQUFNLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUE7SUFDekMsTUFBTSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFBO0lBQ3ZDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQTtJQUNuQyxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQSJ9