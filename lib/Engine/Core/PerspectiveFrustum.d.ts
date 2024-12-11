import { PerspectiveFrustumOptions } from '../../type';
import Cartesian2 from './Cartesian2';
import PerspectiveOffCenterFrustum from './PerspectiveOffCenterFrustum';
export default class PerspectiveFrustum {
    private _fov;
    private _fovy;
    private _aspectRatio;
    private _near;
    private _far;
    private _xOffset;
    private _yOffset;
    private _offCenterFrustum;
    get fov(): number;
    get fovy(): number;
    get aspectRatio(): number;
    get near(): number;
    get far(): number;
    get xOffset(): number;
    get yOffset(): number;
    get offCenterFrustum(): PerspectiveOffCenterFrustum;
    constructor({ fov, aspectRatio, near, far, xOffset, yOffset }: PerspectiveFrustumOptions);
    get projectionMatrix(): import("./Matrix4").default;
    getPixelDimensions(drawingBufferWidth: number, drawingBufferHeight: number, distance: number, pixelRatio: number, result?: Cartesian2): Cartesian2;
    update(frustum: PerspectiveFrustum): void;
}
