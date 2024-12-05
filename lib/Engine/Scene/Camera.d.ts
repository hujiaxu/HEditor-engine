import PerspectiveFrustum from './PerspectiveFrustum';
import Scene from './Scene';
export default class Camera {
    private _position;
    private _rotation;
    private _direction;
    private _up;
    private _right;
    scene: Scene;
    perspectiveFrustum: PerspectiveFrustum;
    constructor(scene: Scene);
}
