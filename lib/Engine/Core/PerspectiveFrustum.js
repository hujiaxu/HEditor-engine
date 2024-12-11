import PerspectiveOffCenterFrustum from './PerspectiveOffCenterFrustum';
export default class PerspectiveFrustum {
    _fov;
    _fovy;
    _aspectRatio;
    _near;
    _far;
    _xOffset;
    _yOffset;
    _offCenterFrustum;
    get fov() {
        return this._fov;
    }
    get fovy() {
        return this._fovy;
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
    get xOffset() {
        return this._xOffset;
    }
    get yOffset() {
        return this._yOffset;
    }
    get offCenterFrustum() {
        return this._offCenterFrustum;
    }
    constructor({ fov, aspectRatio, near, far, xOffset, yOffset }) {
        this._fov = fov;
        this._fovy = fov;
        this._aspectRatio = aspectRatio;
        this._near = near;
        this._far = far;
        this._xOffset = xOffset || 0;
        this._yOffset = yOffset || 0;
        const top = Math.tan(this._fov * 0.5);
        const bottom = -top;
        const right = this._aspectRatio * top;
        const left = -right;
        this._offCenterFrustum = new PerspectiveOffCenterFrustum({
            left,
            right,
            top,
            bottom,
            near: this._near,
            far: this._far
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
        if (frustum._aspectRatio !== this._aspectRatio ||
            frustum._fov !== this._fov ||
            frustum._near !== this._near ||
            frustum._far !== this._far ||
            frustum._xOffset !== this._xOffset ||
            frustum._yOffset !== this._yOffset) {
            if (frustum._fov < 0 || frustum._fov >= Math.PI) {
                throw new Error('fov must be in the range [0, PI)');
            }
            if (frustum._aspectRatio < 0) {
                throw new Error('aspect must be greater than 0');
            }
            if (frustum._near < 0 || frustum._near > frustum._far) {
                throw new Error('near must be in the range [0, far]');
            }
            this._aspectRatio = frustum._aspectRatio;
            this._fov = frustum._fov;
            this._fovy =
                frustum._aspectRatio <= 1
                    ? frustum._fov
                    : Math.atan(Math.tan(frustum._fov * 0.5) / frustum._aspectRatio) * 2.0;
            this._near = frustum._near;
            this._far = frustum._far;
            this._xOffset = frustum._xOffset;
            this._yOffset = frustum._yOffset;
            offCenterFrustum.top = Math.tan(this._fovy * 0.5) * this._near;
            offCenterFrustum.bottom = -offCenterFrustum.top;
            offCenterFrustum.right = this._aspectRatio * offCenterFrustum.top;
            offCenterFrustum.left = -offCenterFrustum.right;
            offCenterFrustum.near = this._near;
            offCenterFrustum.far = this._far;
            offCenterFrustum.right += this._xOffset;
            offCenterFrustum.left -= this._xOffset;
            offCenterFrustum.top += this._yOffset;
            offCenterFrustum.bottom -= this._yOffset;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc3BlY3RpdmVGcnVzdHVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1BlcnNwZWN0aXZlRnJ1c3R1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLDJCQUEyQixNQUFNLCtCQUErQixDQUFBO0FBRXZFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sa0JBQWtCO0lBQzdCLElBQUksQ0FBUTtJQUNaLEtBQUssQ0FBUTtJQUNiLFlBQVksQ0FBUTtJQUNwQixLQUFLLENBQVE7SUFDYixJQUFJLENBQVE7SUFDWixRQUFRLENBQVE7SUFDaEIsUUFBUSxDQUFRO0lBRWhCLGlCQUFpQixDQUE4QjtJQUV2RCxJQUFJLEdBQUc7UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDbEIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQzFCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUVELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7SUFDdEIsQ0FBQztJQUVELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0lBQy9CLENBQUM7SUFFRCxZQUFZLEVBQ1YsR0FBRyxFQUNILFdBQVcsRUFDWCxJQUFJLEVBQ0osR0FBRyxFQUNILE9BQU8sRUFDUCxPQUFPLEVBQ21CO1FBQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxD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