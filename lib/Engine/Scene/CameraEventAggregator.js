import { CameraEventType, KeyboardEventModifier, ScreenSpaceEventType } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import { defined } from '../Core/Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtZXJhRXZlbnRBZ2dyZWdhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9DYW1lcmFFdmVudEFnZ3JlZ2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFJckIsb0JBQW9CLEVBRXJCLE1BQU0sWUFBWSxDQUFBO0FBQ25CLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFDdEMsT0FBTyx1QkFBdUIsTUFBTSwyQkFBMkIsQ0FBQTtBQUUvRCxNQUFNLE1BQU0sR0FBRyxDQUNiLElBQThCLEVBQzlCLFFBQTJDLEVBQzNDLEVBQUU7SUFDRixJQUFJLEdBQUcsR0FBVyxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQzNCLElBQUksUUFBUSxFQUFFLENBQUM7UUFDYixHQUFHLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQTtJQUN2QixDQUFDO0lBRUQsT0FBTyxHQUFHLENBQUE7QUFDWixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxPQUFPLHFCQUFxQjtJQUNoQyxhQUFhLENBQXlCO0lBRXRDLE9BQU8sR0FBVyxFQUFFLENBQUE7SUFDcEIsU0FBUyxHQUViLEVBQUUsQ0FBQTtJQUNFLGFBQWEsR0FFakIsRUFBRSxDQUFBO0lBQ0UsT0FBTyxHQUFXLEVBQUUsQ0FBQTtJQUNwQixtQkFBbUIsR0FBdUIsRUFBRSxDQUFBO0lBQzVDLFVBQVUsR0FBYyxFQUFFLENBQUE7SUFDMUIsWUFBWSxHQUFjLEVBQUUsQ0FBQTtJQUU1QixXQUFXLEdBQUcsQ0FBQyxDQUFBO0lBQ2YscUJBQXFCLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUVoRCxJQUFJLG9CQUFvQjtRQUN0QixPQUFPLElBQUksQ0FBQyxxQkFB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