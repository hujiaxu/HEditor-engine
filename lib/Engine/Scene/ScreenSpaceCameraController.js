import { CameraEventType, KeyboardEventModifier, SceneMode } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import Cartesian4 from '../Core/Cartesian4';
import Cartographic from '../Core/Cartographic';
import defaultValue from '../Core/DefaultValue';
import { defined } from '../Core/Defined';
import Ellipsoid from '../Core/Ellipsoid';
import IntersectionTests from '../Core/IntersectionTests';
import HEditorMath from '../Core/Math';
import Matrix3 from '../Core/Matrix3';
import Matrix4 from '../Core/Matrix4';
import Quaternion from '../Core/Quaternion';
import Ray from '../Core/Ray';
import Transforms from '../Core/Transforms';
import CameraEventAggregator from './CameraEventAggregator';
import OrthographicFrustum from '../Core/OrthographicFrustum';
import Plane from '../Core/Plane';
import HeadingPitchRoll from '../Core/HeadingPitchRoll';
import SceneTransforms from './SceneTransforms';
let preIntersectionDistance = 0;
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
const pickGlobeScrachRay = new Ray();
const scratchNormal = new Cartesian3();
const spin3DPick = new Cartesian3();
const pan3DP0 = Cartesian4.clone(Cartesian4.UNIT_W);
const pan3DP1 = Cartesian4.clone(Cartesian4.UNIT_W);
const pan3DStartMousePosition = new Cartesian2();
const pan3DEndMousePosition = new Cartesian2();
const pan3DPixelDimentions = new Cartesian2();
const panRay = new Ray();
const pan3dDiffMousePosition = new Cartesian2();
const scratchCameraPositionNormal = new Cartesian3();
const pan3DTemp0 = new Cartesian3();
const pan3DTemp1 = new Cartesian3();
const pan3DTemp2 = new Cartesian3();
const pan3DTemp3 = new Cartesian3();
const zoomCVWindowPos = new Cartesian2();
const zoomCVWindowRay = new Ray();
const zoom3DCartographic = new Cartographic();
const tilt3DRay = new Ray();
const inertiaMaxClickTimeThreshold = 0.4;
export default class ScreenSpaceCameraController {
    enableInputs = true;
    enableZoom = true;
    enableTranslate = true;
    enableRotate = true;
    enableTilt = true;
    enableLook = true;
    inertiaSpin = 0.9;
    inertiaTranslate = 0.9;
    inertiaZoom = 0.8;
    maximumMovementRatio = 0.1;
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
    // private _tweens = new TweenCollection()
    // private _tween = undefined
    _tiltCenterMousePosition = new Cartesian2(-1.0, -1.0);
    _tiltCenter = new Cartesian3();
    _rotateMousePosition = new Cartesian2(-1.0, -1.0);
    _rotateStartPosition = new Cartesian3();
    _strafeStartPosition = new Cartesian3();
    // private _strafeMousePosition = new Cartesian2()
    _strafeEndMousePosition = new Cartesian2();
    _zoomMouseStart = new Cartesian2(-1.0, -1.0);
    _zoomWorldPosition = new Cartesian3();
    _useZoomWorldPosition = false;
    _panLastMousePosition = new Cartesian2();
    _panLastWorldPosition = new Cartesian3();
    // private _tiltCVOffMap = false
    _looking = false;
    _rotating = false;
    _strafing = false;
    _zoomingUnderground = false;
    _zoomingOnVector = false;
    _rotatingZoom = false;
    // private _adnustedHeightForTerrain = false
    _cameraUnderground = false;
    _tiltOnEllipsoid = false;
    _zoomFactor = 5.0;
    _rotateFactor = 1.0;
    _rotateRateRangeAdjustment = 1.0;
    _maximumRotateRate = 1.77;
    // private minimumRotateRate = 1.0 / 5000.0
    _minimumZoomRate = 20.0;
    _maximumZoomRate = 5906376272000.0; // distance from the Sun to Pluto in meters.
    _minimumUndergroundPickDistance = 2000.0;
    _maximumUndergroundPickDistance = 10000.0;
    _ellipsoid;
    _horizontalRotationAxis = new Cartesian3();
    _scene;
    _globe = undefined;
    _minimumPickingTerrainHeight;
    minimumPickingTerrainHeight;
    minimumPickingTerrainDistanceWithInertia;
    minimumCollisionTerrainHeight;
    minimumTrackBallHeight;
    _adjustedHeightForTerrain = false;
    _minimumCollisionTerrainHeight;
    _lastGlobeHeight;
    constructor(scene) {
        if (!scene) {
            throw new Error('scene is required');
        }
        this._scene = scene;
        const ellipsoid = defaultValue(scene.ellipsoid, Ellipsoid.default);
        this._ellipsoid = ellipsoid;
        this.minimumPickingTerrainHeight = Ellipsoid.WGS84.equals(ellipsoid)
            ? 150000.0
            : ellipsoid.minimumRadius * 0.025;
        this._minimumPickingTerrainHeight = this.minimumPickingTerrainHeight;
        this.minimumPickingTerrainDistanceWithInertia = Ellipsoid.WGS84.equals(ellipsoid)
            ? 4000.0
            : ellipsoid.minimumRadius * 0.00063;
        this.minimumCollisionTerrainHeight = Ellipsoid.WGS84.equals(ellipsoid)
            ? 150000.0
            : ellipsoid.minimumRadius * 0.0025;
        this._minimumCollisionTerrainHeight = this.minimumCollisionTerrainHeight;
        this.minimumTrackBallHeight = Ellipsoid.WGS84.equals(ellipsoid)
            ? 7500000.0
            : ellipsoid.minimumRadius * 1.175;
        this._aggregator = new CameraEventAggregator(scene.canvas);
        this._lastGlobeHeight = 0.0;
    }
    update() {
        // const { camera } = this._scene
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
                    if ('startPosition' in movement) {
                        action(controller, startPosition, movement);
                    }
                    else {
                        action(controller, startPosition, movement);
                    }
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
    _continueStrafing(controller, movement) {
        const originalEndPosition = movement.endPosition;
        const inertialDelta = Cartesian2.subtract(movement.endPosition, movement.startPosition, new Cartesian2());
        const endPosition = controller._strafeEndMousePosition;
        Cartesian2.add(endPosition, inertialDelta, endPosition);
        movement.endPosition = endPosition;
        controller._strafe(controller, movement, controller._strafeStartPosition);
        movement.endPosition = originalEndPosition;
    }
    _strafe(controller, movement, startPosition) {
        const scene = controller._scene;
        const camera = scene.camera;
        const ray = camera.getPickRay(movement.endPosition);
        let direction = Cartesian3.clone(camera.direction);
        const plane = Plane.fromPointNormal(startPosition, direction);
        const intersection = IntersectionTests.rayPlane(ray, plane);
        if (!defined(intersection))
            return;
        direction = Cartesian3.subtract(startPosition, intersection, direction);
        Cartesian3.add(camera.position, direction, camera.position);
    }
    _spin3D(controller, startPosition, movement) {
        const scene = controller._scene;
        const camera = scene.camera;
        const cameraUnderground = controller._cameraUnderground;
        let ellipsoid = controller._ellipsoid;
        if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
            controller._rotate3D(controller, startPosition, movement);
            return;
        }
        let magnitude, radii;
        const up = ellipsoid.geodeticSurfaceNormal(camera.position);
        if (Cartesian2.equals(startPosition, controller._rotateMousePosition)) {
            if (controller._looking) {
                controller._look3D(controller, startPosition, movement, up);
            }
            else if (controller._rotating) {
                controller._rotate3D(controller, startPosition, movement);
            }
            else if (controller._strafing) {
                controller._continueStrafing(controller, movement);
            }
            else {
                if (Cartesian3.magnitude(camera.position) <
                    Cartesian3.magnitude(controller._rotateStartPosition)) {
                    return;
                }
                magnitude = Cartesian3.magnitude(controller._rotateStartPosition);
                radii = new Cartesian3();
                radii.x = radii.y = radii.z = magnitude;
                ellipsoid = Ellipsoid.fromCartesian3(radii);
                controller._pan3D(controller, startPosition, movement, ellipsoid);
            }
            return;
        }
        controller._looking = false;
        controller._rotating = false;
        controller._strafing = false;
        const height = ellipsoid.cartesianToCartographic(camera.positionWC)?.height || 0;
        const globe = controller._globe;
        if (defined(globe) &&
            defined(height) &&
            height < controller.minimumPickingTerrainHeight) {
            const mousePos = controller._pickPosition(controller, movement.startPosition);
            if (defined(mousePos)) {
                let strafing = false;
                const ray = camera.getPickRay(movement.startPosition, pickGlobeScrachRay);
                if (cameraUnderground) {
                    strafing = false;
                    controller._getStrafeStartPositionUnderground(controller, ray, mousePos, mousePos);
                }
                else {
                    const normal = ellipsoid.geodeticSurfaceNormal(mousePos, scratchNormal) ||
                        new Cartesian3(0.0, 0.0, 1.0);
                    const tangentPick = normal && Math.abs(Cartesian3.dot(ray.direction, normal)) < 0.05;
                    if (tangentPick) {
                        strafing = true;
                    }
                    else {
                        strafing =
                            Cartesian3.magnitude(camera.position) <
                                Cartesian3.magnitude(mousePos);
                    }
                }
                if (strafing) {
                    Cartesian2.clone(startPosition, controller._strafeEndMousePosition);
                    Cartesian3.clone(mousePos, controller._strafeStartPosition);
                    controller._strafing = true;
                    controller._strafe(controller, movement, controller._strafeStartPosition);
                }
                else {
                    magnitude = Cartesian3.magnitude(mousePos);
                    radii = new Cartesian3();
                    radii.x = radii.y = radii.z = magnitude;
                    ellipsoid = Ellipsoid.fromCartesian3(radii);
                    controller._pan3D(controller, startPosition, movement, ellipsoid);
                    Cartesian3.clone(mousePos, controller._rotateStartPosition);
                }
            }
            else {
                controller._looking = true;
                controller._look3D(controller, startPosition, movement, up);
            }
        }
        else if (defined(camera.pickEllipsoid(movement.startPosition, controller._ellipsoid, spin3DPick))) {
            controller._pan3D(controller, startPosition, movement, controller._ellipsoid);
            Cartesian3.clone(spin3DPick, controller._rotateStartPosition);
        }
        else if (height > controller.minimumTrackBallHeight) {
            controller._rotating = true;
            controller._rotate3D(controller, startPosition, movement);
        }
        else {
            controller._looking = true;
            controller._look3D(controller, startPosition, movement, up);
        }
        Cartesian2.clone(startPosition, controller._rotateMousePosition);
    }
    _rotate3D(controller, startPosition, movement, constrainedAxis, rotateOnlyVertical, rotateOnlyHorizontal) {
        rotateOnlyVertical = defaultValue(rotateOnlyVertical, false);
        rotateOnlyHorizontal = defaultValue(rotateOnlyHorizontal, false);
        const scene = controller._scene;
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
        let phiWindowRatio = (movement.startPosition.x - movement.endPosition.x) / canvas.clientWidth;
        let thetaWindowRatio = (movement.startPosition.y - movement.endPosition.y) / canvas.clientHeight;
        phiWindowRatio = Math.min(phiWindowRatio, controller.maximumMovementRatio);
        thetaWindowRatio = Math.min(thetaWindowRatio, controller.maximumMovementRatio);
        const deltaPhi = rotateRate * phiWindowRatio * Math.PI * 2.0;
        const deltaTheta = rotateRate * thetaWindowRatio * Math.PI;
        if (!rotateOnlyVertical) {
            camera.rotateLeft(deltaPhi);
            console.log('deltaPhi: ', deltaPhi);
        }
        if (!rotateOnlyHorizontal) {
            camera.rotateUp(deltaTheta);
        }
        camera.constrainedAxis = oldAxis;
    }
    _pan3D(controller, startPosition, movement, ellipsoid) {
        const scene = controller._scene;
        const camera = scene.camera;
        const startMousePosition = Cartesian2.clone(movement.startPosition, pan3DStartMousePosition);
        const endMousePosition = Cartesian2.clone(movement.endPosition, pan3DEndMousePosition);
        const height = ellipsoid.cartesianToCartographic(camera.position)?.height || 0.0;
        let p0, p1;
        if (!movement.inertiaEnabled &&
            height < controller.minimumPickingTerrainHeight) {
            p0 = Cartesian3.clone(controller._panLastWorldPosition, pan3DP0);
            if (!defined(controller._globe) &&
                !Cartesian2.equalsEpsilon(startMousePosition, controller._panLastMousePosition)) {
                p0 = controller._pickPosition(controller, startMousePosition, pan3DP0);
            }
            if (!defined(controller._globe) && defined(p0)) {
                const toCenter = Cartesian3.subtract(p0, camera.positionWC, pan3DTemp1);
                const toCenterProj = Cartesian3.multiplyByScalar(camera.directionWC, Cartesian3.dot(camera.directionWC, toCenter), pan3DTemp1);
                const distanceToNearPlane = Cartesian3.magnitude(toCenterProj);
                const pixelDimensions = camera.frustum.getPixelDimensions(scene.drawingBufferWidth, scene.drawingBufferHeight, distanceToNearPlane, scene.pixelRatio, pan3DPixelDimentions);
                const dragDelta = Cartesian2.subtract(endMousePosition, startMousePosition, pan3dDiffMousePosition);
                const right = Cartesian3.multiplyByScalar(camera.rightWC, dragDelta.x * pixelDimensions.x, pan3DTemp1);
                const cameraPositionNormal = Cartesian3.normalize(camera.positionWC, scratchCameraPositionNormal);
                const endPickDirection = camera.getPickRay(endMousePosition, panRay)?.direction;
                const endPickProj = Cartesian3.subtract(endPickDirection, Cartesian3.projectVector(endPickDirection, camera.rightWC, pan3DTemp2), pan3DTemp2);
                const angle = Cartesian3.angleBetween(endPickProj, camera.directionWC);
                let forward = 1.0;
                if (defined(camera.frustum.fov)) {
                    forward = Math.max(Math.tan(angle), 0.1);
                }
                let dot = Math.abs(Cartesian3.dot(camera.directionWC, cameraPositionNormal));
                const magnitude = ((-dragDelta.y * pixelDimensions.y * 2.0) / Math.sqrt(forward)) *
                    (1.0 - dot);
                const direction = Cartesian3.multiplyByScalar(endPickDirection, magnitude, pan3DTemp2);
                dot = Math.abs(Cartesian3.dot(camera.upWC, cameraPositionNormal));
                const up = Cartesian3.multiplyByScalar(camera.upWC, -dragDelta.y * (1.0 - dot) * pixelDimensions.y, pan3DTemp3);
                p1 = Cartesian3.add(p0, right, pan3DP1);
                p1 = Cartesian3.add(p1, direction, p1);
                p1 = Cartesian3.add(p1, up, p1);
                Cartesian3.clone(p1, controller._panLastWorldPosition);
                Cartesian2.clone(endMousePosition, controller._panLastMousePosition);
            }
        }
        if (!defined(p0) || !defined(p1)) {
            p0 = camera.pickEllipsoid(startMousePosition, ellipsoid);
            p1 = camera.pickEllipsoid(endMousePosition, ellipsoid);
        }
        if (!defined(p0) || !defined(p1)) {
            controller._rotating = true;
            controller._rotate3D(controller, startPosition, movement);
            return;
        }
        p0 = camera.worldToCameraCoordinates(p0, p0);
        p1 = camera.worldToCameraCoordinates(p1, p1);
        if (!defined(camera.constrainedAxis)) {
            Cartesian3.normalize(p0, p0);
            Cartesian3.normalize(p1, p1);
            const dot = Cartesian3.dot(p0, p1);
            const axis = Cartesian3.cross(p0, p1, pan3DTemp0);
            if (dot < 1.0 &&
                !Cartesian3.equalsEpsilon(axis, Cartesian3.ZERO, HEditorMath.EPSILON14)) {
                const angle = Math.acos(dot);
                camera.rotate(axis, angle);
            }
        }
        else {
            const basis0 = camera.constrainedAxis;
            const basis1 = Cartesian3.mostOrthogonalAxis(basis0, pan3DTemp0);
            Cartesian3.cross(basis1, basis0, basis1);
            Cartesian3.normalize(basis1, basis1);
            const basis2 = Cartesian3.cross(basis0, basis1, pan3DTemp1);
            const startRho = Cartesian3.magnitude(p0);
            const startDot = Cartesian3.dot(basis0, p0);
            const startTheta = Math.acos(startDot / startRho);
            const startRej = Cartesian3.multiplyByScalar(basis0, startDot, pan3DTemp2);
            Cartesian3.subtract(p0, startRej, startRej);
            Cartesian3.normalize(startRej, startRej);
            const endRho = Cartesian3.magnitude(p1);
            const endDot = Cartesian3.dot(basis0, p1);
            const endTheta = Math.acos(endDot / endRho);
            const endRej = Cartesian3.multiplyByScalar(basis0, endDot, pan3DTemp3);
            Cartesian3.subtract(p1, endRej, endRej);
            Cartesian3.normalize(endRej, endRej);
            let startPhi = Math.acos(Cartesian3.dot(startRej, basis1));
            if (Cartesian3.dot(startRej, basis2) < 0) {
                startPhi = HEditorMath.TWO_PI - startPhi;
            }
            let endPhi = Math.acos(Cartesian3.dot(endRej, basis1));
            if (Cartesian3.dot(endRej, basis2) < 0) {
                endPhi = HEditorMath.TWO_PI - endPhi;
            }
            const deltaPhi = endPhi - startPhi;
            let east;
            if (Cartesian3.equalsEpsilon(basis0, camera.position, HEditorMath.EPSILON2)) {
                east = camera.right;
            }
            else {
                east = Cartesian3.cross(basis0, camera.position, pan3DTemp0);
            }
            const planeNormal = Cartesian3.cross(basis0, east, pan3DTemp0);
            const side0 = Cartesian3.dot(planeNormal, Cartesian3.subtract(p0, basis0, pan3DTemp1));
            const side1 = Cartesian3.dot(planeNormal, Cartesian3.subtract(p1, basis0, pan3DTemp1));
            let deltaTheta;
            if (side0 > 0 && side1 > 0) {
                deltaTheta = endTheta - startTheta;
            }
            else if (side0 > 0 && side1 <= 0) {
                if (Cartesian3.dot(camera.position, basis0) > 0) {
                    deltaTheta = -startTheta - endTheta;
                }
                else {
                    deltaTheta = startTheta + endTheta;
                }
            }
            else {
                deltaTheta = startTheta - endTheta;
            }
            camera.rotateRight(deltaPhi);
            camera.rotateUp(deltaTheta);
        }
    }
    _zoom3D(controller, startPosition, movement) {
        if (defined(movement.distance)) {
            movement = movement.distance;
        }
        const inertiaMovement = movement.inertiaEnabled;
        const ellipsoid = controller._ellipsoid;
        const scene = controller._scene;
        const camera = scene.camera;
        const canvas = scene.canvas;
        const cameraUnderground = controller._cameraUnderground;
        let windowPosition;
        if (cameraUnderground) {
            windowPosition = startPosition;
        }
        else {
            windowPosition = zoomCVWindowPos;
            windowPosition.x = canvas.clientWidth / 2;
            windowPosition.y = canvas.clientHeight / 2;
        }
        const ray = camera.getPickRay(windowPosition, zoomCVWindowRay);
        let intersection;
        const height = ellipsoid.cartesianToCartographic(camera.position, zoom3DCartographic)
            ?.height || 0;
        const approachingCollision = Math.abs(preIntersectionDistance) <
            controller.minimumPickingTerrainDistanceWithInertia;
        const needPickGlobe = inertiaMovement
            ? approachingCollision
            : height < controller._minimumPickingTerrainHeight;
        if (needPickGlobe) {
            intersection = controller._pickPosition(controller, windowPosition);
        }
        let distance;
        if (defined(intersection)) {
            distance = Cartesian3.distance(ray.origin, intersection);
            preIntersectionDistance = distance;
        }
        if (cameraUnderground) {
            const distanceUnderground = controller._getZoomDistanceUnderground(controller, ray);
            if (defined(distance)) {
                distance = Math.min(distance, distanceUnderground);
            }
            else {
                distance = distanceUnderground;
            }
        }
        if (!defined(distance)) {
            distance = height;
        }
        const unitPosition = Cartesian3.normalize(camera.position);
        controller._handleZoom(controller, startPosition, movement, controller._zoomFactor, distance, Cartesian3.dot(unitPosition, camera.direction));
    }
    _handleZoom(object, startPosition, movement, zoomFactor, distanceMeasure, unitPositionDotDirection) {
        let percentage = 1.0;
        if (defined(unitPositionDotDirection)) {
            percentage = HEditorMath.clamp(Math.abs(unitPositionDotDirection), 0.25, 1.0);
        }
        const diff = movement.endPosition.y - movement.startPosition.y;
        const approachingSurface = diff > 0;
        const minHeight = approachingSurface
            ? object.minimumZoomDistance * percentage
            : 0;
        const maxHeight = object.maximumZoomDistance;
        const minDistance = distanceMeasure - minHeight;
        let zoomRate = zoomFactor * minDistance;
        zoomRate = HEditorMath.clamp(zoomRate, object._minimumZoomRate, object._maximumZoomRate);
        let rangeWindowRatio = diff / object._scene.canvas.clientHeight;
        rangeWindowRatio = Math.min(rangeWindowRatio, object.maximumMovementRatio);
        let distance = zoomRate * rangeWindowRatio;
        if (object.enableCollisionDetection ||
            object.minimumZoomDistance === 0.0 ||
            !defined(object._globe)) {
            if (distance > 0.0 && Math.abs(distanceMeasure - minHeight) < 1.0) {
                return;
            }
            if (distance < 0.0 && Math.abs(distanceMeasure - maxHeight) < 1.0) {
                return;
            }
            if (distanceMeasure - distance < minHeight) {
                distance = distanceMeasure - minHeight - 1.0;
            }
            else if (distanceMeasure - distance > maxHeight) {
                distance = distanceMeasure - maxHeight;
            }
        }
        const scene = object._scene;
        const camera = scene.camera;
        const mode = scene.mode;
        const orientation = new HeadingPitchRoll();
        orientation.heading = camera.heading;
        orientation.pitch = camera.pitch;
        orientation.roll = camera.roll;
        if (camera.frustum instanceof OrthographicFrustum) {
            if (Math.abs(distance) > 0.0) {
                camera.zoomIn(distance);
                camera._adjustOrthographicFrustum(true);
            }
            return;
        }
        const sameStartPosition = defaultValue(movement.inertiaEnabled, Cartesian2.equals(startPosition, object._zoomMouseStart));
        let zoomingOnVector = object._zoomingOnVector;
        let rotatingZoom = object._rotatingZoom;
        let pickedPosition;
        if (!sameStartPosition) {
            object._zoomMouseStart = Cartesian2.clone(startPosition, object._zoomMouseStart);
            if (defined(object._globe)) {
                pickedPosition = object._pickPosition(object, startPosition);
            }
            if (defined(pickedPosition)) {
                object._useZoomWorldPosition = true;
                object._zoomWorldPosition = Cartesian3.clone(pickedPosition, object._zoomWorldPosition);
            }
            else {
                object._useZoomWorldPosition = false;
            }
            zoomingOnVector = object._zoomingOnVector = false;
            rotatingZoom = object._rotatingZoom = false;
            object._zoomingUnderground = object._cameraUnderground;
        }
        if (!object._useZoomWorldPosition) {
            camera.zoomIn(distance);
            return;
        }
        let zoomOnVector = false;
        if (camera.positionCartographic.height < 2000000) {
            rotatingZoom = true;
        }
        if (!sameStartPosition || rotatingZoom) {
            const cameraPositionNormal = Cartesian3.normalize(camera.position);
            if (object._cameraUnderground ||
                object._zoomingUnderground ||
                (camera.positionCartographic.height < 3000.0 &&
                    Math.abs(Cartesian3.dot(camera.direction, cameraPositionNormal)) <
                        0.6)) {
                zoomOnVector = true;
            }
            else {
                const canvas = scene.canvas;
                const centerPixel = new Cartesian2();
                centerPixel.x = canvas.clientWidth / 2;
                centerPixel.y = canvas.clientHeight / 2;
                const centerPosition = object._pickPosition(object, centerPixel);
                if (!defined(centerPosition)) {
                    zoomOnVector = true;
                }
                else if (camera.positionCartographic.height < 1000000.0) {
                    if (Cartesian3.dot(camera.direction, cameraPositionNormal) >= -0.5) {
                        zoomOnVector = true;
                    }
                    else {
                        const cameraPosition = new Cartesian3();
                        Cartesian3.clone(camera.position, cameraPosition);
                        const target = object._zoomWorldPosition;
                        const targetNormal = Cartesian3.normalize(target);
                        if (Cartesian3.dot(targetNormal, cameraPositionNormal) < 0.0) {
                            return;
                        }
                        const center = new Cartesian3();
                        const forward = new Cartesian3();
                        Cartesian3.clone(camera.direction, forward);
                        Cartesian3.add(cameraPosition, Cartesian3.multiplyByScalar(forward, 1000), center);
                        const positionToTarget = new Cartesian3();
                        const positionToTargetNormal = new Cartesian3();
                        Cartesian3.subtract(target, cameraPosition, positionToTarget);
                        Cartesian3.normalize(positionToTarget, positionToTargetNormal);
                        const alphaDot = Cartesian3.dot(cameraPositionNormal, positionToTargetNormal);
                        if (alphaDot >= 0.0) {
                            object._zoomMouseStart.x = -1;
                            return;
                        }
                        const alpha = Math.acos(-alphaDot);
                        const cameraDistance = Cartesian3.magnitude(cameraPosition);
                        const targetDistance = Cartesian3.magnitude(target);
                        const remainingDistance = cameraDistance - distance;
                        const positionToTargetDistance = Cartesian3.magnitude(positionToTarget);
                        const gamma = Math.asin(HEditorMath.clamp((positionToTargetDistance / targetDistance) * Math.sin(alpha), -1.0, 1.0));
                        const delta = Math.asin(HEditorMath.clamp((remainingDistance / cameraDistance) * Math.sin(alpha), -1.0, 1.0));
                        const beta = gamma - delta + alpha;
                        const up = new Cartesian3();
                        Cartesian3.normalize(cameraPosition, up);
                        let right = new Cartesian3();
                        right = Cartesian3.cross(positionToTargetNormal, up, right);
                        right = Cartesian3.normalize(right, right);
                        Cartesian3.normalize(Cartesian3.cross(up, right), forward);
                        Cartesian3.multiplyByScalar(Cartesian3.normalize(center), Cartesian3.magnitude(center) - distance, center);
                        Cartesian3.normalize(cameraPosition, cameraPosition);
                        Cartesian3.multiplyByScalar(cameraPosition, remainingDistance, cameraPosition);
                        const pMid = new Cartesian3();
                        Cartesian3.multiplyByScalar(Cartesian3.add(Cartesian3.multiplyByScalar(up, Math.cos(beta) - 1), Cartesian3.multiplyByScalar(forward, Math.sin(beta))), remainingDistance, pMid);
                        Cartesian3.add(cameraPosition, pMid, cameraPosition);
                        Cartesian3.normalize(center, up);
                        Cartesian3.normalize(Cartesian3.cross(up, right), forward);
                        const cMid = new Cartesian3();
                        Cartesian3.multiplyByScalar(Cartesian3.add(Cartesian3.multiplyByScalar(up, Math.cos(beta) - 1), Cartesian3.multiplyByScalar(forward, Math.sin(beta))), Cartesian3.magnitude(center), cMid);
                        Cartesian3.add(center, cMid, center);
                        Cartesian3.clone(cameraPosition, camera.position);
                        Cartesian3.normalize(Cartesian3.subtract(center, cameraPosition), camera.direction);
                        Cartesian3.clone(camera.direction, camera.direction);
                        Cartesian3.cross(camera.direction, camera.up, camera.right);
                        Cartesian3.cross(camera.right, camera.direction, camera.up);
                        camera.setView({
                            orientation
                        });
                        return;
                    }
                }
                else {
                    const positionNormal = Cartesian3.normalize(centerPosition);
                    const pickedNormal = Cartesian3.normalize(object._zoomWorldPosition);
                    const dotProduct = Cartesian3.dot(pickedNormal, positionNormal);
                    if (dotProduct > 0.0 && dotProduct < 1.0) {
                        const angle = HEditorMath.acosClamped(dotProduct);
                        const axis = Cartesian3.cross(pickedNormal, positionNormal);
                        const denom = Math.abs(angle) > HEditorMath.toRadians(20.0)
                            ? camera.positionCartographic.height * 0.75
                            : camera.positionCartographic.height - distance;
                        const scalar = distance / denom;
                        camera.rotate(axis, angle * scalar);
                    }
                }
            }
            object._rotatingZoom = !zoomOnVector;
        }
        if ((!sameStartPosition && zoomOnVector) || zoomingOnVector) {
            let ray;
            const zoomMouseStart = SceneTransforms.worldToWindowCoordinates(scene, object._zoomWorldPosition);
            if (mode !== SceneMode.COLUMBUS_VIEW &&
                Cartesian2.equals(startPosition, object._zoomMouseStart) &&
                defined(zoomMouseStart)) {
                ray = camera.getPickRay(zoomMouseStart);
            }
            else {
                ray = camera.getPickRay(startPosition);
            }
            const rayDirection = ray.direction;
            if (mode === SceneMode.COLUMBUS_VIEW || mode === SceneMode.SCENE2D) {
                Cartesian3.fromElements(rayDirection.y, rayDirection.z, rayDirection.x, rayDirection);
            }
            camera.move(rayDirection, distance);
            object._zoomingOnVector = true;
        }
        else {
            camera.zoomIn(distance);
        }
        if (!object._cameraUnderground) {
            camera.setView({
                orientation
            });
        }
    }
    _tilt3D(controller, startPosition, movement) {
        const scene = controller._scene;
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
        if (controller._looking) {
            const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position);
            controller._look3D(controller, startPosition, movement, up);
            return;
        }
        const ellipsoid = controller._ellipsoid;
        const cartographic = ellipsoid.cartesianToCartographic(camera.position);
        if (controller._tiltOnEllipsoid ||
            cartographic?.height > controller.minimumCollisionTerrainHeight) {
            controller._tiltOnEllipsoid = true;
            controller._tilt3DOnEllipsoid(controller, startPosition, movement);
        }
        else {
            controller._tilt3DOnTerrain(controller, startPosition, movement);
        }
    }
    _tilt3DOnEllipsoid(controller, startPosition, movement) {
        const ellipsoid = controller._ellipsoid;
        const scene = controller._scene;
        const camera = scene.camera;
        const minHeight = controller.minimumZoomDistance * 0.25;
        const height = ellipsoid.cartesianToCartographic(camera.positionWC)?.height || 0;
        if (height - minHeight - 1.0 < HEditorMath.EPSILON3 &&
            movement.endPosition.y - movement.startPosition.y < 0.0) {
            return;
        }
        const canvas = scene.canvas;
        const windowPosition = new Cartesian2();
        windowPosition.x = canvas.clientWidth / 2;
        windowPosition.y = canvas.clientHeight / 2;
        const ray = camera.getPickRay(windowPosition, tilt3DRay);
        let center;
        const intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid);
        if (defined(intersection)) {
            center = Ray.getPoint(ray, intersection.start);
        }
        else if (height > controller.minimumTrackBallHeight) {
            const grazingAltitudeLocation = IntersectionTests.grazingAltitudeLocation(ray, ellipsoid);
            if (!defined(grazingAltitudeLocation)) {
                return;
            }
            const grazingAltitudeCart = ellipsoid.cartesianToCartographic(grazingAltitudeLocation) ||
                new Cartographic();
            grazingAltitudeCart.height = 0.0;
            center = ellipsoid.cartographicToCartesian(grazingAltitudeCart);
        }
        else {
            controller._looking = true;
            const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position);
            controller._look3D(controller, startPosition, movement, up);
            Cartesian2.clone(startPosition, controller._tiltCenterMousePosition);
            return;
        }
        const transform = Transforms.eastNorthUpToFixedFrame(center, ellipsoid);
        const oldGlobe = controller._globe;
        const oldEllipsoid = controller._ellipsoid;
        controller._globe = undefined;
        controller._ellipsoid = Ellipsoid.UNIT_SPHERE;
        controller._rotateFactor = 1.0;
        controller._rotateRateRangeAdjustment = 1.0;
        const oldTransform = Matrix4.clone(camera.transform);
        camera.setTransform(transform);
        controller._rotate3D(controller, startPosition, movement, Cartesian3.UNIT_Z);
        camera.setTransform(oldTransform);
        controller._globe = oldGlobe;
        controller._ellipsoid = oldEllipsoid;
        const radius = oldEllipsoid.maximumRadius;
        controller._rotateFactor = 1.0 / radius;
        controller._rotateRateRangeAdjustment = radius;
    }
    _tilt3DOnTerrain(controller, startPosition, movement) {
        const ellipsoid = controller._ellipsoid;
        const scene = controller._scene;
        const camera = scene.camera;
        const cameraUnderground = controller._cameraUnderground;
        let center, ray, intersection;
        if (Cartesian2.equals(startPosition, controller._tiltCenterMousePosition)) {
            center = Cartesian3.clone(controller._tiltCenter);
        }
        else {
            center = controller._pickPosition(controller, startPosition);
            if (!defined(center)) {
                ray = camera.getPickRay(startPosition, tilt3DRay);
                intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid);
                if (!defined(intersection)) {
                    const cartographic = ellipsoid.cartesianToCartographic(camera.position);
                    if (cartographic?.height <= controller.minimumTrackBallHeight) {
                        controller._looking = true;
                        const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position);
                        controller._look3D(controller, startPosition, movement, up);
                        Cartesian2.clone(startPosition, controller._tiltCenterMousePosition);
                    }
                    return;
                }
                center = Ray.getPoint(ray, intersection.start);
            }
            if (cameraUnderground) {
                if (!defined(ray)) {
                    ray = camera.getPickRay(startPosition, tilt3DRay);
                }
                controller._getTiltCenterUnderground(controller, ray, center, center);
            }
            Cartesian2.clone(startPosition, controller._tiltCenterMousePosition);
            Cartesian3.clone(center, controller._tiltCenter);
        }
        const canvas = scene.canvas;
        const windowPosition = new Cartesian2();
        windowPosition.x = canvas.clientWidth / 2;
        windowPosition.y = controller._tiltCenterMousePosition.y;
        ray = camera.getPickRay(windowPosition, tilt3DRay);
        const mag = Cartesian3.magnitude(center);
        const radii = Cartesian3.fromElements(mag, mag, mag);
        const newEllipsoid = Ellipsoid.fromCartesian3(radii);
        intersection = IntersectionTests.rayEllipsoid(ray, newEllipsoid);
        if (!defined(intersection)) {
            return;
        }
        const t = Cartesian3.magnitude(ray.origin) > mag
            ? intersection.start
            : intersection.stop;
        const verticalCenter = Ray.getPoint(ray, t);
        const transform = Transforms.eastNorthUpToFixedFrame(center, ellipsoid);
        const verticalTransform = Transforms.eastNorthUpToFixedFrame(verticalCenter, newEllipsoid);
        const oldGlobe = controller._globe;
        const oldEllipsoid = controller._ellipsoid;
        controller._globe = undefined;
        controller._ellipsoid = Ellipsoid.UNIT_SPHERE;
        controller._rotateFactor = 1.0;
        controller._rotateRateRangeAdjustment = 1.0;
        let constrainedAxis = Cartesian3.UNIT_Z;
        const oldTransform = Matrix4.clone(camera.transform);
        camera.setTransform(verticalTransform);
        const tangent = Cartesian3.cross(verticalCenter, camera.positionWC);
        const dot = Cartesian3.dot(camera.rightWC, tangent);
        if (dot < 0.0) {
            const movementDelta = movement.startPosition.y - movement.endPosition.y;
            if ((cameraUnderground && movementDelta < 0.0) ||
                (!cameraUnderground && movementDelta > 0.0)) {
                constrainedAxis = undefined;
            }
            const oldConstrainedAxis = camera.constrainedAxis;
            camera.constrainedAxis = undefined;
            controller._rotate3D(controller, startPosition, movement, constrainedAxis, true, false);
            camera.constrainedAxis = oldConstrainedAxis;
        }
        else {
            controller._rotate3D(controller, startPosition, movement, constrainedAxis, false, true);
        }
        camera.setTransform(transform);
        controller._rotate3D(controller, startPosition, movement, constrainedAxis, false, true);
        if (defined(camera.constrainedAxis)) {
            const right = Cartesian3.cross(camera.direction, camera.constrainedAxis);
            if (!Cartesian3.equalsEpsilon(right, Cartesian3.ZERO, HEditorMath.EPSILON6)) {
                if (Cartesian3.dot(right, camera.right) < 0.0) {
                    Cartesian3.negate(right, right);
                }
                Cartesian3.cross(right, camera.direction, camera.up);
                Cartesian3.cross(camera.direction, camera.up, camera.right);
                Cartesian3.normalize(camera.right, camera.right);
                Cartesian3.normalize(camera.up, camera.up);
            }
        }
        camera.setTransform(oldTransform);
        controller._globe = oldGlobe;
        controller._ellipsoid = oldEllipsoid;
        const radius = oldEllipsoid.maximumRadius;
        controller._rotateFactor = 1.0 / radius;
        controller._rotateRateRangeAdjustment = radius;
        const originalPosition = Cartesian3.clone(camera.positionWC);
        if (controller.enableCollisionDetection) {
            controller._adjustHeightForTerrain(controller, true);
        }
        if (!Cartesian3.equals(camera.positionWC, originalPosition)) {
            camera.setTransform(verticalTransform);
            camera.worldToCameraCoordinatesPoint(originalPosition, originalPosition);
            const magSqrd = Cartesian3.magnitudeSquared(originalPosition);
            if (Cartesian3.magnitudeSquared(camera.position) < magSqrd) {
                Cartesian3.normalize(camera.position, camera.position);
                Cartesian3.multiplyByScalar(camera.position, Math.sqrt(magSqrd), camera.position);
            }
            const angle = Cartesian3.angleBetween(originalPosition, camera.position);
            const axis = Cartesian3.cross(originalPosition, camera.position, originalPosition);
            Cartesian3.normalize(axis, axis);
            const quaternion = Quaternion.fromAxisAngle(axis, angle);
            const ratation = Matrix3.fromQuaternion(quaternion);
            Matrix3.multiplyByVector(ratation, camera.direction, camera.direction);
            Matrix3.multiplyByVector(ratation, camera.up, camera.up);
            Cartesian3.cross(camera.direction, camera.up, camera.right);
            Cartesian3.cross(camera.right, camera.direction, camera.up);
            camera.setTransform(oldTransform);
        }
    }
    _look3D(controller, startPosition, movement, rotationAxis) {
        const scene = controller._scene;
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
            camera.look(rotationAxis, -angle);
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
                const tagent = Cartesian3.cross(rotationAxis, direction);
                camera.look(tagent, angle);
            }
            else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
                camera.look(rotationAxis, -angle);
            }
        }
        else {
            camera.lookUp(angle);
        }
    }
    _adjustHeightForTerrain(controller, cameraChanged) {
        controller._adjustedHeightForTerrain = true;
        const scene = controller._scene;
        const camera = scene.camera;
        const ellipsoid = defaultValue(scene.ellipsoid, Ellipsoid.WGS84);
        let transform, mag;
        if (!Matrix4.equals(Matrix4.IDENTITY, camera.transform)) {
            transform = Matrix4.clone(camera.transform);
            mag = Cartesian3.magnitude(camera.position);
            camera.setTransform(Matrix4.IDENTITY);
        }
        const cartographic = ellipsoid.cartesianToCartographic(camera.position);
        let heightUpdated = false;
        if (cartographic.height < controller._minimumCollisionTerrainHeight) {
            const globeHeight = controller._scene.globeHeight;
            if (defined(globeHeight)) {
                const height = globeHeight + controller.minimumZoomDistance;
                const difference = globeHeight - controller._lastGlobeHeight;
                const percentDifference = difference / controller._lastGlobeHeight;
                if (cartographic.height < height &&
                    (cameraChanged || Math.abs(percentDifference) <= 0.1)) {
                    cartographic.height = height;
                    ellipsoid.cartographicToCartesian(cartographic, camera.position);
                    heightUpdated = true;
                }
                if (cameraChanged || Math.abs(percentDifference) <= 0.1) {
                    controller._lastGlobeHeight = globeHeight;
                }
                else {
                    controller._lastGlobeHeight += difference * 0.1;
                }
            }
        }
        if (defined(transform)) {
            camera.setTransform(transform);
            if (heightUpdated && mag) {
                Cartesian3.normalize(camera.position, camera.position);
                Cartesian3.negate(camera.position, camera.direction);
                Cartesian3.multiplyByScalar(camera.direction, Math.max(mag, controller.minimumZoomDistance), camera.position);
                Cartesian3.normalize(camera.direction, camera.direction);
                Cartesian3.cross(camera.direction, camera.up, camera.right);
                Cartesian3.cross(camera.right, camera.direction, camera.up);
            }
        }
    }
    _pickPosition(controller, mousePosition, result) {
        const scene = controller._scene;
        const globe = controller._globe;
        const camera = scene.camera;
        let depthIntersection;
        if (scene.pickPositionSupported) {
            depthIntersection = scene.pickPositionWorldCoordinates(mousePosition, result);
        }
        if (!defined(globe) && defined(depthIntersection)) {
            return Cartesian3.clone(depthIntersection, result);
        }
        const cullBackFaces = !controller._cameraUnderground;
        const ray = camera.getPickRay(mousePosition);
        const rayIntersection = globe.pickWorldCoordinates(ray, scene, cullBackFaces);
        const pickDistance = defined(depthIntersection)
            ? Cartesian3.distance(depthIntersection, camera.positionWC)
            : Number.POSITIVE_INFINITY;
        const rayDistance = defined(rayIntersection)
            ? Cartesian3.distance(rayIntersection, camera.positionWC)
            : Number.POSITIVE_INFINITY;
        if (pickDistance < rayDistance && depthIntersection) {
            return Cartesian3.clone(depthIntersection, result);
        }
        return Cartesian3.clone(rayIntersection, result);
    }
    _getZoomDistanceUnderground(controller, ray) {
        const origin = ray.origin;
        const direction = ray.direction;
        const distanceFromSurface = controller._getDistanceFromSurface(controller);
        const surfaceNormal = Cartesian3.normalize(origin);
        let strength = Math.abs(Cartesian3.dot(surfaceNormal, direction));
        strength = Math.max(strength, 0.5) * 2.0;
        return distanceFromSurface * strength;
    }
    _getDistanceFromSurface(controller) {
        const ellipsoid = controller._ellipsoid;
        const scene = controller._scene;
        const camera = scene.camera;
        let height = 0.0;
        const cartographic = ellipsoid.cartesianToCartographic(camera.position);
        if (defined(cartographic)) {
            height = cartographic.height;
        }
        const globeHeight = defaultValue(controller._scene.globeHeight, 0.0);
        const distanceFromSurface = Math.abs(globeHeight - height);
        return distanceFromSurface;
    }
    _getTiltCenterUnderground(controller, ray, pickedPosition, result) {
        let distance = Cartesian3.distance(ray.origin, pickedPosition);
        const distanceFromSurface = controller._getDistanceFromSurface(controller);
        const maximumDistance = HEditorMath.clamp(distanceFromSurface * 5.0, controller._minimumUndergroundPickDistance, controller._maximumUndergroundPickDistance);
        if (distance > maximumDistance) {
            distance = Math.min(distance, distanceFromSurface / 5.0);
            distance = Math.max(distance, 100.0);
        }
        return Ray.getPoint(ray, distance, result);
    }
    _getStrafeStartPositionUnderground(controller, ray, pickedPosition, result) {
        let distance;
        if (!defined(distance)) {
            distance = controller._getDistanceFromSurface(controller);
        }
        else {
            distance = Cartesian3.distance(ray.origin, pickedPosition);
            if (distance > controller._maximumUndergroundPickDistance) {
                distance = controller._getDistanceFromSurface(controller);
            }
        }
        return Ray.getPoint(ray, distance, result);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9TY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFNckIsU0FBUyxFQUNWLE1BQU0sWUFBWSxDQUFBO0FBQ25CLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLFNBQVMsTUFBTSxtQkFBbUIsQ0FBQTtBQUN6QyxPQUFPLGlCQUFpQixNQUFNLDJCQUEyQixDQUFBO0FBQ3pELE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQTtBQUN0QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLFVBQVUsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQyxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUE7QUFDN0IsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxxQkFBcUIsTUFBTSx5QkFBeUIsQ0FBQTtBQUUzRCxPQUFPLG1CQUFtQixNQUFNLDZCQUE2QixDQUFBO0FBSTdELE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQTtBQUNqQyxPQUFPLGdCQUFnQixNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sZUFBZSxNQUFNLG1CQUFtQixDQUFBO0FBRS9DLElBQUksdUJBQXVCLEdBQUcsQ0FBQyxDQUFBO0FB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QU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUN6QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQTtZQUMzQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUN0RSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDdkMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFcEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO1lBQzFELElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pDLFFBQVEsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQTtZQUMxQyxDQUFDO1lBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO1lBQ3RELElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtZQUN0QyxDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQTtZQUVsQyxJQUFJLElBQUksQ0FBQTtZQUNSLElBQ0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQ3ZFLENBQUM7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