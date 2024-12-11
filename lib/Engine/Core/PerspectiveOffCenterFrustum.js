import Cartesian2 from './Cartesian2';
import { defined } from './Defined';
import Matrix4 from './Matrix4';
export default class PerspectiveOffCenterFrustum {
    _left;
    _right;
    _top;
    _bottom;
    _near;
    _far;
    _projectionMatrix;
    get projectionMatrix() {
        this._update(this);
        return this._projectionMatrix;
    }
    get left() {
        return this._left;
    }
    set left(value) {
        this._left = value;
    }
    get right() {
        return this._right;
    }
    set right(value) {
        this._right = value;
    }
    get top() {
        return this._top;
    }
    set top(value) {
        this._top = value;
    }
    get bottom() {
        return this._bottom;
    }
    set bottom(value) {
        this._bottom = value;
    }
    get near() {
        return this._near;
    }
    set near(value) {
        this._near = value;
    }
    get far() {
        return this._far;
    }
    set far(value) {
        this._far = value;
    }
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
        this.left = offCenterFrustum.left;
        this.right = offCenterFrustum.right;
        this.top = offCenterFrustum.top;
        this.bottom = offCenterFrustum.bottom;
        this.near = offCenterFrustum.near;
        this.far = offCenterFrustum.far;
        this._projectionMatrix = Matrix4.computePerspectiveOffCenter(this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc3BlY3RpdmVPZmZDZW50ZXJGcnVzdHVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1BlcnNwZWN0aXZlT2ZmQ2VudGVyRnJ1c3R1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNuQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsTUFBTSxDQUFDLE9BQU8sT0FBTywyQkFBMkI7SUFDdEMsS0FBSyxDQUFRO0lBQ2IsTUFBTSxDQUFRO0lBQ2QsSUFBSSxDQUFRO0lBQ1osT0FBTyxDQUFRO0lBQ2YsS0FBSyxDQUFRO0lBQ2IsSUFBSSxDQUFRO0lBRVosaUJBQWlCLENBQVM7SUFFbEMsSUFBSSxnQkFBZ0I7UUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtJQUMvQixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ3BCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7SUFDcEIsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLEtBQWE7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7SUFDckIsQ0FBQztJQUNELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsSUFBSSxHQUFHLENBQUMsS0FBYTtRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFhO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO0lBQ3RCLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUVELElBQUksSUFBSSxDQUFDLEtBQWE7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDcEIsQ0FBQztJQUVELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsSUFBSSxHQUFHLENBQUMsS0FBYTtRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBRUQsWUFBWSxFQUNWLElBQUksRUFDSixLQUFLLEVBQ0wsR0FBRyxFQUNILE1BQU0sRUFDTixJQUFJLEVBQ0osR0FBRyxFQUNnQztRQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQTtRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFBO1FBRWYsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FDMUQsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxPQUFPLEVBQ1osSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsS0FBSyxFQUNWLElBQUksQ0FBQyxJQUFJLENBQ1YsQ0FBQTtJQUNILENBQUM7SUFFTSxrQkFBa0IsQ0FDdkIsa0JBQTBCLEVBQzFCLG1CQUEyQixFQUMzQixRQUFnQixFQUNoQixVQUFrQixFQUNsQixNQUFtQjtRQUVuQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRWxCLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7WUFDbEUsTUFBTSxJQUFJLEtBQUssQ0FDYiwwREFBMEQsQ0FDM0QsQ0FBQTtRQUNILENBQUM7UUFDRCxJQUFJLG1CQUFtQixJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQTtRQUNuRSxDQUFDO1FBQ0QsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUE7UUFDbEUsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUE7UUFDMUMsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDNUMsQ0FBQztRQUNELElBQUksVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtRQUMxRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO1FBQzNCLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUNuQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQTtRQUNyQyxNQUFNLFdBQVcsR0FDZixDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLG1CQUFtQixDQUFBO1FBQ2hFLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQTtRQUNuQyxNQUFNLFVBQVUsR0FDZCxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLGtCQUFrQixDQUFBO1FBRS9ELE1BQU0sQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBO1FBQ3JCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFBO1FBQ3RCLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVPLE9BQU8sQ0FBQyxnQkFBNkM7UUFDM0QsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUE7UUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUE7UUFDbkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUE7UUFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUE7UUFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUE7UUFDakMsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUE7UUFDL0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FDMUQsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsS0FBSyxFQUNWLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxHQUFHLENBQ1QsQ0FBQTtJQUNILENBQUM7Q0FDRiJ9