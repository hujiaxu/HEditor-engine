import Cartesian2 from './Cartesian2';
import defined from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc3BlY3RpdmVPZmZDZW50ZXJGcnVzdHVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1BlcnNwZWN0aXZlT2ZmQ2VudGVyRnJ1c3R1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixNQUFNLENBQUMsT0FBTyxPQUFPLDJCQUEyQjtJQUN0QyxLQUFLLEdBQVcsR0FBRyxDQUFBO0lBQ25CLE1BQU0sR0FBVyxHQUFHLENBQUE7SUFDcEIsSUFBSSxHQUFXLEdBQUcsQ0FBQTtJQUNsQixPQUFPLEdBQVcsR0FBRyxDQUFBO0lBQ3JCLEtBQUssR0FBVyxHQUFHLENBQUE7SUFDbkIsSUFBSSxHQUFXLEdBQUcsQ0FBQTtJQUVsQixpQkFBaUIsQ0FBUztJQUVsQyxJQUFJLGdCQUFnQjtRQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0lBQy9CLENBQUM7SUFFTSxJQUFJLEdBQVcsR0FBRyxDQUFBO0lBQ2xCLEtBQUssR0FBVyxHQUFHLENBQUE7SUFDbkIsR0FBRyxHQUFXLEdBQUcsQ0FBQTtJQUNqQixNQUFNLEdBQVcsR0FBRyxDQUFBO0lBQ3BCLElBQUksR0FBVyxHQUFHLENBQUE7SUFDbEIsR0FBRyxHQUFXLEdBQUcsQ0FBQTtJQUV4QixZQUFZLEVBQ1YsSUFBSSxFQUNKLEtBQUssRUFDTCxHQUFHLEVBQ0gsTUFBTSxFQUNOLElBQUksRUFDSixHQUFHLEVBQ2dDO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxD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