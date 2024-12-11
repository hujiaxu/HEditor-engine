import defaultValue from './DefaultValue';
import OrthographicOffCenterFrustum from './OrthographicOffCenterFrustum';
export default class OrthographicFrustum {
    _offCenterFrustum;
    _width;
    _aspectRatio;
    _near;
    _far;
    get offCenterFrustum() {
        return this._offCenterFrustum;
    }
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
    }
    get aspectRatio() {
        return this._aspectRatio;
    }
    get near() {
        return this._near;
    }
    get far() {
        return this._far;
    }
    get projectionMatrix() {
        this._update();
        return this._offCenterFrustum.projectionMatrix;
    }
    constructor({ width, aspectRatio, near, far }) {
        this._offCenterFrustum = new OrthographicOffCenterFrustum({});
        this._width = width;
        this._aspectRatio = aspectRatio;
        this._near = defaultValue(near, 0.0);
        this._far = defaultValue(far, 500000000.0);
    }
    getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, pixelRatio, result) {
        this._update();
        return this._offCenterFrustum.getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, pixelRatio, result);
    }
    _update() { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3J0aG9ncmFwaGljRnJ1c3R1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9PcnRob2dyYXBoaWNGcnVzdHVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sNEJBQTRCLE1BQU0sZ0NBQWdDLENBQUE7QUFFekUsTUFBTSxDQUFDLE9BQU8sT0FBTyxtQkFBbUI7SUFDOUIsaUJBQWlCLENBQThCO0lBQy9DLE1BQU0sQ0FBUTtJQUNkLFlBQVksQ0FBUTtJQUNwQixLQUFLLENBQVE7SUFDYixJQUFJLENBQVE7SUFFcEIsSUFBSSxnQkFBZ0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDL0IsQ0FBQztJQUNELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUNwQixDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtJQUNyQixDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQzFCLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUNELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSxnQkFBZ0I7UUFDbEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUE7SUFDaEQsQ0FBQztJQUNELFlBQVksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQThCO1FBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRTdELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1FBQ25CLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFBO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUVNLGtCQUFrQixDQUN2QixrQkFBMEIsRUFDMUIsbUJBQTJCLEVBQzNCLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLE1BQW1CO1FBRW5CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNkLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUM5QyxrQkFBa0IsRUFDbEIsbUJBQW1CLEVBQ25CLFFBQVEsRUFDUixVQUFVLEVBQ1YsTUFBTSxDQUNQLENBQUE7SUFDSCxDQUFDO0lBRU8sT0FBTyxLQUFJLENBQUM7Q0FDckIifQ==