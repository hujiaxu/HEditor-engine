import { CameraEventType, KeyboardEventModifier } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import defaultValue from '../Core/DefaultValue';
import { defined } from '../Core/Defined';
import HEditorMath from '../Core/Math';
import Matrix4 from '../Core/Matrix4';
import OrthographicFrustum from '../Core/OrthographicFrustum';
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
    maximumMovementRatio = 0.1;
    bounceAnimationTime = 3.0;
    inertiaZoom = 1.0;
    _zoomFactor = 0.5;
    minimumZoomDistance = 1.0;
    maximumZoomDistance = Number.POSITIVE_INFINITY;
    translateEventTypes = CameraEventType.LEFT_DRAG;
    zoomEventTypes = [
        // CameraEventType.RIGHT_DRAG,
        CameraEventType.WHEEL
        // CameraEventType.PINCH
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
            // '_lastInertiaSpinMovement',
            '_lastInertiaTranslateMovement',
            '_lastInertiaTiltMovement'
        ],
        _lastInertiaTiltMovement: [
            '_lastInertiaSpinMovement',
            '_lastInertiaTranslateMovement'
        ]
    };
    _rotateMousePosition = new Cartesian2(-1, -1);
    _rotateFactor = 1.0;
    _rotateRateRangeAdjustment = 0;
    _maximumRotateRate = 1.77;
    _minimumRotateRate = 1.0 / 5.0;
    _horizontalRotationAxis = undefined;
    _tiltCenterMousePosition = new Cartesian2(-1, -1);
    _tiltOnEllipsoid = false;
    _looking = false;
    _scene;
    _ellipsoid;
    // private _cameraUnderground: boolean = false
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
        this._ellipsoid = scene.ellipsoid;
    }
    update() {
        // const radius = this._ellipsoid.maximumRadius
        const radius = 1;
        this._rotateFactor = 1.0 / radius;
        this._rotateRateRangeAdjustment = radius;
        this._update3D(this);
        this._aggregator.reset();
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
        controller._reactToInput(controller, controller.enableTranslate, controller.translateEventTypes, 
        // @ts-expect-error: _translate3D function has incompatible parameter types, but it's a known issue that will be fixed later
        controller._translate3D, controller.inertiaTranslate, '_lastInertiaTranslateMovement');
    }
    _translate3D(controller, startPosition, movement) {
        const scene = controller.scene;
        const camera = scene.camera;
        const deltaX = movement.endPosition.x - movement.startPosition.x;
        const deltaY = movement.endPosition.y - movement.startPosition.y;
        camera.moveUp(deltaY * controller.maximumMovementRatio);
        camera.moveLeft(deltaX * controller.maximumMovementRatio);
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
        // const canvas = scene.canvas
        // const cameraUnderground = controller._cameraUnderground
        // let windowPosition
        // if (cameraUnderground) {
        //   windowPosition = startPosition
        // } else {
        //   windowPosition = new Cartesian2(
        //     canvas.clientWidth / 2,
        //     canvas.clientHeight / 2
        //   )
        //   console.log(windowPosition, 'windowPosition')
        // }
        const diff = movement.endPosition.y -
            movement.startPosition.y;
        const distance = diff * controller._zoomFactor;
        console.log('distance: ', distance);
        camera.zoomIn(distance);
    }
    _tilt3D(controller, startPosition, movement) {
        const scene = controller.scene;
        const camera = scene.camera;
        if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
            return;
        }
        if (defined(movement.angleAndHeight)) {
            movement = movement.angleAndHeight;
        }
        if (!Cartesian2.equals(startPosition, controller._tiltCenterMousePosition)) {
            controller._tiltOnEllipsoid = false;
            controller._looking = false;
        }
        if (controller._tiltOnEllipsoid) {
            console.log(controller._tiltOnEllipsoid);
        }
        if (controller._looking) {
            const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position);
            controller._look3D(controller, startPosition, movement, up);
            return;
        }
    }
    _look3D(controller, startPosition, movement, rotationAxis) {
        const scene = controller.scene;
        const camera = scene.camera;
        const startPos = new Cartesian2();
        startPos.x = movement.startPosition.x;
        startPos.y = 0.0;
        const endPos = new Cartesian2();
        endPos.x = movement.endPosition.x;
        endPos.y = 0.0;
        let startRay = camera.getPickRay(startPos);
        let endRay = camera.getPickRay(endPos);
        let angle = 0.0;
        let start, end;
        if (camera.frustum instanceof OrthographicFrustum) {
            start = startRay.origin;
            end = endRay.origin;
            Cartesian3.add(camera.direction, start, start);
            Cartesian3.add(camera.direction, end, end);
            Cartesian3.subtract(start, camera.position, start);
            Cartesian3.subtract(end, camera.position, end);
            Cartesian3.normalize(start, start);
            Cartesian3.normalize(end, end);
        }
        else {
            start = startRay.direction;
            end = endRay.direction;
        }
        let dot = Cartesian3.dot(start, end);
        if (dot < 1.0) {
            angle = Math.acos(dot);
        }
        angle = movement.startPosition.x > movement.endPosition.x ? -angle : angle;
        const horizontalRotationAxis = controller._horizontalRotationAxis;
        if (defined(rotationAxis)) {
            camera.look(rotationAxis, angle);
        }
        else if (defined(horizontalRotationAxis)) {
            camera.look(horizontalRotationAxis, -angle);
        }
        else {
            camera.lookLeft(angle);
        }
        startPos.x = 0.0;
        startPos.y = movement.startPosition.y;
        endPos.x = 0.0;
        endPos.y = movement.endPosition.y;
        startRay = camera.getPickRay(startPos);
        endRay = camera.getPickRay(endPos);
        angle = 0.0;
        if (camera.frustum instanceof OrthographicFrustum) {
            start = startRay.origin;
            end = endRay.origin;
            Cartesian3.add(camera.direction, start, start);
            Cartesian3.add(camera.direction, end, end);
            Cartesian3.subtract(start, camera.position, start);
            Cartesian3.subtract(end, camera.position, end);
            Cartesian3.normalize(start, start);
            Cartesian3.normalize(end, end);
        }
        else {
            start = startRay.direction;
            end = endRay.direction;
        }
        dot = Cartesian3.dot(start, end);
        if (dot < 1.0) {
            angle = Math.acos(dot);
        }
        angle = movement.startPosition.y > movement.endPosition.y ? -angle : angle;
        rotationAxis = defaultValue(rotationAxis, horizontalRotationAxis);
        if (defined(rotationAxis)) {
            const direction = camera.direction;
            const negativeRotationAxis = Cartesian3.negate(rotationAxis);
            const northParallel = Cartesian3.equalsEpsilon(direction, rotationAxis, HEditorMath.EPSILON2);
            const southParallel = Cartesian3.equalsEpsilon(direction, negativeRotationAxis, HEditorMath.EPSILON2);
            if (!northParallel && !southParallel) {
                dot = Cartesian3.dot(direction, rotationAxis);
                let angleToAxis = HEditorMath.acosClamped(dot);
                if (angle > 0 && angle > angleToAxis) {
                    angle = angleToAxis - HEditorMath.EPSILON4;
                }
                dot = Cartesian3.dot(direction, negativeRotationAxis);
                angleToAxis = HEditorMath.acosClamped(dot);
                if (angle < 0 && -angle > angleToAxis) {
                    angle = -angleToAxis + HEditorMath.EPSILON4;
                }
                const tangent = Cartesian3.cross(rotationAxis, direction);
                camera.look(tangent, angle);
            }
            else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
                camera.look(camera.right, -angle);
            }
        }
        else {
            camera.lookUp(angle);
        }
    }
    _rotate3D(controller, startPosition, movement, constrainedAxis, rotateOnlyVertical, rotateOnlyHorizontal) {
        rotateOnlyVertical = defaultValue(rotateOnlyVertical, false);
        rotateOnlyHorizontal = defaultValue(rotateOnlyHorizontal, false);
        const scene = controller.scene;
        const camera = scene.camera;
        const canvas = scene.canvas;
        const oldAxis = camera.constrainedAxis;
        if (defined(constrainedAxis)) {
            camera.constrainedAxis = constrainedAxis;
        }
        const rho = Cartesian3.magnitude(camera.position);
        let rotateRate = controller._rotateFactor * (rho - controller._rotateRateRangeAdjustment);
        if (rotateRate > controller._maximumRotateRate) {
            rotateRate = controller._maximumRotateRate;
        }
        if (rotateRate < controller._minimumRotateRate) {
            rotateRate = controller._minimumRotateRate;
        }
        let phiWindowRatio = (movement.startPosition.x - movement.endPosition.x) / canvas.clientWidth;
        let thetaWindowRatio = (movement.startPosition.y - movement.endPosition.y) / canvas.clientHeight;
        phiWindowRatio = Math.min(phiWindowRatio, controller.maximumMovementRatio);
        thetaWindowRatio = Math.min(thetaWindowRatio, controller.maximumMovementRatio);
        const deltaPhi = rotateRate * phiWindowRatio * Math.PI * 2.0;
        const deltaTheta = rotateRate * thetaWindowRatio * Math.PI;
        if (!rotateOnlyVertical) {
            camera.rotateRight(-deltaPhi);
        }
        if (!rotateOnlyHorizontal) {
            camera.rotateUp(-deltaTheta);
        }
        camera.constrainedAxis = oldAxis;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyRm9yRWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9TY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXJGb3JFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFLdEIsTUFBTSxZQUFZLENBQUE7QUFDbkIsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBRXpDLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQTtBQUN0QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLG1CQUFtQixNQUFNLDZCQUE2QixDQUFBO0FBQzdELE9BQU8scUJBQXFCLE1BQU0seUJBQXlCLENBQUE7QUFHM0QsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLFFBQWtCLEVBQUUsRUFBRTtJQUMvQyxPQUFPLFVBQVUsQ0FBQyxhQUFhLENBQzdCLFFBQVEsQ0FBQyxhQUFhLEVBQ3RCLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFdBQVcsQ0FBQyxTQUFTLENBQ3RCLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxNQUFNLEtBQUssR0FBRyxDQUFDLElBQVksRUFBRSxXQUFtQixFQUFFLEVBQUU7SUFDbEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNaLENBQUM7SUFFRCxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDdEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FB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