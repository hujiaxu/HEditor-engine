import { OrthographicFrustumOptions } from '../../type';
import Cartesian2 from './Cartesian2';
import OrthographicOffCenterFrustum from './OrthographicOffCenterFrustum';
export default class OrthographicFrustum {
    private _offCenterFrustum;
    private _width;
    private _aspectRatio;
    private _near;
    private _far;
    get offCenterFrustum(): OrthographicOffCenterFrustum;
    get width(): number;
    set width(value: number);
    get aspectRatio(): number;
    get near(): number;
    get far(): number;
    get projectionMatrix(): import("./Matrix4").default;
    constructor({ width, aspectRatio, near, far }: OrthographicFrustumOptions);
    getPixelDimensions(drawingBufferWidth: number, drawingBufferHeight: number, distance: number, pixelRatio: number, result?: Cartesian2): Cartesian2;
    private _update;
}
