import { CameraEventType, KeyboardEventModifier } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import defaultValue from '../Core/DefaultValue';
import defined from '../Core/Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyRm9yRWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9TY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXJGb3JFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFLdEIsTUFBTSxZQUFZLENBQUE7QUFDbkIsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFFckMsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sbUJBQW1CLE1BQU0sNkJBQTZCLENBQUE7QUFDN0QsT0FBTyxxQkFBcUIsTUFBTSx5QkFBeUIsQ0FBQTtBQUczRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsUUFBa0IsRUFBRSxFQUFFO0lBQy9DLE9BQU8sVUFBVSxDQUFDLGFBQWEsQ0FDN0IsUUFBUSxDQUFDLGFBQWEsRUFDdEIsUUFBUSxDQUFDLFdBQVcsRUFDcEIsV0FBVyxDQUFDLFNBQVMsQ0FDdEIsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBWSxFQUFFLFdBQW1CLEVBQUUsRUFBRTtJQUNsRCxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1osQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUN0QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUE7QUFD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