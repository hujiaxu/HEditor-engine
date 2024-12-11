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
        if (FeatureDetection.supportsPointerEvents()) {
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