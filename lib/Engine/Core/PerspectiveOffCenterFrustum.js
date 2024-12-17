import Cartesian2 from './Cartesian2';
import { defined } from './Defined';
import Matrix4 from './Matrix4';
export default class PerspectiveOffCenterFrustum {
    _left = 0.0;
    _right = 0.0;
    _top = 0.0;
    _bottom = 0.0;
    _near = 0.0;
    _far = 0.0;
    _projectionMatrix;
    get projectionMatrix() {
        this._update(this);
        return this._projectionMatrix;
    }
    left = 0.0;
    right = 0.0;
    top = 0.0;
    bottom = 0.0;
    near = 0.0;
    far = 0.0;
    constructor({ left, right, top, bottom, near, far }) {
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;
        this._near = near;
        this._far = far;
        this._projectionMatrix = Matrix4.computePerspectiveOffCenter(this._left, this._right, this._bottom, this._top, this._near, this._far);
    }
    getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, pixelRatio, result) {
        this._update(this);
        if (!defined(drawingBufferWidth) || !defined(drawingBufferHeight)) {
            throw new Error('drawingBufferWidth and drawingBufferHeight are required.');
        }
        if (drawingBufferHeight <= 0) {
            throw new Error('drawingBufferHeight must be greater than zero.');
        }
        if (drawingBufferWidth <= 0) {
            throw new Error('drawingBufferWidth must be greater than zero.');
        }
        if (!defined(distance)) {
            throw new Error('distance is required.');
        }
        if (!defined(pixelRatio)) {
            throw new Error('pixelRatio is required.');
        }
        if (pixelRatio <= 0) {
            throw new Error('pixelRatio must be greater than zero.');
        }
        if (!defined(result)) {
            result = new Cartesian2();
        }
        const inverseNear = 1.0 / this.near;
        let tanTheta = this.top * inverseNear;
        const pixelHeight = (2.0 * pixelRatio * distance * tanTheta) / drawingBufferHeight;
        tanTheta = this.right * inverseNear;
        const pixelWidth = (2.0 * pixelRatio * distance * tanTheta) / drawingBufferWidth;
        result.x = pixelWidth;
        result.y = pixelHeight;
        return result;
    }
    _update(offCenterFrustum) {
        this._left = offCenterFrustum.left;
        this._right = offCenterFrustum.right;
        this._top = offCenterFrustum.top;
        this._bottom = offCenterFrustum.bottom;
        this._near = offCenterFrustum.near;
        this._far = offCenterFrustum.far;
        this._projectionMatrix = Matrix4.computePerspectiveOffCenter(this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc3BlY3RpdmVPZmZDZW50ZXJGcnVzdHVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1BlcnNwZWN0aXZlT2ZmQ2VudGVyRnJ1c3R1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNuQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsTUFBTSxDQUFDLE9BQU8sT0FBTywyQkFBMkI7SUFDdEMsS0FBSyxHQUFXLEdBQUcsQ0FBQTtJQUNuQixNQUFNLEdBQVcsR0FBRyxDQUFBO0lBQ3BCLElBQUksR0FBVyxHQUFHLENBQUE7SUFDbEIsT0FBTyxHQUFXLEdBQUcsQ0FBQTtJQUNyQixLQUFLLEdBQVcsR0FBRyxDQUFBO0lBQ25CLElBQUksR0FBVyxHQUFHLENBQUE7SUFFbEIsaUJBQWlCLENBQVM7SUFFbEMsSUFBSSxnQkFBZ0I7UUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtJQUMvQixDQUFDO0lBRU0sSUFBSSxHQUFXLEdBQUcsQ0FBQTtJQUNsQixLQUFLLEdBQVcsR0FBRyxDQUFBO0lBQ25CLEdBQUcsR0FBVyxHQUFHLENBQUE7SUFDakIsTUFBTSxHQUFXLEdBQUcsQ0FBQTtJQUNwQixJQUFJLEdBQVcsR0FBRyxDQUFBO0lBQ2xCLEdBQUcsR0FBVyxHQUFHLENBQUE7SUFFeEIsWUFBWSxFQUNWLElBQUksRUFDSixLQUFLLEVBQ0wsR0FBRyxFQUNILE1BQU0sRUFDTixJQUFJLEVBQ0osR0FBRyxFQUNnQztRQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtRQUNuQixJQUFJLENBQUMsSUFBSSxH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