import PerspectiveOffCenterFrustum from './PerspectiveOffCenterFrustum';
export default class PerspectiveFrustum {
    _fov = 0.0;
    _fovy = 0.0;
    _aspectRatio = 0.0;
    _near = 0.0;
    _far = 0.0;
    _xOffset = 0.0;
    _yOffset = 0.0;
    _offCenterFrustum;
    fov = 0.0;
    fovy = 0.0;
    aspectRatio = 0.0;
    near = 0.0;
    far = 0.0;
    xOffset = 0.0;
    yOffset = 0.0;
    get offCenterFrustum() {
        return this._offCenterFrustum;
    }
    constructor({ fov, aspectRatio, near, far, xOffset, yOffset }) {
        this.fov = fov;
        this.fovy = fov;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;
        this.xOffset = xOffset || 0;
        this.yOffset = yOffset || 0;
        this._offCenterFrustum = new PerspectiveOffCenterFrustum({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            near,
            far
        });
    }
    get projectionMatrix() {
        this.update(this);
        return this._offCenterFrustum.projectionMatrix;
    }
    getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, pixelRatio, result) {
        this.update(this);
        return this._offCenterFrustum.getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, pixelRatio, result);
    }
    update(frustum) {
        const offCenterFrustum = this._offCenterFrustum;
        if (frustum.aspectRatio !== this._aspectRatio ||
            frustum.fov !== this._fov ||
            frustum.near !== this._near ||
            frustum.far !== this._far ||
            frustum.xOffset !== this._xOffset ||
            frustum.yOffset !== this._yOffset) {
            if (frustum.fov < 0 || frustum.fov >= Math.PI) {
                throw new Error('fov must be in the range [0, PI)');
            }
            if (frustum.aspectRatio < 0) {
                throw new Error('aspect must be greater than 0');
            }
            if (frustum.near < 0 || frustum.near > frustum.far) {
                throw new Error('near must be in the range [0, far]');
            }
            this._aspectRatio = frustum.aspectRatio;
            this._fov = frustum.fov;
            this._fovy =
                frustum._aspectRatio <= 1
                    ? frustum.fov
                    : Math.atan(Math.tan(frustum.fov * 0.5) / frustum.aspectRatio) * 2.0;
            this._near = frustum.near;
            this._far = frustum.far;
            this._xOffset = frustum.xOffset;
            this._yOffset = frustum.yOffset;
            offCenterFrustum.top = Math.tan(this._fovy * 0.5) * this.near;
            offCenterFrustum.bottom = -offCenterFrustum.top;
            offCenterFrustum.right = this.aspectRatio * offCenterFrustum.top;
            offCenterFrustum.left = -offCenterFrustum.right;
            offCenterFrustum.near = this.near;
            offCenterFrustum.far = this.far;
            offCenterFrustum.right += this.xOffset;
            offCenterFrustum.left -= this.xOffset;
            offCenterFrustum.top += this.yOffset;
            offCenterFrustum.bottom -= this.yOffset;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc3BlY3RpdmVGcnVzdHVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1BlcnNwZWN0aXZlRnJ1c3R1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLDJCQUEyQixNQUFNLCtCQUErQixDQUFBO0FBRXZFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sa0JBQWtCO0lBQzdCLElBQUksR0FBVyxHQUFHLENBQUE7SUFDbEIsS0FBSyxHQUFXLEdBQUcsQ0FBQTtJQUNuQixZQUFZLEdBQVcsR0FBRyxDQUFBO0lBQzFCLEtBQUssR0FBVyxHQUFHLENBQUE7SUFDbkIsSUFBSSxHQUFXLEdBQUcsQ0FBQTtJQUNsQixRQUFRLEdBQVcsR0FBRyxDQUFBO0lBQ3RCLFFBQVEsR0FBVyxHQUFHLENBQUE7SUFFdEIsaUJBQWlCLENBQThCO0lBRWhELEdBQUcsR0FBVyxHQUFHLENBQUE7SUFDakIsSUFBSSxHQUFXLEdBQUcsQ0FBQTtJQUNsQixXQUFXLEdBQVcsR0FBRyxDQUFBO0lBQ3pCLElBQUksR0FBVyxHQUFHLENBQUE7SUFDbEIsR0FBRyxHQUFXLEdBQUcsQ0FBQTtJQUNqQixPQUFPLEdBQVcsR0FBRyxDQUFBO0lBQ3JCLE9BQU8sR0FBVyxHQUFHLENBQUE7SUFFNUIsSUFBSSxnQkFBZ0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDL0IsQ0FBQztJQUVELFlBQVksRUFDVixHQUFHLEVBQ0gsV0FBVyxFQUNYLElBQUksRUFDSixHQUFHLEVBQ0gsT0FBTyxFQUNQLE9BQU8sRUFDbUI7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQTtRQUNmLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO1FBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUcs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