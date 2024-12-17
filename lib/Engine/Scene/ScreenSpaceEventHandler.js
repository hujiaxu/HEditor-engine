import { KeyboardEventModifier, MouseButton, ScreenSpaceEventType } from '../../type';
import AssociativeArray from '../Core/AssociativeArray';
import Cartesian2 from '../Core/Cartesian2';
import { defined } from '../Core/Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjcmVlblNwYWNlRXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJTCxxQkFBcUIsRUFDckIsV0FBVyxFQUdYLG9CQUFvQixFQUVyQixNQUFNLFlBQVksQ0FBQTtBQUNuQixPQUFPLGdCQUFnQixNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBRTNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLGdCQUFnQixNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBRS9DLE1BQU0sbUJBQW1CLEdBQUcsQ0FDMUIsQ0FBYSxFQUNiLENBQWEsRUFDYixjQUFzQixFQUN0QixFQUFFO0lBQ0YsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFBO0lBQzVELE9BQU8sV0FBVyxHQUFHLGNBQWMsQ0FBQTtBQUNyQyxDQUFDLENBQUE7QUFDRCxNQUFNLE1BQU0sR0FBRyxDQUNiLElBQW1DLEVBQ25DLFFBQTJDLEVBQzNDLEVBQUU7SUFDRixJQUFJLEdBQUcsR0FBVyxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQzNCLElBQUksUUFBUSxFQUFFLENBQUM7UUFDYixHQUFHLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQTtJQUN2QixDQUFDO0lBRUQsT0FBTyxHQUFH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