import { OrthographicOffCenterFrustumOptions } from '../../type';
import Cartesian2 from './Cartesian2';
import Matrix4 from './Matrix4';
export default class OrthographicOffCenterFrustum {
    private _left;
    private _right;
    private _bottom;
    private _top;
    private _near;
    private _far;
    private _projectionMatrix;
    get left(): number;
    get right(): number;
    get bottom(): number;
    get top(): number;
    get near(): number;
    get far(): number;
    get projectionMatrix(): Matrix4;
    constructor({ left, right, bottom, top, near, far }: OrthographicOffCenterFrustumOptions);
    getPixelDimensions(drawingBufferWidth: number, drawingBufferHeight: number, distance: number, pixelRatio: number, result?: Cartesian2): Cartesian2;
    private _update;
}
