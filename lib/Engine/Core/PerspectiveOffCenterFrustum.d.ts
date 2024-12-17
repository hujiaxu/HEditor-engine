import { PerspectiveOffCenterFrustumOptions } from '../../type';
import Cartesian2 from './Cartesian2';
import Matrix4 from './Matrix4';
export default class PerspectiveOffCenterFrustum {
    private _left;
    private _right;
    private _top;
    private _bottom;
    private _near;
    private _far;
    private _projectionMatrix;
    get projectionMatrix(): Matrix4;
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    constructor({ left, right, top, bottom, near, far }: PerspectiveOffCenterFrustumOptions);
    getPixelDimensions(drawingBufferWidth: number, drawingBufferHeight: number, distance: number, pixelRatio: number, result?: Cartesian2): Cartesian2;
    private _update;
}
