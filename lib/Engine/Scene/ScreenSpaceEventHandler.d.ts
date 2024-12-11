import { EventFunctionType, KeyboardEventModifier, ScreenSpaceEventType } from '../../type';
export default class ScreenSpaceEventHandler {
    static mouseEmulationIgnoreMilliseconds: number;
    static touchHoldDelayMillseconds: number;
    private _inputEvents;
    private _buttonDown;
    private _isPinching;
    private _isTouchHolding;
    private _lastSeenTouchEvent;
    private _primaryStartPosition;
    private _primaryPosition;
    private _primaryPreviousPosition;
    private _positions;
    private _previousPositions;
    private _removalFunctions;
    private _touchHoldTimer;
    private _clickPixelTolerance;
    private _holdPixelTolerance;
    private _isDestroyed;
    private _element;
    constructor(element: HTMLElement);
    private _unRigisterListeners;
    private _registerListeners;
    private _registerListener;
    private _handlePointerDown;
    private _handlePointerUp;
    private _handlePointerMove;
    private _handleMouseDown;
    private _handleMouseUp;
    private _handleMouseMove;
    private _handleTouchStart;
    private _handleTouchEnd;
    private _handleTouchMove;
    private _fireTouchEvents;
    private _fireTouchMoveEvents;
    private _handleDblClick;
    private _handleWheel;
    private _canProcessMouseEvent;
    private _cancelMouseEvent;
    private _getTouchEvent;
    private _getPosition;
    private _getModifier;
    private _getInputAction;
    setInputAction(action: EventFunctionType, type: ScreenSpaceEventType, modifier?: KeyboardEventModifier | undefined): void;
    destory(): void;
    isDestroyed(): boolean;
}
