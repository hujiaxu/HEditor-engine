import { CameraEventType, KeyboardEventModifier, SceneMode } from '../../type';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import Cartesian4 from '../Core/Cartesian4';
import Cartographic from '../Core/Cartographic';
import defaultValue from '../Core/DefaultValue';
import defined from '../Core/Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyZWVuU3BhY2VDYW1lcmFDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9TY3JlZW5TcGFjZUNhbWVyYUNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGVBQWUsRUFHZixxQkFBcUIsRUFNckIsU0FBUyxFQUNWLE1BQU0sWUFBWSxDQUFBO0FBQ25CLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8saUJBQWlCLE1BQU0sMkJBQTJCLENBQUE7QUFDekQsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQTtBQUM3QixPQUFPLFVBQVUsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQyxPQUFPLHFCQUFxQixNQUFNLHlCQUF5QixDQUFBO0FBRTNELE9BQU8sbUJBQW1CLE1BQU0sNkJBQTZCLENBQUE7QUFJN0QsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBQ2pDLE9BQU8sZ0JBQWdCLE1BQU0sMEJBQTBCLENBQUE7QUFDdkQsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUE7QUFFL0MsSUFBSSx1QkFBdUIsR0FBRyxDQUFDLENBQUE7QUFFL0IsTUFBTSxp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QVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFBO1lBQzNDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ3RFLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUN2QyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUVwQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDMUQsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDekMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFBO1lBQzFDLENBQUM7WUFFRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDdEQsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1lBQ3RDLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFBO1lBRWxDLElBQUksSUFBSSxDQUFBO1lBQ1IsSUFDRSxVQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFDdkUsQ0FBQztnQkFDRCxJQUFJ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