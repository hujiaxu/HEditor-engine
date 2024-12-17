import Cartesian2 from './Cartesian2';
import { defined } from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3J0aG9ncmFwaGljT2ZmQ2VudGVyRnJ1c3R1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9PcnRob2dyYXBoaWNPZmZDZW50ZXJGcnVzdHVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ25DLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixNQUFNLENBQUMsT0FBTyxPQUFPLDRCQUE0QjtJQUN2QyxLQUFLLENBQVE7SUFDYixNQUFNLENBQVE7SUFDZCxPQUFPLENBQVE7SUFDZixJQUFJLENBQVE7SUFDWixLQUFLLENBQVE7SUFDYixJQUFJLENBQVE7SUFDWixpQkFBaUIsR0FBWSxJQUFJLE9BQU8sRUFBRSxDQUFBO0lBRWxELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQ3BCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDckIsQ0FBQztJQUVELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFDRCxJQUFJLEdBQUc7UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDbEIsQ0FBQztJQUNELElBQUksZ0JBQWdCO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNkLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0lBQy9CLENBQUM7SUFDRCxZQUFZLEVBQ1YsSUFBSSxHQUFHLEdBQUcsRUFDVixLQUFLLEdBQUcs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