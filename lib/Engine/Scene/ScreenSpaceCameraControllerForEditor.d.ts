import { CameraEventType, KeyboardEventModifier } from '../../type';
import Scene from './Scene';
export default class ScreenSpaceCameraControllerForEditor {
    enableInputs: boolean;
    enableTranslate: boolean;
    enableZoom: boolean;
    enableRotate: boolean;
    enableTilt: boolean;
    enableLook: boolean;
    inertiaSpin: number;
    inertiaTranslate: number;
    inertiaZoom: number;
    maximumMovementRatio: number;
    bounceAnimationTime: number;
    minimumZoomDistance: number;
    maximumZoomDistance: number;
    translateEventTypes: CameraEventType;
    zoomEventTypes: CameraEventType[];
    rotateEventTypes: CameraEventType;
    tiltEventTypes: (CameraEventType | {
        eventType: CameraEventType;
        modifier: KeyboardEventModifier;
    })[];
    lookEventTypes: {
        eventType: CameraEventType;
        modifier: KeyboardEventModifier;
    };
    enableCollisionDetection: boolean;
    private _aggregator;
    private _lastInertiaSpinMovement;
    private _lastInertiaZoomMovement;
    private _lastInertiaTranslateMovement;
    private _lastInertiaTiltMovement;
    private _inertiaDisablers;
    private _rotateMousePosition;
    private _scene;
    get scene(): Scene;
    constructor(scene: Scene);
    update(): void;
    private _reactToInput;
    private _activateInertia;
    private _maintainInertia;
    private _update3D;
    private _spin3D;
    private _zoom3D;
    private _tilt3D;
    private _look3D;
    private _rotate3D;
}
