import Cartesian2 from './Cartesian2';
import defined from './Defined';
import Matrix4 from './Matrix4';
export default class OrthographicOffCenterFrustum {
    _left;
    _right;
    _bottom;
    _top;
    _near;
    _far;
    _projectionMatrix = new Matrix4();
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }
    get bottom() {
        return this._bottom;
    }
    get top() {
        return this._top;
    }
    get near() {
        return this._near;
    }
    get far() {
        return this._far;
    }
    get projectionMatrix() {
        this._update();
        return this._projectionMatrix;
    }
    constructor({ left = 0.0, right = 0.0, bottom = 0.0, top = 0.0, near = 0.0, far = 0.0 }) {
        this._left = left;
        this._right = right;
        this._bottom = bottom;
        this._top = top;
        this._near = near;
        this._far = far;
    }
    getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, pixelRatio, result) {
        this._update();
        if (!defined(drawingBufferHeight) || !defined(drawingBufferWidth)) {
            throw new Error('drawingBufferHeight and drawingBufferWidth are required.');
        }
        if (drawingBufferHeight <= 0) {
            throw new Error('drawingBufferHeight is required to be greater than zero.');
        }
        if (drawingBufferWidth <= 0) {
            throw new Error('drawingBufferWidth is required to be greater than zero.');
        }
        if (!defined(distance)) {
            throw new Error('distance is required.');
        }
        if (!defined(pixelRatio)) {
            throw new Error('pixelRatio is required.');
        }
        if (pixelRatio <= 0) {
            throw new Error('pixelRatio is required to be greater than zero.');
        }
        if (!defined(result)) {
            result = new Cartesian2();
        }
        const frustumWidth = this._right - this._left;
        const frustumHeight = this._top - this._bottom;
        const pixelWidth = (pixelRatio * frustumWidth) / drawingBufferWidth;
        const pixelHeight = (pixelRatio * frustumHeight) / drawingBufferHeight;
        result.x = pixelWidth;
        result.y = pixelHeight;
        return result;
    }
    _update(offCenterFrustum = this) {
        this._left = offCenterFrustum._left;
        this._right = offCenterFrustum._right;
        this._top = offCenterFrustum._top;
        this._bottom = offCenterFrustum._bottom;
        this._near = offCenterFrustum._near;
        this._far = offCenterFrustum._far;
        this._projectionMatrix = Matrix4.computePerspectiveOffCenter(this._left, this._right, this._bottom, this._top, this._near, this._far);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3J0aG9ncmFwaGljT2ZmQ2VudGVyRnJ1c3R1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9PcnRob2dyYXBoaWNPZmZDZW50ZXJGcnVzdHVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRS9CLE1BQU0sQ0FBQyxPQUFPLE9BQU8sNEJBQTRCO0lBQ3ZDLEtBQUssQ0FBUTtJQUNiLE1BQU0sQ0FBUTtJQUNkLE9BQU8sQ0FBUTtJQUNmLElBQUksQ0FBUTtJQUNaLEtBQUssQ0FBUTtJQUNiLElBQUksQ0FBUTtJQUNaLGlCQUFpQixHQUFZLElBQUksT0FBTyxFQUFFLENBQUE7SUFFbEQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7SUFDcEIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQsSUFBSSxHQUFHO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUNELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSxnQkFBZ0I7UUFDbEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDL0IsQ0FBQztJQUNELFlBQVksRUFDVixJQUFJLEdBQUcsR0FBRyxFQUNWLEtBQUssR0FBRyxHQUFHLEVBQ1gs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