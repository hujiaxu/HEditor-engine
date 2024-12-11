import { CameraEventType, KeyboardEventModifier, Movement, PinchMovement } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
export default class CameraEventAggregator {
    private _eventHandler;
    private _update;
    private _movement;
    private _lastMovement;
    private _isDown;
    private _eventStartPosition;
    private _pressTime;
    private _releaseTime;
    private _buttonDown;
    private _currentMousePosition;
    get currentMousePosition(): Cartesian2;
    constructor(canvas: HTMLCanvasElement);
    private _listenToWheel;
    private _listenToPinch;
    private _listenMouseButtonDownUp;
    private _listenMouseMove;
    private _cloneMovement;
    private _clonePinchMovement;
    isMoving(type: CameraEventType, modifier: KeyboardEventModifier | undefined): boolean;
    getMovement(type: CameraEventType, modifier: KeyboardEventModifier | undefined): PinchMovement | Movement;
    getLastMovement(type: CameraEventType, modifier: KeyboardEventModifier | undefined): Movement | undefined;
    getStartMousePosition(type: CameraEventType, modifier: KeyboardEventModifier | undefined): Cartesian2;
    getButtonPressTime(type: CameraEventType, modifier: KeyboardEventModifier | undefined): Date;
    getButtonReleaseTime(type: CameraEventType, modifier: KeyboardEventModifier | undefined): Date;
    isButtonDown(type: CameraEventType, modifier: KeyboardEventModifier | undefined): boolean;
}
