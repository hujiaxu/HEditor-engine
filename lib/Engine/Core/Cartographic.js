import defined from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydG9ncmFwaGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL0NhcnRvZ3JhcGhpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxZQUFZO0lBQy9CLFNBQVMsQ0FBUTtJQUNqQixRQUFRLENBQVE7SUFDaEIsTUFBTSxDQUFRO0lBQ2QsTUFBTSxDQUFDLEtBQUssQ0FHSztJQUVqQixZQUNFLFlBQW9CLEdBQUcsRUFDdkIsV0FBbUIsR0FBRyxFQUN0QixTQUFpQixHQUFHO1FBRXBCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ3RCLENBQUM7Q0FDRjtBQUNELFlBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxZQUEwQixFQUFFLE1BQXFCLEVBQUUsRUFBRTtJQUN6RSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7SUFDN0IsQ0FBQztJQUNELE1BQU0sQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQTtJQUN6QyxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUE7SUFDdkMsTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFBO0lBQ25DLE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQyxDQUFBIn0=