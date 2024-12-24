import { KeyboardEventModifier, MouseButton, ScreenSpaceEventType } from '../../type';
import AssociativeArray from '../Core/AssociativeArray';
import Cartesian2 from '../Core/Cartesian2';
import defined from '../Core/Defined';
import FeatureDetection from '../Core/FeatureDetection';
import getTimestamp from '../Core/GetTimestamp';
const checkPixelTolerance = (a, b, pixelTolerance) => {
    const xDiff = a.x - b.x;
    const yDiff = a.y - b.y;
    const totalPixels = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    return totalPixels < pixelTolerance;
};
const getKey = (type, modifier) => {
    let key = type + '';
    if (modifier) {
        key += '+' + modifier;
    }
    return key;
};
const mouseDownEvent = {
    position: new Cartesian2()
};
const mouseUpEvent = {
    position: new Cartesian2()
};
const mouseClickEvent = {
    position: new Cartesian2()
};
const mouseMoveEvent = {
    startPosition: new Cartesian2(),
    endPosition: new Cartesian2()
};
const mouseDblClickEvent = {
    position: new Cartesian2()
};
const touchStartEvent = {
    position: new Cartesian2()
};
const touch2StartEvent = {
    position1: new Cartesian2(),
    position2: new Cartesian2()
};
const touchEndEvent = {
    position: new Cartesian2()
};
const touchHoldEvent = {
    position: new Cartesian2()
};
const touchMoveEvent = {
    startPosition: new Cartesian2(),
    endPosition: new Cartesian2()
};
const touchPinchMovementEvent = {
    distance: {
        startPosition: new Cartesian2(),
        endPosition: new Cartesian2()
    },
    angleAndHeight: {
        startPosition: new Cartesian2(),
        endPosition: new Cartesian2()
    }
};
const touchClickEvent = {
    position: new Cartesian2()
};
export default class ScreenSpaceEventHandler {
    static mouseEmulationIgnoreMilliseconds;
    static touchHoldDelayMillseconds;
    _inputEvents = {};
    _buttonDown = {
        [MouseButton.LEFT]: false,
        [MouseButton.MIDDLE]: false,
        [MouseButton.RIGHT]: false
    };
    _isPinching = false;
    _isTouchHolding = false;
    _lastSeenTouchEvent = -ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds;
    _primaryStartPosition = new Cartesian2();
    _primaryPosition = new Cartesian2();
    _primaryPreviousPosition = new Cartesian2();
    _positions = new AssociativeArray();
    _previousPositions = new AssociativeArray();
    _removalFunctions = [];
    _touchHoldTimer = undefined;
    _clickPixelTolerance = 5;
    _holdPixelTolerance = 25;
    _isDestroyed = false;
    _element;
    constructor(element) {
        this._element = element || document;
        this._registerListeners(this);
    }
    _unRigisterListeners(handler) {
        handler._removalFunctions.forEach((func) => {
            func();
        });
    }
    _registerListeners(handler) {
        const element = handler._element;
        if (!FeatureDetection.supportsPointerEvents()) {
            this._registerListener(handler, 'pointerdown', element, handler._handlePointerDown);
            this._registerListener(handler, 'pointerup', element, handler._handlePointerUp);
            this._registerListener(handler, 'pointermove', element, handler._handlePointerMove);
            this._registerListener(handler, 'pointercancel', element, handler._handlePointerUp);
        }
        else {
            this._registerListener(handler, 'mousedown', element, handler._handleMouseDown);
            this._registerListener(handler, 'mouseup', element, handler._handleMouseUp);
            this._registerListener(handler, 'mousemove', element, handler._handleMouseMove);
            this._registerListener(handler, 'touchstart', element, handler._handleTouchStart);
            this._registerListener(handler, 'touchend', element, handler._handleTouchEnd);
            this._registerListener(handler, 'touchmove', element, handler._handleTouchMove);
            this._registerListener(handler, 'touchcancel', element, handler._handleTouchEnd);
        }
        this._registerListener(handler, 'dblclick', element, handler._handleDblClick);
        let wheelEvent;
        if ('onwheel' in element) {
            wheelEvent = 'wheel';
        }
        else {
            wheelEvent = 'DOMMouseScroll';
        }
        // else if (document.onmousewheel !== undefined) {
        //   wheelEvent = 'mousewheel'
        // }
        this._registerListener(handler, wheelEvent, element, handler._handleWheel);
    }
    _registerListener(handler, type, element, callback) {
        const listener = (event) => {
            callback(handler, event);
        };
        if (FeatureDetection.isInternetExplorer()) {
            element.addEventListener(type, listener, false);
        }
        else {
            element.addEventListener(type, listener, {
                passive: false,
                capture: false
            });
        }
        handler._removalFunctions.push(() => {
            element.removeEventListener(type, listener, false);
        });
    }
    _handlePointerDown(handler, event) {
        ;
        event.target.setPointerCapture(event.pointerId);
        if (event.pointerType === 'touch' && event instanceof TouchEvent) {
            const positions = handler._positions;
            const identifier = event.pointerId;
            positions.set(identifier, handler._getPosition(handler, event, new Cartesian2()));
            handler._fireTouchEvents(handler, event);
            const previousPositions = handler._previousPositions;
            previousPositions.set(identifier, Cartesian2.clone(positions.get(identifier)));
        }
        else {
            handler._handleMouseDown(handler, event);
        }
    }
    _handlePointerUp(handler, event) {
        if (event.pointerType === 'touch' && event instanceof TouchEvent) {
            const positions = handler._positions;
            const identifier = event.pointerId;
            positions.remove(identifier);
            handler._fireTouchEvents(handler, event);
            const previousPositions = handler._previousPositions;
            previousPositions.remove(identifier);
        }
        else {
            handler._handleMouseUp(handler, event);
        }
    }
    _handlePointerMove(handler, event) {
        if (event.pointerType === 'touch' && event instanceof TouchEvent) {
            const positions = handler._positions;
            const identifier = event.pointerId;
            const position = positions.get(identifier);
            if (!defined(position)) {
                return;
            }
            handler._getPosition(handler, event, position);
            handler._fireTouchMoveEvents(handler, event);
            const previousPositions = handler._previousPositions;
            Cartesian2.clone(positions.get(identifier), previousPositions.get(identifier));
        }
        else {
            handler._handleMouseMove(handler, event);
        }
    }
    _handleMouseDown(handler, event) {
        if (!handler._canProcessMouseEvent(handler)) {
            return;
        }
        const button = event.button;
        handler._buttonDown[button] = true;
        let screenSpaceEventType;
        if (button === MouseButton.LEFT) {
            screenSpaceEventType = ScreenSpaceEventType.LEFT_DOWN;
        }
        else if (button === MouseButton.MIDDLE) {
            screenSpaceEventType = ScreenSpaceEventType.MIDDLE_DOWN;
        }
        else if (button === MouseButton.RIGHT) {
            screenSpaceEventType = ScreenSpaceEventType.RIGHT_DOWN;
        }
        else {
            return;
        }
        const position = handler._getPosition(handler, event, handler._primaryPosition);
        Cartesian2.clone(position, handler._primaryStartPosition);
        Cartesian2.clone(position, handler._primaryPreviousPosition);
        const modifier = handler._getModifier(event);
        const action = handler._getInputAction(screenSpaceEventType, modifier);
        if (defined(action)) {
            Cartesian2.clone(position, mouseDownEvent.position);
            action(mouseDownEvent);
            event.preventDefault();
        }
    }
    _handleMouseUp(handler, event) {
        if (!handler._canProcessMouseEvent(handler)) {
            return;
        }
        const button = event.button;
        if (button !== MouseButton.LEFT &&
            button !== MouseButton.MIDDLE &&
            button !== MouseButton.RIGHT) {
            return;
        }
        if (handler._buttonDown[MouseButton.LEFT]) {
            handler._cancelMouseEvent(handler, ScreenSpaceEventType.LEFT_UP, ScreenSpaceEventType.LEFT_CLICK, event);
            handler._buttonDown[MouseButton.LEFT] = false;
        }
        if (handler._buttonDown[MouseButton.MIDDLE]) {
            handler._cancelMouseEvent(handler, ScreenSpaceEventType.MIDDLE_UP, ScreenSpaceEventType.MIDDLE_CLICK, event);
            handler._buttonDown[MouseButton.MIDDLE] = false;
        }
        if (handler._buttonDown[MouseButton.RIGHT]) {
            handler._cancelMouseEvent(handler, ScreenSpaceEventType.RIGHT_UP, ScreenSpaceEventType.RIGHT_CLICK, event);
            handler._buttonDown[MouseButton.RIGHT] = false;
        }
    }
    _handleMouseMove(handler, event) {
        if (!handler._canProcessMouseEvent(handler)) {
            return;
        }
        const modifier = handler._getModifier(event);
        const position = handler._getPosition(handler, event, handler._primaryPosition);
        const previousPosition = handler._primaryPreviousPosition;
        const action = handler._getInputAction(ScreenSpaceEventType.MOUSE_MOVE, modifier);
        if (defined(action)) {
            Cartesian2.clone(previousPosition, mouseMoveEvent.startPosition);
            Cartesian2.clone(position, mouseMoveEvent.endPosition);
            action(mouseMoveEvent);
        }
        Cartesian2.clone(position, previousPosition);
        if (handler._buttonDown[MouseButton.LEFT] ||
            handler._buttonDown[MouseButton.MIDDLE] ||
            handler._buttonDown[MouseButton.RIGHT]) {
            event.preventDefault();
        }
    }
    _handleTouchStart(handler, event) {
        handler._getTouchEvent(handler);
        const changedTouches = event.changedTouches;
        let touch, identifier;
        const positions = handler._positions;
        for (let i = 0; i < changedTouches.length; i++) {
            touch = changedTouches[i];
            identifier = touch.identifier;
            positions.set(identifier, handler._getPosition(handler, touch, new Cartesian2()));
        }
        handler._fireTouchEvents(handler, event);
        const previousPositions = handler._previousPositions;
        for (let i = 0; i < changedTouches.length; i++) {
            touch = changedTouches[i];
            identifier = touch.identifier;
            previousPositions.set(identifier, Cartesian2.clone(positions.get(identifier)));
        }
    }
    _handleTouchEnd(handler, event) {
        handler._getTouchEvent(handler);
        const changedTouches = event.changedTouches;
        let touch, identifier;
        const positions = handler._positions;
        const previousPositions = handler._previousPositions;
        for (let i = 0; i < changedTouches.length; i++) {
            touch = changedTouches[i];
            identifier = touch.identifier;
            positions.remove(identifier);
        }
        handler._fireTouchEvents(handler, event);
        for (let i = 0; i < changedTouches.length; i++) {
            touch = changedTouches[i];
            identifier = touch.identifier;
            previousPositions.remove(identifier);
        }
    }
    _handleTouchMove(handler, event) {
        handler._getTouchEvent(handler);
        const changedTouches = event.changedTouches;
        let touch, identifier;
        const positions = handler._positions;
        for (let i = 0; i < changedTouches.length; i++) {
            touch = changedTouches[i];
            identifier = touch.identifier;
            const position = positions.get(identifier);
            if (defined(position)) {
                handler._getPosition(handler, touch, position);
            }
        }
        handler._fireTouchMoveEvents(handler, event);
        const previousPositions = handler._previousPositions;
        for (let i = 0; i < changedTouches.length; i++) {
            touch = changedTouches[i];
            identifier = touch.identifier;
            Cartesian2.clone(positions.get(identifier), previousPositions.get(identifier));
        }
    }
    _fireTouchEvents(handler, event) {
        const modifier = handler._getModifier(event);
        const positions = handler._positions;
        const numberOfTouches = positions.length;
        let action, clickAction;
        const pinching = handler._isPinching;
        if (numberOfTouches !== 1 && handler._buttonDown[MouseButton.LEFT]) {
            handler._buttonDown[MouseButton.LEFT] = false;
            if (defined(handler._touchHoldTimer)) {
                clearTimeout(handler._touchHoldTimer);
                handler._touchHoldTimer = undefined;
            }
            action = handler._getInputAction(ScreenSpaceEventType.LEFT_UP, modifier);
            if (defined(action)) {
                Cartesian2.clone(handler._primaryPosition, touchEndEvent.position);
                action(touchEndEvent);
            }
            if (numberOfTouches === 0 && !handler._isTouchHolding) {
                action = handler._getInputAction(ScreenSpaceEventType.LEFT_CLICK, modifier);
                if (defined(action)) {
                    const startPosition = handler._primaryStartPosition;
                    const endPosition = handler._previousPositions.values[0];
                    if (checkPixelTolerance(startPosition, endPosition, handler._clickPixelTolerance)) {
                        Cartesian2.clone(handler._primaryPosition, touchClickEvent.position);
                        action(touchClickEvent);
                    }
                }
            }
            handler._isTouchHolding = false;
        }
        if (numberOfTouches === 0 && pinching) {
            handler._isPinching = false;
            action = handler._getInputAction(ScreenSpaceEventType.PINCH_END, modifier);
            if (defined(action)) {
                ;
                action();
            }
        }
        if (numberOfTouches === 1 && !pinching) {
            const position = positions.values[0];
            Cartesian2.clone(position, handler._primaryPosition);
            Cartesian2.clone(position, handler._primaryStartPosition);
            Cartesian2.clone(position, handler._primaryPreviousPosition);
            handler._buttonDown[MouseButton.LEFT] = true;
            action = handler._getInputAction(ScreenSpaceEventType.LEFT_DOWN, modifier);
            if (defined(action)) {
                Cartesian2.clone(position, touchStartEvent.position);
                action(touchStartEvent);
            }
            handler._touchHoldTimer = setTimeout(() => {
                if (!handler.isDestroyed()) {
                    handler._isTouchHolding = true;
                    handler._touchHoldTimer = undefined;
                    clickAction = handler._getInputAction(ScreenSpaceEventType.RIGHT_CLICK, modifier);
                    if (defined(clickAction)) {
                        const startPosition = handler._primaryStartPosition;
                        const endPosition = handler._previousPositions.values[0];
                        if (checkPixelTolerance(startPosition, endPosition, handler._holdPixelTolerance)) {
                            Cartesian2.clone(endPosition, touchHoldEvent.position);
                            clickAction(touchHoldEvent);
                        }
                    }
                }
            }, ScreenSpaceEventHandler.touchHoldDelayMillseconds);
            event.preventDefault();
        }
        if (numberOfTouches === 2 && !pinching) {
            handler._isPinching = true;
            action = handler._getInputAction(ScreenSpaceEventType.PINCH_START, modifier);
            if (defined(action)) {
                Cartesian2.clone(positions.values[0], touch2StartEvent.position1);
                Cartesian2.clone(positions.values[1], touch2StartEvent.position2);
                action(touch2StartEvent);
                event.preventDefault();
            }
        }
    }
    _fireTouchMoveEvents(handler, event) {
        const modifier = handler._getModifier(event);
        const positions = handler._positions;
        const previousPositions = handler._previousPositions;
        const numberOfTouches = positions.length;
        let action;
        if (numberOfTouches === 1 && handler._buttonDown[MouseButton.LEFT]) {
            const position = positions.values[0];
            Cartesian2.clone(position, handler._primaryPosition);
            const previousPosition = handler._primaryPreviousPosition;
            action = handler._getInputAction(ScreenSpaceEventType.MOUSE_MOVE, modifier);
            if (defined(action)) {
                Cartesian2.clone(previousPosition, touchMoveEvent.startPosition);
                Cartesian2.clone(position, touchMoveEvent.endPosition);
                action(touchMoveEvent);
            }
            Cartesian2.clone(position, previousPosition);
            event.preventDefault();
        }
        else if (numberOfTouches === 2 && handler._isPinching) {
            action = handler._getInputAction(ScreenSpaceEventType.PINCH_MOVE, modifier);
            if (defined(action)) {
                const position1 = positions.values[0];
                const position2 = positions.values[1];
                const previousPosition1 = previousPositions.values[0];
                const previousPosition2 = previousPositions.values[1];
                const dX = position2.x - position1.x;
                const dY = position2.y - position1.y;
                const dist = Math.sqrt(dX * dX + dY * dY) * 0.25;
                const prevDX = previousPosition2.x - previousPosition1.x;
                const prevDY = previousPosition2.y - previousPosition1.y;
                const prevDist = Math.sqrt(prevDX * prevDX + prevDY * prevDY) * 0.25;
                const cY = (position1.y + position2.y) * 0.125;
                const prevCY = (previousPosition1.y + previousPosition2.y) * 0.125;
                const angle = Math.atan2(dY, dX);
                const prevAngle = Math.atan2(prevDY, prevDX);
                Cartesian2.fromElements(0.0, prevDist, touchPinchMovementEvent.distance.startPosition);
                Cartesian2.fromElements(0.0, dist, touchPinchMovementEvent.distance.endPosition);
                Cartesian2.fromElements(prevAngle, prevCY, touchPinchMovementEvent.angleAndHeight.startPosition);
                Cartesian2.fromElements(angle, cY, touchPinchMovementEvent.angleAndHeight.endPosition);
            }
        }
    }
    _handleDblClick(handler, event) {
        const button = event.button;
        let screenSpaceEventType;
        if (button === MouseButton.LEFT) {
            screenSpaceEventType = ScreenSpaceEventType.LEFT_DOUBLE_CLICK;
        }
        else {
            return;
        }
        const modifier = handler._getModifier(event);
        const action = handler._getInputAction(screenSpaceEventType, modifier);
        if (defined(action)) {
            handler._getPosition(handler, event, mouseDblClickEvent.position);
            action(mouseDblClickEvent);
        }
    }
    _handleWheel(handler, event) {
        let delta;
        if (defined(event.deltaY)) {
            const deltaMode = event.deltaMode;
            if (deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
                delta = -event.deltaY;
            }
            else if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
                delta = -event.deltaY * 40;
            }
            else {
                delta = -event.deltaY * 120;
            }
        }
        else if (event.detail > 0) {
            delta = event.detail * -120;
        }
        else {
            // delta = event.wheelDelta
        }
        if (!defined(delta))
            return;
        const modifier = handler._getModifier(event);
        const action = handler._getInputAction(ScreenSpaceEventType.WHEEL, modifier);
        if (defined(action)) {
            ;
            action(delta);
            event.preventDefault();
        }
    }
    _canProcessMouseEvent(handler) {
        return (getTimestamp() - handler._lastSeenTouchEvent >
            ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds);
    }
    _cancelMouseEvent(handler, screenSpaceEventType, clickScreenSpaceEventType, event) {
        const modifier = handler._getModifier(event);
        const action = handler._getInputAction(screenSpaceEventType, modifier);
        const clickAction = handler._getInputAction(clickScreenSpaceEventType, modifier);
        if (defined(action) || defined(clickAction)) {
            const position = handler._getPosition(handler, event, handler._primaryPosition);
            if (defined(action)) {
                Cartesian2.clone(position, mouseUpEvent.position);
                action(mouseUpEvent);
            }
            if (defined(clickAction)) {
                const startPosition = handler._primaryStartPosition;
                if (checkPixelTolerance(startPosition, position, handler._clickPixelTolerance)) {
                    Cartesian2.clone(startPosition, mouseClickEvent.position);
                    clickAction(mouseClickEvent);
                }
            }
        }
    }
    _getTouchEvent(handler) {
        handler._lastSeenTouchEvent = getTimestamp();
    }
    _getPosition(handler, event, result) {
        const element = handler._element;
        if (element instanceof Document) {
            result.x = event.clientX;
            result.y = event.clientY;
            return result;
        }
        const rect = element.getBoundingClientRect();
        result.x = event.clientX - rect.left;
        result.y = event.clientY - rect.top;
        return result;
    }
    _getModifier(event) {
        if (event.shiftKey) {
            return KeyboardEventModifier.SHIFT;
        }
        else if (event.ctrlKey) {
            return KeyboardEventModifier.CTRL;
        }
        else if (event.altKey) {
            return KeyboardEventModifier.ALT;
        }
        return undefined;
    }
    _getInputAction(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required.');
        }
        const key = getKey(type, modifier);
        return this._inputEvents[key];
    }
    setInputAction(action, type, modifier) {
        if (!defined(action)) {
            throw new Error('action is required.');
        }
        if (!defined(type)) {
            throw new Error('type is required.');
        }
        const key = getKey(type, modifier);
        this._inputEvents[key] = action;
    }
    destory() {
        this._unRigisterListeners(this);
        this._isDestroyed = true;
    }
    isDestroyed() {
        return this._isDestroyed;
    }
}
ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 800;
ScreenSpaceEventHandler.touchHoldDelayMillseconds = 1500;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjcmVlblNwYWNlRXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJTCxxQkFBcUIsRUFDckIsV0FBVyxFQUdYLG9CQUFvQixFQUVyQixNQUFNLFlBQVksQ0FBQTtBQUNuQixPQUFPLGdCQUFnQixNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBRTNDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sZ0JBQWdCLE1BQU0sMEJBQTBCLENBQUE7QUFDdkQsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFFL0MsTUFBTSxtQkFBbUIsR0FBRyxDQUMxQixDQUFhLEVBQ2IsQ0FBYSxFQUNiLGNBQXNCLEVBQ3RCLEVBQUU7SUFDRixNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUE7SUFDNUQsT0FBTyxXQUFXLEdBQUcsY0FBYyxDQUFBO0FBQ3JDLENBQUMsQ0FBQTtBQUNELE1BQU0sTUFBTSxHQUFHLENBQ2IsSUFBbUMsRUFDbkMsUUFBMkMsRUFDM0MsRUFBRTtJQUNGLElBQUksR0FBRyxHQUFXLElBQUksR0FBRyxFQUFFLENBQUE7SUFDM0IsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLEdBQUcsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQTtBQUNa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