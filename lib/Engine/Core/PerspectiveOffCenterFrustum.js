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
        // 在近裁剪面上，视野的总高度为 2 * this.top，总宽度为 2 * this.right。
        // 根据透视投影的相似三角形原理，在距离为 distance 处：
        // 实际的半高 = (distance / this.near) * this.top
        // 整个高度 = 2 * (distance / this.near) * this.top
        // 类似地，宽度为：2 * (distance / this.near) * this.right
        // 绘制缓冲区的宽度和高度（drawingBufferWidth 和 drawingBufferHeight）代表了画布上实际的像素总数
        // 当我们计算出目标距离处视野的物理尺寸（例如总高度为 2 * distance * tanTheta）时，这个尺寸是覆盖整个画布的尺寸。
        // 为了知道一个单独像素对应多少物理单位，就需要将总尺寸均分到每一个像素上，也就是除以对应的像素数。
        // 在很多设备（尤其是高分辨率屏幕）上，一个 CSS 像素并不等于一个物理像素。
        // pixelRatio 就是描述这种比例的，比如 pixelRatio 为 2 时，表示一个逻辑像素对应两个物理像素。
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