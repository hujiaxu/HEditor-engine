import { CameraEventType, KeyboardEventModifier } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import defaultValue from '../Core/DefaultValue';
import { defined } from '../Core/Defined';
import HEditorMath from '../Core/Math';
import Matrix4 from '../Core/Matrix4';
import CameraEventAggregator from './CameraEventAggregator';
const sameMousePosition = (movement) => {
    return Cartesian2.equalsEpsilon(movement.startPosition, movement.endPosition, HEditorMath.EPSILON14);
};
const decay = (time, coefficient) => {
    if (time < 0) {
        return 0.0;
    }
    const tau = (1.0 - coefficient) * 25.0;
    return Math.exp(-tau / time);
};
const inertiaMaxClickTimeThreshold = 0.4;
export default class ScreenSpaceCameraControllerForEditor {
    enableInputs = true;
    enableTranslate = true;
    enableZoom = true;
    enableRotate = true;
    enableTilt = true;
    enableLook = true;
    inertiaSpin = 0.9;
    inertiaTranslate = 0.9;
    inertiaZoom = 0.9;
    maximumMovementRatio = 0.1;
    bounceAnimationTime = 3.0;
    minimumZoomDistance = 1.0;
    maximumZoomDistance = Number.POSITIVE_INFINITY;
    translateEventTypes = CameraEventType.LEFT_DRAG;
    zoomEventTypes = [
        CameraEventType.RIGHT_DRAG,
        CameraEventType.WHEEL,
        CameraEventType.PINCH
    ];
    rotateEventTypes = CameraEventType.RIGHT_DRAG;
    tiltEventTypes = [
        CameraEventType.MIDDLE_DRAG,
        CameraEventType.PINCH,
        {
            eventType: CameraEventType.LEFT_DRAG,
            modifier: KeyboardEventModifier.CTRL
        },
        {
            eventType: CameraEventType.RIGHT_DRAG,
            modifier: KeyboardEventModifier.CTRL
        }
    ];
    lookEventTypes = {
        eventType: CameraEventType.LEFT_DRAG,
        modifier: KeyboardEventModifier.SHIFT
    };
    enableCollisionDetection = true;
    _aggregator;
    _lastInertiaSpinMovement = undefined;
    _lastInertiaZoomMovement = undefined;
    _lastInertiaTranslateMovement = undefined;
    _lastInertiaTiltMovement = undefined;
    _inertiaDisablers = {
        _lastInertiaZoomMovement: [
            '_lastInertiaSpinMovement',
            '_lastInertiaTranslateMovement',
            '_lastInertiaTiltMovement'
        ],
        _lastInertiaTiltMovement: [
            '_lastInertiaSpinMovement',
            '_lastInertiaTranslateMovement'
        ]
    };
    _rotateMousePosition = new Cartesian2(-1, -1);
    _scene;
    get scene() {
        return this._scene;
    }
    constructor(scene) {
        if (!defined(scene)) {
            throw new Error('scene is required');
        }
        this._scene = scene;
        const canvas = scene.canvas;
        this._aggregator = new CameraEventAggregator(canvas);
    }
    update() {
        this._update3D(this);
    }
    _reactToInput(controller, enabled, eventTypes, action, inertiaConstant, inertiaStateName) {
        if (!defined(eventTypes))
            return;
        const aggregator = controller._aggregator;
        if (!Array.isArray(eventTypes)) {
            eventTypes = [eventTypes];
        }
        const length = eventTypes.length;
        for (let i = 0; i < length; i++) {
            const eventType = eventTypes[i];
            const type = (defined(eventType.eventType)
                ? eventType.eventType
                : eventType);
            const modifier = eventType.modifier || undefined;
            const movement = aggregator.isMoving(type, modifier) &&
                aggregator.getMovement(type, modifier);
            const startPosition = aggregator.getStartMousePosition(type, modifier);
            if (controller.enableInputs && enabled) {
                if (movement) {
                    action(controller, startPosition, movement);
                    controller._activateInertia(controller, inertiaStateName);
                }
                else if (inertiaConstant && inertiaConstant < 1.0) {
                    controller._maintainInertia(aggregator, type, modifier, inertiaConstant, action, controller, inertiaStateName);
                }
            }
        }
    }
    _activateInertia(controller, inertiaStateName) {
        if (defined(inertiaStateName)) {
            let movementState = controller[inertiaStateName];
            if (defined(movementState)) {
                movementState.inertiaEnabled = true;
            }
            const inertiasToDisable = controller._inertiaDisablers[inertiaStateName];
            if (defined(inertiasToDisable)) {
                const length = inertiasToDisable.length;
                for (let i = 0; i < length; i++) {
                    const inertiaType = inertiasToDisable[i];
                    movementState = controller[inertiaType];
                    if (defined(movementState)) {
                        movementState.inertiaEnabled = false;
                    }
                }
            }
        }
    }
    _maintainInertia(aggregator, type, modifier, decayCoef, action, object, inertiaStateName) {
        let movementState = inertiaStateName && object[inertiaStateName];
        if (!defined(movementState) && inertiaStateName) {
            movementState = object[inertiaStateName] = {
                startPosition: new Cartesian2(),
                endPosition: new Cartesian2(),
                motion: new Cartesian2(),
                inertiaEnabled: true
            };
        }
        const ts = aggregator.getButtonPressTime(type, modifier);
        const tr = aggregator.getButtonReleaseTime(type, modifier);
        const threshold = ts && tr && (tr.getTime() - ts.getTime()) * 1000.0;
        const now = new Date();
        const fromNow = tr && (now.getTime() - tr.getTime()) / 1000.0;
        if (ts && tr && threshold < inertiaMaxClickTimeThreshold) {
            const d = decay(fromNow, decayCoef);
            const lastMovement = aggregator.getLastMovement(type, modifier);
            if (!defined(lastMovement) ||
                sameMousePosition(lastMovement) ||
                !movementState?.inertiaEnabled) {
                return;
            }
            movementState.motion.x =
                (lastMovement.endPosition.x - lastMovement.startPosition.x) * 0.5;
            movementState.motion.y =
                (lastMovement.endPosition.y - lastMovement.startPosition.y) * 0.5;
            movementState.startPosition = Cartesian2.clone(lastMovement.startPosition, movementState.startPosition);
            movementState.endPosition = Cartesian2.multiplyByScalar(movementState.motion, d, movementState.endPosition);
            movementState.endPosition = Cartesian2.add(movementState.startPosition, movementState.endPosition, movementState.endPosition);
            if (isNaN(movementState.endPosition.x) ||
                isNaN(movementState.endPosition.y) ||
                Cartesian2.distance(movementState.startPosition, movementState.endPosition) < 0.5) {
                return;
            }
            if (!aggregator.isButtonDown(type, modifier)) {
                const startPosition = aggregator.getStartMousePosition(type, modifier);
                action(object, startPosition, movementState);
            }
        }
    }
    _update3D(controller) {
        controller._reactToInput(controller, controller.enableRotate, controller.rotateEventTypes, 
        // @ts-expect-error: _spin3D function has incompatible parameter types, but it's a known issue that will be fixed later
        controller._spin3D, controller.inertiaSpin, '_lastInertiaSpinMovement');
        controller._reactToInput(controller, controller.enableZoom, controller.zoomEventTypes, controller._zoom3D, controller.inertiaZoom, '_lastInertiaZoomMovement');
        controller._reactToInput(controller, controller.enableTilt, controller.tiltEventTypes, controller._tilt3D, controller.inertiaSpin, '_lastInertiaTiltMovement');
        controller._reactToInput(controller, controller.enableLook, controller.lookEventTypes, 
        // @ts-expect-error: _look3D function has incompatible parameter types, but it's a known issue that will be fixed later
        controller._look3D);
    }
    _spin3D(controller, startPosition, movement) {
        const scene = controller.scene;
        const camera = scene.camera;
        if (!Matrix4.equals(camera.viewMatrix, Matrix4.IDENTITY)) {
            controller._rotate3D(controller, startPosition, movement);
            return;
        }
        Cartesian2.clone(startPosition, controller._rotateMousePosition);
    }
    _zoom3D(controller, startPosition, movement) {
        if (defined(movement.distance)) {
            movement = movement.distance;
        }
        // const inertiaMovement = (movement as LastInertiaConstructor).inertiaEnabled
        const scene = controller.scene;
        const camera = scene.camera;
        camera.updateViewMatrix(camera);
        // const canvas = scene.canvas
    }
    _tilt3D(controller, startPosition, movement) {
        const scene = controller.scene;
        const camera = scene.camera;
        camera.updateViewMatrix(camera);
        console.log(startPosition, movement);
    }
    _look3D(controller, startPosition, movement) {
        const scene = controller.scene;
        const camera = scene.camera;
        camera.updateViewMatrix(camera);
        console.log(startPosition, movement);
    }
    _rotate3D(controller, startPosition, movement, constrainedAxis, rotateOnlyVertical, rotateOnlyHorizontal) {
        rotateOnlyVertical = defaultValue(rotateOnlyVertical, false);
        rotateOnlyHorizontal = defaultValue(rotateOnlyHorizontal, false);
        if (rotateOnlyVertical || rotateOnlyHorizontal) {
            console.log(startPosition, movement);
        }
        const scene = controller.scene;
        const camera = scene.camera;
        // const canvas = scene.canvas
        const oldAxis = camera.constrainedAxis;
        if (defined(constrainedAxis)) {
            camera.constrainedAxis = constrainedAxis;
        }
        camera.constrainedAxis = oldAxis;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyRm9yRWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9TY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXJGb3JFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFLdEIsTUFBTSxZQUFZLENBQUE7QUFDbkIsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFFM0MsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3pDLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQTtBQUN0QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLHFCQUFxQixNQUFNLHlCQUF5QixDQUFBO0FBRzNELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxRQUFrQixFQUFFLEVBQUU7SUFDL0MsT0FBTyxVQUFVLENBQUMsYUFBYSxDQUM3QixRQUFRLENBQUMsYUFBYSxFQUN0QixRQUFRLENBQUMsV0FBVyxFQUNwQixXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFZLEVBQUUsV0FBbUIsRUFBRSxFQUFFO0lBQ2xELElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDO0lBRUQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQTtBQUM5QixDQUFDLENBQUE7QUFDRCxNQUFNLDRCQUE0QixHQUFHLEdBQUcsQ0FBQTtBQUV4QyxNQUFNLENB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