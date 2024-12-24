import { CameraEventType, KeyboardEventModifier, ScreenSpaceEventType } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import defined from '../Core/Defined';
import HEditorMath from '../Core/Math';
import ScreenSpaceEventHandler from './ScreenSpaceEventHandler';
const getKey = (type, modifier) => {
    let key = type + '';
    if (modifier) {
        key += '+' + modifier;
    }
    return key;
};
export default class CameraEventAggregator {
    _eventHandler;
    _update = {};
    _movement = {};
    _lastMovement = {};
    _isDown = {};
    _eventStartPosition = {};
    _pressTime = {};
    _releaseTime = {};
    _buttonDown = 0;
    _currentMousePosition = new Cartesian2();
    get currentMousePosition() {
        return this._currentMousePosition;
    }
    constructor(canvas) {
        if (!canvas)
            throw new Error('canvas is required');
        this._eventHandler = new ScreenSpaceEventHandler(canvas);
        this._listenToWheel(this, undefined);
        this._listenToPinch(this, undefined, canvas);
        this._listenMouseButtonDownUp(this, undefined, CameraEventType.LEFT_DRAG);
        this._listenMouseButtonDownUp(this, undefined, CameraEventType.RIGHT_DRAG);
        this._listenMouseButtonDownUp(this, undefined, CameraEventType.MIDDLE_DRAG);
        this._listenMouseMove(this, undefined);
        for (const modifierName in KeyboardEventModifier) {
            const modifier = Number(KeyboardEventModifier[modifierName]);
            this._listenToWheel(this, modifier);
            this._listenToPinch(this, modifier, canvas);
            this._listenMouseButtonDownUp(this, modifier, CameraEventType.LEFT_DRAG);
            this._listenMouseButtonDownUp(this, modifier, CameraEventType.RIGHT_DRAG);
            this._listenMouseMove(this, modifier);
        }
    }
    _listenToWheel(aggregator, modifier) {
        const key = getKey(CameraEventType.WHEEL, modifier);
        const pressTime = aggregator._pressTime;
        const releaseTime = aggregator._releaseTime;
        const update = aggregator._update;
        update[key] = true;
        let movement = aggregator._movement[key];
        if (!defined(movement)) {
            movement = aggregator._movement[key] = {
                startPosition: new Cartesian2(),
                endPosition: new Cartesian2()
                // valid: false
            };
        }
        let lastMovement = aggregator._lastMovement[key];
        if (!defined(lastMovement)) {
            lastMovement = aggregator._lastMovement[key] = {
                startPosition: new Cartesian2(),
                endPosition: new Cartesian2(),
                valid: false
            };
        }
        aggregator._eventHandler.setInputAction((delta) => {
            const arcLength = 7.5 * HEditorMath.toRadians(delta);
            pressTime[key] = releaseTime[key] = new Date();
            movement.endPosition.x = 0.0;
            movement.endPosition.y = arcLength;
            Cartesian2.clone(movement.endPosition, lastMovement.endPosition);
            lastMovement.valid = true;
            update[key] = false;
        }, ScreenSpaceEventType.WHEEL, modifier);
    }
    _listenToPinch(aggregator, modifier, canvas) {
        const key = getKey(CameraEventType.PINCH, modifier);
        const update = aggregator._update;
        const isDown = aggregator._isDown;
        const eventStartPosition = aggregator._eventStartPosition;
        const pressTime = aggregator._pressTime;
        const releaseTime = aggregator._releaseTime;
        update[key] = true;
        isDown[key] = false;
        eventStartPosition[key] = new Cartesian2();
        let movement = aggregator._movement[key];
        movement = aggregator._movement[key] = {
            distance: {
                startPosition: new Cartesian2(),
                endPosition: new Cartesian2()
            },
            angleAndHeight: {
                startPosition: new Cartesian2(),
                endPosition: new Cartesian2()
            },
            prevAngle: 0.0
        };
        aggregator._eventHandler.setInputAction((e) => {
            aggregator._buttonDown++;
            isDown[key] = true;
            pressTime[key] = new Date();
            Cartesian2.lerp(e.position1, e.position2, 0.5, eventStartPosition[key]);
        }, ScreenSpaceEventType.PINCH_START, modifier);
        aggregator._eventHandler.setInputAction(() => {
            aggregator._buttonDown = Math.max(0, aggregator._buttonDown - 1);
            releaseTime[key] = new Date();
            isDown[key] = false;
        }, ScreenSpaceEventType.PINCH_END, modifier);
        aggregator._eventHandler.setInputAction((mouseMovement) => {
            if (isDown[key]) {
                if (!update[key]) {
                    Cartesian2.clone(mouseMovement.distance.endPosition, movement.distance.endPosition);
                    Cartesian2.clone(mouseMovement.angleAndHeight.endPosition, movement.angleAndHeight.endPosition);
                }
                else {
                    this._clonePinchMovement(mouseMovement, movement);
                    update[key] = false;
                    movement.prevAngle = movement.angleAndHeight.startPosition.x;
                }
                let angle = movement.angleAndHeight.endPosition.x;
                const prevAngle = movement.prevAngle;
                const TwoPI = Math.PI * 2.0;
                while (angle >= prevAngle + Math.PI) {
                    angle -= TwoPI;
                }
                while (angle < prevAngle - Math.PI) {
                    angle += TwoPI;
                }
                movement.angleAndHeight.endPosition.x =
                    (-angle * canvas.clientWidth) / 12;
                movement.angleAndHeight.startPosition.x =
                    (-prevAngle * canvas.clientWidth) / 12;
            }
        }, ScreenSpaceEventType.PINCH_MOVE, modifier);
    }
    _listenMouseButtonDownUp(aggregator, modifier, type) {
        const key = getKey(type, modifier);
        const isDown = aggregator._isDown;
        const eventStartPosition = aggregator._eventStartPosition;
        const pressTime = aggregator._pressTime;
        const releaseTime = aggregator._releaseTime;
        isDown[key] = false;
        eventStartPosition[key] = new Cartesian2();
        let lastMovement = aggregator._lastMovement[key];
        if (!defined(lastMovement)) {
            lastMovement = aggregator._lastMovement[key] = {
                startPosition: new Cartesian2(),
                endPosition: new Cartesian2(),
                valid: false
            };
        }
        let down, up;
        if (type === CameraEventType.LEFT_DRAG) {
            down = ScreenSpaceEventType.LEFT_DOWN;
            up = ScreenSpaceEventType.LEFT_UP;
        }
        else if (type === CameraEventType.RIGHT_DRAG) {
            down = ScreenSpaceEventType.RIGHT_DOWN;
            up = ScreenSpaceEventType.RIGHT_UP;
        }
        else if (type === CameraEventType.MIDDLE_DRAG) {
            down = ScreenSpaceEventType.MIDDLE_DOWN;
            up = ScreenSpaceEventType.MIDDLE_UP;
        }
        aggregator._eventHandler.setInputAction((event) => {
            aggregator._buttonDown++;
            lastMovement.valid = false;
            isDown[key] = true;
            pressTime[key] = new Date();
            Cartesian2.clone(event.position, eventStartPosition[key]);
        }, down, modifier);
        aggregator._eventHandler.setInputAction(() => {
            aggregator._buttonDown = Math.max(0, aggregator._buttonDown - 1);
            releaseTime[key] = new Date();
            isDown[key] = false;
        }, up, modifier);
    }
    _listenMouseMove(aggregator, modifier) {
        const update = aggregator._update;
        const movement = aggregator._movement;
        const lastMovement = aggregator._lastMovement;
        const isDown = aggregator._isDown;
        for (const typeName in CameraEventType) {
            const type = CameraEventType[typeName];
            if (defined(type)) {
                const key = getKey(type, modifier);
                update[key] = true;
                if (!defined(aggregator._lastMovement[key])) {
                    aggregator._lastMovement[key] = {
                        startPosition: new Cartesian2(),
                        endPosition: new Cartesian2(),
                        valid: false
                    };
                }
                if (!defined(aggregator._movement[key])) {
                    aggregator._movement[key] = {
                        startPosition: new Cartesian2(),
                        endPosition: new Cartesian2()
                    };
                }
            }
        }
        aggregator._eventHandler.setInputAction((mouseMovement) => {
            for (const typeName in CameraEventType) {
                const type = CameraEventType[typeName];
                if (defined(type)) {
                    const key = getKey(type, modifier);
                    if (isDown[key]) {
                        if (!update[key]) {
                            Cartesian2.clone(mouseMovement.endPosition, movement[key].endPosition);
                        }
                        else {
                            this._cloneMovement(movement[key], lastMovement[key]);
                            const lastMove = lastMovement[key];
                            lastMove.valid = true;
                            this._cloneMovement(mouseMovement, movement[key]);
                            update[key] = false;
                        }
                    }
                }
            }
            Cartesian2.clone(mouseMovement.endPosition, aggregator._currentMousePosition);
        }, ScreenSpaceEventType.MOUSE_MOVE, modifier);
    }
    _cloneMovement(movement, result) {
        Cartesian2.clone(movement.startPosition, result.startPosition);
        Cartesian2.clone(movement.endPosition, result.endPosition);
    }
    _clonePinchMovement(pinchMovement, result) {
        Cartesian2.clone(pinchMovement.distance.startPosition, result.distance.startPosition);
        Cartesian2.clone(pinchMovement.distance.endPosition, result.distance.endPosition);
        Cartesian2.clone(pinchMovement.angleAndHeight.startPosition, result.angleAndHeight.startPosition);
        Cartesian2.clone(pinchMovement.angleAndHeight.endPosition, result.angleAndHeight.endPosition);
    }
    isMoving(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        const key = getKey(type, modifier);
        return !this._update[key];
    }
    getMovement(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        const key = getKey(type, modifier);
        const movement = this._movement[key];
        return movement;
    }
    getLastMovement(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        const key = getKey(type, modifier);
        const lastMovement = this._lastMovement[key];
        if (lastMovement.valid) {
            return lastMovement;
        }
        return undefined;
    }
    getStartMousePosition(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        if (type === CameraEventType.WHEEL) {
            return this._currentMousePosition;
        }
        const key = getKey(type, modifier);
        return this._eventStartPosition[key];
    }
    getButtonPressTime(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        const key = getKey(type, modifier);
        return this._pressTime[key];
    }
    getButtonReleaseTime(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        const key = getKey(type, modifier);
        return this._releaseTime[key];
    }
    isButtonDown(type, modifier) {
        if (!defined(type)) {
            throw new Error('type is required');
        }
        const key = getKey(type, modifier);
        return this._isDown[key];
    }
    reset() {
        for (const name in this._update) {
            this._update[name] = true;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtZXJhRXZlbnRBZ2dyZWdhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9DYW1lcmFFdmVudEFnZ3JlZ2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFJckIsb0JBQW9CLEVBRXJCLE1BQU0sWUFBWSxDQUFBO0FBQ25CLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQTtBQUN0QyxPQUFPLHVCQUF1QixNQUFNLDJCQUEyQixDQUFBO0FBRS9ELE1BQU0sTUFBTSxHQUFHLENBQ2IsSUFBOEIsRUFDOUIsUUFBMkMsRUFDM0MsRUFBRTtJQUNGLElBQUksR0FBRyxHQUFXLElBQUksR0FBRyxFQUFFLENBQUE7SUFDM0IsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLEdBQUcsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxPQUFPLE9BQU8scUJBQXFCO0lBQ2hDLGFBQWEsQ0FBeUI7SUFFdEMsT0FBTyxHQUFXLEVBQUUsQ0FBQTtJQUNwQixTQUFTLEdBRWIsRUFBRSxDQUFBO0lBQ0UsYUFBYSxHQUVqQixFQUFFLENBQUE7SUFDRSxPQUFPLEdBQVcsRUFBRSxDQUFBO0lBQ3BCLG1CQUFtQixHQUF1QixFQUFFLENBQUE7SUFDNUMsVUFBVSxHQUFjLEVBQUUsQ0FBQTtJQUMxQixZQUFZLEdBQWMsRUFBRSxDQUFBO0lBRTVCLFdBQVcsR0FBRyxDQUFDLENBQUE7SUFDZixxQkFBcUIsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBRWhELElBQUksb0JBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFBO0lB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