import {
  CameraEventType,
  EventTypeAndModifier,
  InputActionFunction,
  KeyboardEventModifier,
  LastInertiaConstructor,
  LastInertiaType,
  Movement,
  MovePositionEvent,
  PinchMovement,
  SceneMode
} from '../../type'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import Cartesian4 from '../Core/Cartesian4'
import Cartographic from '../Core/Cartographic'
import defaultValue from '../Core/DefaultValue'
import { defined } from '../Core/Defined'
import Ellipsoid from '../Core/Ellipsoid'
import IntersectionTests from '../Core/IntersectionTests'
import HEditorMath from '../Core/Math'
import Matrix3 from '../Core/Matrix3'
import Matrix4 from '../Core/Matrix4'
import Quaternion from '../Core/Quaternion'
import Ray from '../Core/Ray'
import Transforms from '../Core/Transforms'
import CameraEventAggregator from './CameraEventAggregator'
import Globe from './Globe'
import OrthographicFrustum from '../Core/OrthographicFrustum'
import Scene from './Scene'
// import TweenCollection from './TweenCollection'
import PerspectiveFrustum from '../Core/PerspectiveFrustum'
import Plane from '../Core/Plane'
import HeadingPitchRoll from '../Core/HeadingPitchRoll'
import SceneTransforms from './SceneTransforms'

let preIntersectionDistance = 0

const sameMousePosition = (movement: MovePositionEvent) => {
  return Cartesian2.equalsEpsilon(
    movement.startPosition,
    movement.endPosition,
    HEditorMath.EPSILON14
  )
}
const decay = (time: number, coefficient: number) => {
  if (time < 0) {
    return 0.0
  }

  const tau = (1.0 - coefficient) * 25.0
  return Math.exp(-tau / time)
}

const pickGlobeScrachRay = new Ray()

const scratchNormal = new Cartesian3()
const spin3DPick = new Cartesian3()

const pan3DP0 = Cartesian4.clone(Cartesian4.UNIT_W)
const pan3DP1 = Cartesian4.clone(Cartesian4.UNIT_W)
const pan3DStartMousePosition = new Cartesian2()
const pan3DEndMousePosition = new Cartesian2()
const pan3DPixelDimentions = new Cartesian2()
const panRay = new Ray()
const pan3dDiffMousePosition = new Cartesian2()
const scratchCameraPositionNormal = new Cartesian3()
const pan3DTemp0 = new Cartesian3()
const pan3DTemp1 = new Cartesian3()
const pan3DTemp2 = new Cartesian3()
const pan3DTemp3 = new Cartesian3()

const zoomCVWindowPos = new Cartesian2()
const zoomCVWindowRay = new Ray()
const zoom3DCartographic = new Cartographic()

const tilt3DRay = new Ray()

const inertiaMaxClickTimeThreshold = 0.4

export default class ScreenSpaceCameraController {
  enableInputs = true
  enableZoom = true
  enableTranslate = true
  enableRotate = true
  enableTilt = true
  enableLook = true

  inertiaSpin = 0.9
  inertiaTranslate = 0.9
  inertiaZoom = 0.8

  maximumMovementRatio = 0.1

  minimumZoomDistance = 1.0
  maximumZoomDistance = Number.POSITIVE_INFINITY

  translateEventTypes = CameraEventType.LEFT_DRAG
  zoomEventTypes = [
    CameraEventType.RIGHT_DRAG,
    CameraEventType.WHEEL,
    CameraEventType.PINCH
  ]

  rotateEventTypes = CameraEventType.RIGHT_DRAG

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
  ]

  lookEventTypes = {
    eventType: CameraEventType.LEFT_DRAG,
    modifier: KeyboardEventModifier.SHIFT
  }

  enableCollisionDetection = true

  private _aggregator: CameraEventAggregator
  private _lastInertiaSpinMovement: LastInertiaConstructor | undefined =
    undefined
  private _lastInertiaZoomMovement: LastInertiaConstructor | undefined =
    undefined
  private _lastInertiaTranslateMovement: LastInertiaConstructor | undefined =
    undefined
  private _lastInertiaTiltMovement: LastInertiaConstructor | undefined =
    undefined

  private _inertiaDisablers: { [key: string]: string[] } = {
    _lastInertiaZoomMovement: [
      '_lastInertiaSpinMovement',
      '_lastInertiaTranslateMovement',
      '_lastInertiaTiltMovement'
    ],
    _lastInertiaTiltMovement: [
      '_lastInertiaSpinMovement',
      '_lastInertiaTranslateMovement'
    ]
  }

  // private _tweens = new TweenCollection()
  // private _tween = undefined

  private _tiltCenterMousePosition = new Cartesian2(-1.0, -1.0)
  private _tiltCenter = new Cartesian3()
  private _rotateMousePosition = new Cartesian2(-1.0, -1.0)
  private _rotateStartPosition = new Cartesian3()
  private _strafeStartPosition = new Cartesian3()
  // private _strafeMousePosition = new Cartesian2()
  private _strafeEndMousePosition = new Cartesian2()
  private _zoomMouseStart = new Cartesian2(-1.0, -1.0)
  private _zoomWorldPosition = new Cartesian3()
  private _useZoomWorldPosition = false
  private _panLastMousePosition = new Cartesian2()
  private _panLastWorldPosition = new Cartesian3()
  // private _tiltCVOffMap = false
  private _looking = false
  private _rotating = false
  private _strafing = false
  private _zoomingUnderground = false
  private _zoomingOnVector = false
  private _rotatingZoom = false
  // private _adnustedHeightForTerrain = false
  private _cameraUnderground = false

  private _tiltOnEllipsoid = false

  private _zoomFactor = 5.0
  private _rotateFactor = 1.0
  private _rotateRateRangeAdjustment = 1.0
  private _maximumRotateRate = 1.77
  // private minimumRotateRate = 1.0 / 5000.0
  private _minimumZoomRate = 20.0
  private _maximumZoomRate = 5906376272000.0 // distance from the Sun to Pluto in meters.
  private _minimumUndergroundPickDistance = 2000.0
  private _maximumUndergroundPickDistance = 10000.0
  private _ellipsoid: Ellipsoid

  private _horizontalRotationAxis: Cartesian3 = new Cartesian3()

  private _scene: Scene
  private _globe: Globe | undefined = undefined

  private _minimumPickingTerrainHeight: number
  minimumPickingTerrainHeight: number
  minimumPickingTerrainDistanceWithInertia: number
  minimumCollisionTerrainHeight: number
  minimumTrackBallHeight: number
  public _adjustedHeightForTerrain: boolean = false
  private _minimumCollisionTerrainHeight: number
  private _lastGlobeHeight: number

  constructor(scene: Scene) {
    if (!scene) {
      throw new Error('scene is required')
    }

    this._scene = scene

    const ellipsoid = defaultValue(scene.ellipsoid, Ellipsoid.default)
    this._ellipsoid = ellipsoid
    this.minimumPickingTerrainHeight = Ellipsoid.WGS84.equals(ellipsoid)
      ? 150000.0
      : ellipsoid.minimumRadius * 0.025
    this._minimumPickingTerrainHeight = this.minimumPickingTerrainHeight
    this.minimumPickingTerrainDistanceWithInertia = Ellipsoid.WGS84.equals(
      ellipsoid
    )
      ? 4000.0
      : ellipsoid.minimumRadius * 0.00063

    this.minimumCollisionTerrainHeight = Ellipsoid.WGS84.equals(ellipsoid)
      ? 150000.0
      : ellipsoid.minimumRadius * 0.0025
    this._minimumCollisionTerrainHeight = this.minimumCollisionTerrainHeight

    this.minimumTrackBallHeight = Ellipsoid.WGS84.equals(ellipsoid)
      ? 7500000.0
      : ellipsoid.minimumRadius * 1.175

    this._aggregator = new CameraEventAggregator(scene.canvas)

    this._lastGlobeHeight = 0.0
  }

  update() {
    // const { camera } = this._scene

    this._update3D(this)
  }

  private _reactToInput(
    controller: ScreenSpaceCameraController,
    enabled: boolean,
    eventTypes:
      | CameraEventType
      | EventTypeAndModifier
      | (CameraEventType | EventTypeAndModifier)[],
    action: InputActionFunction,
    inertiaConstant?: number,
    inertiaStateName?: LastInertiaType
  ) {
    if (!defined(eventTypes)) return

    const aggregator = controller._aggregator

    if (!Array.isArray(eventTypes)) {
      eventTypes = [eventTypes]
    }

    const length = eventTypes.length
    for (let i = 0; i < length; i++) {
      const eventType = eventTypes[i]
      const type = (
        defined((eventType as EventTypeAndModifier).eventType)
          ? (eventType as EventTypeAndModifier).eventType
          : eventType
      ) as CameraEventType
      const modifier = (eventType as EventTypeAndModifier).modifier || undefined

      const movement =
        aggregator.isMoving(type, modifier) &&
        aggregator.getMovement(type, modifier)
      const startPosition = aggregator.getStartMousePosition(type, modifier)

      if (controller.enableInputs && enabled) {
        if (movement) {
          if ('startPosition' in movement) {
            action(controller, startPosition, movement)
          } else {
            action(controller, startPosition, movement)
          }

          controller._activateInertia(controller, inertiaStateName)
        } else if (inertiaConstant && inertiaConstant < 1.0) {
          controller._maintainInertia(
            aggregator,
            type,
            modifier,
            inertiaConstant,
            action,
            controller,
            inertiaStateName
          )
        }
      }
    }
  }
  private _activateInertia(
    controller: ScreenSpaceCameraController,
    inertiaStateName?: LastInertiaType
  ) {
    if (defined(inertiaStateName)) {
      let movementState = controller[inertiaStateName]
      if (defined(movementState)) {
        movementState.inertiaEnabled = true
      }

      const inertiasToDisable = controller._inertiaDisablers[inertiaStateName]
      if (defined(inertiasToDisable)) {
        const length = inertiasToDisable.length
        for (let i = 0; i < length; i++) {
          const inertiaType = inertiasToDisable[i] as LastInertiaType
          movementState = controller[inertiaType]
          if (defined(movementState)) {
            movementState.inertiaEnabled = false
          }
        }
      }
    }
  }
  private _maintainInertia(
    aggregator: CameraEventAggregator,
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined,
    decayCoef: number,
    action: InputActionFunction,
    object: ScreenSpaceCameraController,
    inertiaStateName?: LastInertiaType
  ) {
    let movementState = inertiaStateName && object[inertiaStateName]
    if (!defined(movementState) && inertiaStateName) {
      movementState = object[inertiaStateName] = {
        startPosition: new Cartesian2(),
        endPosition: new Cartesian2(),
        motion: new Cartesian2(),
        inertiaEnabled: true
      }
    }

    const ts = aggregator.getButtonPressTime(type, modifier)
    const tr = aggregator.getButtonReleaseTime(type, modifier)

    const threshold = ts && tr && (tr.getTime() - ts.getTime()) * 1000.0
    const now = new Date()
    const fromNow = tr && (now.getTime() - tr.getTime()) / 1000.0

    if (ts && tr && threshold < inertiaMaxClickTimeThreshold) {
      const d = decay(fromNow, decayCoef)

      const lastMovement = aggregator.getLastMovement(type, modifier)
      if (
        !defined(lastMovement) ||
        sameMousePosition(lastMovement) ||
        !movementState?.inertiaEnabled
      ) {
        return
      }

      movementState.motion!.x =
        (lastMovement.endPosition.x - lastMovement.startPosition.x) * 0.5
      movementState.motion!.y =
        (lastMovement.endPosition.y - lastMovement.startPosition.y) * 0.5

      movementState.startPosition = Cartesian2.clone(
        lastMovement.startPosition,
        movementState.startPosition
      )
      movementState.endPosition = Cartesian2.multiplyByScalar(
        movementState.motion!,
        d,
        movementState.endPosition
      )
      movementState.endPosition = Cartesian2.add(
        movementState.startPosition,
        movementState.endPosition,
        movementState.endPosition
      )

      if (
        isNaN(movementState.endPosition.x) ||
        isNaN(movementState.endPosition.y) ||
        Cartesian2.distance(
          movementState.startPosition,
          movementState.endPosition
        ) < 0.5
      ) {
        return
      }

      if (!aggregator.isButtonDown(type, modifier)) {
        const startPosition = aggregator.getStartMousePosition(type, modifier)
        action(object, startPosition, movementState)
      }
    }
  }

  private _update3D(controller: ScreenSpaceCameraController) {
    controller._reactToInput(
      controller,
      controller.enableRotate,
      controller.rotateEventTypes,
      // @ts-expect-error: _spin3D function has incompatible parameter types, but it's a known issue that will be fixed later
      controller._spin3D,
      controller.inertiaSpin,
      '_lastInertiaSpinMovement'
    )
    controller._reactToInput(
      controller,
      controller.enableZoom,
      controller.zoomEventTypes,
      controller._zoom3D,
      controller.inertiaZoom,
      '_lastInertiaZoomMovement'
    )
    controller._reactToInput(
      controller,
      controller.enableTilt,
      controller.tiltEventTypes,
      controller._tilt3D,
      controller.inertiaSpin,
      '_lastInertiaTiltMovement'
    )
    controller._reactToInput(
      controller,
      controller.enableLook,
      controller.lookEventTypes,
      // @ts-expect-error: _look3D function has incompatible parameter types, but it's a known issue that will be fixed later
      controller._look3D
    )
  }
  private _continueStrafing(
    controller: ScreenSpaceCameraController,
    movement: MovePositionEvent
  ) {
    const originalEndPosition = movement.endPosition
    const inertialDelta = Cartesian2.subtract(
      movement.endPosition,
      movement.startPosition,
      new Cartesian2()
    )
    const endPosition = controller._strafeEndMousePosition
    Cartesian2.add(endPosition, inertialDelta, endPosition)
    movement.endPosition = endPosition
    controller._strafe(controller, movement, controller._strafeStartPosition)
    movement.endPosition = originalEndPosition
  }
  private _strafe(
    controller: ScreenSpaceCameraController,
    movement: MovePositionEvent,
    startPosition: Cartesian3
  ) {
    const scene = controller._scene
    const camera = scene.camera

    const ray = camera.getPickRay(movement.endPosition)

    let direction = Cartesian3.clone(camera.direction)

    const plane = Plane.fromPointNormal(startPosition, direction)
    const intersection = IntersectionTests.rayPlane(ray, plane)
    if (!defined(intersection)) return

    direction = Cartesian3.subtract(startPosition, intersection, direction)

    Cartesian3.add(camera.position, direction, camera.position)
  }

  private _spin3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: Movement | LastInertiaConstructor
  ) {
    const scene = controller._scene
    const camera = scene.camera
    const cameraUnderground = controller._cameraUnderground
    let ellipsoid = controller._ellipsoid

    if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
      controller._rotate3D(controller, startPosition, movement)
      return
    }

    let magnitude, radii

    const up = ellipsoid.geodeticSurfaceNormal(camera.position)

    if (Cartesian2.equals(startPosition, controller._rotateMousePosition)) {
      if (controller._looking) {
        controller._look3D(controller, startPosition, movement, up)
      } else if (controller._rotating) {
        controller._rotate3D(controller, startPosition, movement)
      } else if (controller._strafing) {
        controller._continueStrafing(controller, movement)
      } else {
        if (
          Cartesian3.magnitude(camera.position) <
          Cartesian3.magnitude(controller._rotateStartPosition)
        ) {
          return
        }

        magnitude = Cartesian3.magnitude(controller._rotateStartPosition)
        radii = new Cartesian3()
        radii.x = radii.y = radii.z = magnitude
        ellipsoid = Ellipsoid.fromCartesian3(radii)

        controller._pan3D(controller, startPosition, movement, ellipsoid)
      }

      return
    }

    controller._looking = false
    controller._rotating = false
    controller._strafing = false

    const height =
      ellipsoid.cartesianToCartographic(camera.positionWC)?.height || 0
    const globe = controller._globe

    if (
      defined(globe) &&
      defined(height) &&
      height < controller.minimumPickingTerrainHeight
    ) {
      const mousePos = controller._pickPosition(
        controller,
        movement.startPosition
      )

      if (defined(mousePos)) {
        let strafing = false
        const ray = camera.getPickRay(
          movement.startPosition,
          pickGlobeScrachRay
        )
        if (cameraUnderground) {
          strafing = false
          controller._getStrafeStartPositionUnderground(
            controller,
            ray,
            mousePos,
            mousePos
          )
        } else {
          const normal =
            ellipsoid.geodeticSurfaceNormal(mousePos, scratchNormal) ||
            new Cartesian3(0.0, 0.0, 1.0)
          const tangentPick =
            normal && Math.abs(Cartesian3.dot(ray.direction, normal)) < 0.05

          if (tangentPick) {
            strafing = true
          } else {
            strafing =
              Cartesian3.magnitude(camera.position) <
              Cartesian3.magnitude(mousePos)
          }
        }

        if (strafing) {
          Cartesian2.clone(startPosition, controller._strafeEndMousePosition)
          Cartesian3.clone(mousePos, controller._strafeStartPosition)
          controller._strafing = true
          controller._strafe(
            controller,
            movement,
            controller._strafeStartPosition
          )
        } else {
          magnitude = Cartesian3.magnitude(mousePos)
          radii = new Cartesian3()
          radii.x = radii.y = radii.z = magnitude
          ellipsoid = Ellipsoid.fromCartesian3(radii)

          controller._pan3D(controller, startPosition, movement, ellipsoid)

          Cartesian3.clone(mousePos, controller._rotateStartPosition)
        }
      } else {
        controller._looking = true
        controller._look3D(controller, startPosition, movement, up)
      }
    } else if (
      defined(
        camera.pickEllipsoid(
          movement.startPosition,
          controller._ellipsoid,
          spin3DPick
        )
      )
    ) {
      controller._pan3D(
        controller,
        startPosition,
        movement,
        controller._ellipsoid
      )
      Cartesian3.clone(spin3DPick, controller._rotateStartPosition)
    } else if (height > controller.minimumTrackBallHeight) {
      controller._rotating = true
      controller._rotate3D(controller, startPosition, movement)
    } else {
      controller._looking = true
      controller._look3D(controller, startPosition, movement, up)
    }

    Cartesian2.clone(startPosition, controller._rotateMousePosition)
  }

  private _rotate3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor,
    constrainedAxis?: Cartesian3,
    rotateOnlyVertical?: boolean,
    rotateOnlyHorizontal?: boolean
  ) {
    rotateOnlyVertical = defaultValue(rotateOnlyVertical, false)
    rotateOnlyHorizontal = defaultValue(rotateOnlyHorizontal, false)

    const scene = controller._scene
    const camera = scene.camera
    const canvas = scene.canvas

    const oldAxis = camera.constrainedAxis
    if (defined(constrainedAxis)) {
      camera.constrainedAxis = constrainedAxis
    }

    const rho = Cartesian3.magnitude(camera.position)
    let rotateRate =
      controller._rotateFactor * (rho - controller._rotateRateRangeAdjustment)

    if (rotateRate > controller._maximumRotateRate) {
      rotateRate = controller._maximumRotateRate
    }

    let phiWindowRatio =
      (movement.startPosition.x - movement.endPosition.x) / canvas.clientWidth
    let thetaWindowRatio =
      (movement.startPosition.y - movement.endPosition.y) / canvas.clientHeight

    phiWindowRatio = Math.min(phiWindowRatio, controller.maximumMovementRatio)
    thetaWindowRatio = Math.min(
      thetaWindowRatio,
      controller.maximumMovementRatio
    )

    const deltaPhi = rotateRate * phiWindowRatio * Math.PI * 2.0
    const deltaTheta = rotateRate * thetaWindowRatio * Math.PI

    if (!rotateOnlyVertical) {
      camera.rotateLeft(deltaPhi)
      console.log('deltaPhi: ', deltaPhi)
    }

    if (!rotateOnlyHorizontal) {
      camera.rotateUp(deltaTheta)
    }

    camera.constrainedAxis = oldAxis
  }

  private _pan3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor,
    ellipsoid: Ellipsoid
  ) {
    const scene = controller._scene
    const camera = scene.camera

    const startMousePosition = Cartesian2.clone(
      movement.startPosition,
      pan3DStartMousePosition
    )
    const endMousePosition = Cartesian2.clone(
      movement.endPosition,
      pan3DEndMousePosition
    )
    const height =
      ellipsoid.cartesianToCartographic(camera.position)?.height || 0.0

    let p0: Cartesian3 | Cartesian4 | undefined,
      p1: Cartesian3 | Cartesian4 | undefined

    if (
      !movement.inertiaEnabled &&
      height < controller.minimumPickingTerrainHeight
    ) {
      p0 = Cartesian3.clone(controller._panLastWorldPosition, pan3DP0)

      if (
        !defined(controller._globe) &&
        !Cartesian2.equalsEpsilon(
          startMousePosition,
          controller._panLastMousePosition
        )
      ) {
        p0 = controller._pickPosition(controller, startMousePosition, pan3DP0)
      }

      if (!defined(controller._globe) && defined(p0)) {
        const toCenter = Cartesian3.subtract(p0, camera.positionWC, pan3DTemp1)
        const toCenterProj = Cartesian3.multiplyByScalar(
          camera.directionWC,
          Cartesian3.dot(camera.directionWC, toCenter),
          pan3DTemp1
        )

        const distanceToNearPlane = Cartesian3.magnitude(toCenterProj)
        const pixelDimensions = camera.frustum.getPixelDimensions(
          scene.drawingBufferWidth,
          scene.drawingBufferHeight,
          distanceToNearPlane,
          scene.pixelRatio,
          pan3DPixelDimentions
        )

        const dragDelta = Cartesian2.subtract(
          endMousePosition,
          startMousePosition,
          pan3dDiffMousePosition
        )

        const right = Cartesian3.multiplyByScalar(
          camera.rightWC,
          dragDelta.x * pixelDimensions.x,
          pan3DTemp1
        )

        const cameraPositionNormal = Cartesian3.normalize(
          camera.positionWC,
          scratchCameraPositionNormal
        )
        const endPickDirection = camera.getPickRay(
          endMousePosition,
          panRay
        )?.direction
        const endPickProj = Cartesian3.subtract(
          endPickDirection,
          Cartesian3.projectVector(
            endPickDirection,
            camera.rightWC,
            pan3DTemp2
          ),
          pan3DTemp2
        )
        const angle = Cartesian3.angleBetween(endPickProj, camera.directionWC)
        let forward = 1.0
        if (defined((camera.frustum as PerspectiveFrustum).fov)) {
          forward = Math.max(Math.tan(angle), 0.1)
        }

        let dot = Math.abs(
          Cartesian3.dot(camera.directionWC, cameraPositionNormal)
        )
        const magnitude =
          ((-dragDelta.y * pixelDimensions.y * 2.0) / Math.sqrt(forward)) *
          (1.0 - dot)
        const direction = Cartesian3.multiplyByScalar(
          endPickDirection,
          magnitude,
          pan3DTemp2
        )

        dot = Math.abs(Cartesian3.dot(camera.upWC, cameraPositionNormal))
        const up = Cartesian3.multiplyByScalar(
          camera.upWC,
          -dragDelta.y * (1.0 - dot) * pixelDimensions.y,
          pan3DTemp3
        )

        p1 = Cartesian3.add(p0, right, pan3DP1)
        p1 = Cartesian3.add(p1, direction, p1)
        p1 = Cartesian3.add(p1, up, p1)

        Cartesian3.clone(p1, controller._panLastWorldPosition)
        Cartesian2.clone(endMousePosition, controller._panLastMousePosition)
      }
    }

    if (!defined(p0) || !defined(p1)) {
      p0 = camera.pickEllipsoid(startMousePosition, ellipsoid)
      p1 = camera.pickEllipsoid(endMousePosition, ellipsoid)
    }

    if (!defined(p0) || !defined(p1)) {
      controller._rotating = true
      controller._rotate3D(controller, startPosition, movement)
      return
    }

    p0 = camera.worldToCameraCoordinates(p0 as Cartesian4, p0 as Cartesian4)
    p1 = camera.worldToCameraCoordinates(p1 as Cartesian4, p1 as Cartesian4)

    if (!defined(camera.constrainedAxis)) {
      Cartesian3.normalize(p0, p0)
      Cartesian3.normalize(p1, p1)
      const dot = Cartesian3.dot(p0, p1)
      const axis = Cartesian3.cross(p0, p1, pan3DTemp0)

      if (
        dot < 1.0 &&
        !Cartesian3.equalsEpsilon(axis, Cartesian3.ZERO, HEditorMath.EPSILON14)
      ) {
        const angle = Math.acos(dot)
        camera.rotate(axis, angle)
      }
    } else {
      const basis0 = camera.constrainedAxis
      const basis1 = Cartesian3.mostOrthogonalAxis(basis0, pan3DTemp0)
      Cartesian3.cross(basis1, basis0, basis1)
      Cartesian3.normalize(basis1, basis1)
      const basis2 = Cartesian3.cross(basis0, basis1, pan3DTemp1)

      const startRho = Cartesian3.magnitude(p0)
      const startDot = Cartesian3.dot(basis0, p0)
      const startTheta = Math.acos(startDot / startRho)
      const startRej = Cartesian3.multiplyByScalar(basis0, startDot, pan3DTemp2)
      Cartesian3.subtract(p0, startRej, startRej)
      Cartesian3.normalize(startRej, startRej)

      const endRho = Cartesian3.magnitude(p1)
      const endDot = Cartesian3.dot(basis0, p1)
      const endTheta = Math.acos(endDot / endRho)
      const endRej = Cartesian3.multiplyByScalar(basis0, endDot, pan3DTemp3)
      Cartesian3.subtract(p1, endRej, endRej)
      Cartesian3.normalize(endRej, endRej)

      let startPhi = Math.acos(Cartesian3.dot(startRej, basis1))
      if (Cartesian3.dot(startRej, basis2) < 0) {
        startPhi = HEditorMath.TWO_PI - startPhi
      }

      let endPhi = Math.acos(Cartesian3.dot(endRej, basis1))
      if (Cartesian3.dot(endRej, basis2) < 0) {
        endPhi = HEditorMath.TWO_PI - endPhi
      }

      const deltaPhi = endPhi - startPhi

      let east
      if (
        Cartesian3.equalsEpsilon(basis0, camera.position, HEditorMath.EPSILON2)
      ) {
        east = camera.right
      } else {
        east = Cartesian3.cross(basis0, camera.position, pan3DTemp0)
      }

      const planeNormal = Cartesian3.cross(basis0, east, pan3DTemp0)
      const side0 = Cartesian3.dot(
        planeNormal,
        Cartesian3.subtract(p0, basis0, pan3DTemp1)
      )
      const side1 = Cartesian3.dot(
        planeNormal,
        Cartesian3.subtract(p1, basis0, pan3DTemp1)
      )

      let deltaTheta
      if (side0 > 0 && side1 > 0) {
        deltaTheta = endTheta - startTheta
      } else if (side0 > 0 && side1 <= 0) {
        if (Cartesian3.dot(camera.position, basis0) > 0) {
          deltaTheta = -startTheta - endTheta
        } else {
          deltaTheta = startTheta + endTheta
        }
      } else {
        deltaTheta = startTheta - endTheta
      }

      camera.rotateRight(deltaPhi)
      camera.rotateUp(deltaTheta)
    }
  }

  private _zoom3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor | PinchMovement
  ) {
    if (defined((movement as PinchMovement).distance)) {
      movement = (movement as PinchMovement).distance
    }

    const inertiaMovement = (movement as LastInertiaConstructor).inertiaEnabled

    const ellipsoid = controller._ellipsoid
    const scene = controller._scene
    const camera = scene.camera
    const canvas = scene.canvas
    const cameraUnderground = controller._cameraUnderground

    let windowPosition

    if (cameraUnderground) {
      windowPosition = startPosition
    } else {
      windowPosition = zoomCVWindowPos
      windowPosition.x = canvas.clientWidth / 2
      windowPosition.y = canvas.clientHeight / 2
    }

    const ray = camera.getPickRay(windowPosition, zoomCVWindowRay)!

    let intersection
    const height =
      ellipsoid.cartesianToCartographic(camera.position, zoom3DCartographic)
        ?.height || 0

    const approachingCollision =
      Math.abs(preIntersectionDistance) <
      controller.minimumPickingTerrainDistanceWithInertia

    const needPickGlobe = inertiaMovement
      ? approachingCollision
      : height < controller._minimumPickingTerrainHeight

    if (needPickGlobe) {
      intersection = controller._pickPosition(controller, windowPosition)
    }

    let distance
    if (defined(intersection)) {
      distance = Cartesian3.distance(ray.origin, intersection)
      preIntersectionDistance = distance
    }

    if (cameraUnderground) {
      const distanceUnderground = controller._getZoomDistanceUnderground(
        controller,
        ray
      )
      if (defined(distance)) {
        distance = Math.min(distance, distanceUnderground)
      } else {
        distance = distanceUnderground
      }
    }

    if (!defined(distance)) {
      distance = height
    }
    const unitPosition = Cartesian3.normalize(camera.position)

    controller._handleZoom(
      controller,
      startPosition,
      movement as LastInertiaConstructor,
      controller._zoomFactor,
      distance,
      Cartesian3.dot(unitPosition, camera.direction)
    )
  }

  private _handleZoom(
    object: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor,
    zoomFactor: number,
    distanceMeasure: number,
    unitPositionDotDirection: number
  ) {
    let percentage = 1.0
    if (defined(unitPositionDotDirection)) {
      percentage = HEditorMath.clamp(
        Math.abs(unitPositionDotDirection),
        0.25,
        1.0
      )
    }

    const diff = movement.endPosition.y - movement.startPosition.y
    const approachingSurface = diff > 0
    const minHeight = approachingSurface
      ? object.minimumZoomDistance * percentage
      : 0
    const maxHeight = object.maximumZoomDistance

    const minDistance = distanceMeasure - minHeight
    let zoomRate = zoomFactor * minDistance
    zoomRate = HEditorMath.clamp(
      zoomRate,
      object._minimumZoomRate,
      object._maximumZoomRate
    )

    let rangeWindowRatio = diff / object._scene.canvas.clientHeight
    rangeWindowRatio = Math.min(rangeWindowRatio, object.maximumMovementRatio)
    let distance = zoomRate * rangeWindowRatio

    if (
      object.enableCollisionDetection ||
      object.minimumZoomDistance === 0.0 ||
      !defined(object._globe)
    ) {
      if (distance > 0.0 && Math.abs(distanceMeasure - minHeight) < 1.0) {
        return
      }
      if (distance < 0.0 && Math.abs(distanceMeasure - maxHeight) < 1.0) {
        return
      }

      if (distanceMeasure - distance < minHeight) {
        distance = distanceMeasure - minHeight - 1.0
      } else if (distanceMeasure - distance > maxHeight) {
        distance = distanceMeasure - maxHeight
      }
    }

    const scene = object._scene
    const camera = scene.camera
    const mode = scene.mode

    const orientation = new HeadingPitchRoll()
    orientation.heading = camera.heading
    orientation.pitch = camera.pitch
    orientation.roll = camera.roll

    if (camera.frustum instanceof OrthographicFrustum) {
      if (Math.abs(distance) > 0.0) {
        camera.zoomIn(distance)
        camera._adjustOrthographicFrustum(true)
      }
      return
    }

    const sameStartPosition = defaultValue(
      movement.inertiaEnabled,
      Cartesian2.equals(startPosition, object._zoomMouseStart)
    )
    let zoomingOnVector = object._zoomingOnVector
    let rotatingZoom = object._rotatingZoom
    let pickedPosition

    if (!sameStartPosition) {
      object._zoomMouseStart = Cartesian2.clone(
        startPosition,
        object._zoomMouseStart
      )

      if (defined(object._globe)) {
        pickedPosition = object._pickPosition(object, startPosition)
      }

      if (defined(pickedPosition)) {
        object._useZoomWorldPosition = true
        object._zoomWorldPosition = Cartesian3.clone(
          pickedPosition,
          object._zoomWorldPosition
        )
      } else {
        object._useZoomWorldPosition = false
      }

      zoomingOnVector = object._zoomingOnVector = false
      rotatingZoom = object._rotatingZoom = false
      object._zoomingUnderground = object._cameraUnderground
    }

    if (!object._useZoomWorldPosition) {
      camera.zoomIn(distance)
      return
    }

    let zoomOnVector = false

    if (camera.positionCartographic.height < 2000000) {
      rotatingZoom = true
    }

    if (!sameStartPosition || rotatingZoom) {
      const cameraPositionNormal = Cartesian3.normalize(camera.position)
      if (
        object._cameraUnderground ||
        object._zoomingUnderground ||
        (camera.positionCartographic.height < 3000.0 &&
          Math.abs(Cartesian3.dot(camera.direction, cameraPositionNormal)) <
            0.6)
      ) {
        zoomOnVector = true
      } else {
        const canvas = scene.canvas

        const centerPixel = new Cartesian2()
        centerPixel.x = canvas.clientWidth / 2
        centerPixel.y = canvas.clientHeight / 2
        const centerPosition = object._pickPosition(object, centerPixel)

        if (!defined(centerPosition)) {
          zoomOnVector = true
        } else if (camera.positionCartographic.height < 1000000.0) {
          if (Cartesian3.dot(camera.direction, cameraPositionNormal) >= -0.5) {
            zoomOnVector = true
          } else {
            const cameraPosition = new Cartesian3()
            Cartesian3.clone(camera.position, cameraPosition)
            const target = object._zoomWorldPosition

            const targetNormal = Cartesian3.normalize(target)

            if (Cartesian3.dot(targetNormal, cameraPositionNormal) < 0.0) {
              return
            }

            const center = new Cartesian3()
            const forward = new Cartesian3()

            Cartesian3.clone(camera.direction, forward)
            Cartesian3.add(
              cameraPosition,
              Cartesian3.multiplyByScalar(forward, 1000),
              center
            )

            const positionToTarget = new Cartesian3()
            const positionToTargetNormal = new Cartesian3()
            Cartesian3.subtract(target, cameraPosition, positionToTarget)
            Cartesian3.normalize(positionToTarget, positionToTargetNormal)

            const alphaDot = Cartesian3.dot(
              cameraPositionNormal,
              positionToTargetNormal
            )
            if (alphaDot >= 0.0) {
              object._zoomMouseStart.x = -1
              return
            }

            const alpha = Math.acos(-alphaDot)
            const cameraDistance = Cartesian3.magnitude(cameraPosition)
            const targetDistance = Cartesian3.magnitude(target)
            const remainingDistance = cameraDistance - distance
            const positionToTargetDistance =
              Cartesian3.magnitude(positionToTarget)

            const gamma = Math.asin(
              HEditorMath.clamp(
                (positionToTargetDistance / targetDistance) * Math.sin(alpha),
                -1.0,
                1.0
              )
            )
            const delta = Math.asin(
              HEditorMath.clamp(
                (remainingDistance / cameraDistance) * Math.sin(alpha),
                -1.0,
                1.0
              )
            )
            const beta = gamma - delta + alpha

            const up = new Cartesian3()
            Cartesian3.normalize(cameraPosition, up)
            let right = new Cartesian3()
            right = Cartesian3.cross(positionToTargetNormal, up, right)
            right = Cartesian3.normalize(right, right)

            Cartesian3.normalize(Cartesian3.cross(up, right), forward)

            Cartesian3.multiplyByScalar(
              Cartesian3.normalize(center),
              Cartesian3.magnitude(center) - distance,
              center
            )
            Cartesian3.normalize(cameraPosition, cameraPosition)
            Cartesian3.multiplyByScalar(
              cameraPosition,
              remainingDistance,
              cameraPosition
            )

            const pMid = new Cartesian3()
            Cartesian3.multiplyByScalar(
              Cartesian3.add(
                Cartesian3.multiplyByScalar(up, Math.cos(beta) - 1),
                Cartesian3.multiplyByScalar(forward, Math.sin(beta))
              ),
              remainingDistance,
              pMid
            )
            Cartesian3.add(cameraPosition, pMid, cameraPosition)

            Cartesian3.normalize(center, up)
            Cartesian3.normalize(Cartesian3.cross(up, right), forward)

            const cMid = new Cartesian3()
            Cartesian3.multiplyByScalar(
              Cartesian3.add(
                Cartesian3.multiplyByScalar(up, Math.cos(beta) - 1),
                Cartesian3.multiplyByScalar(forward, Math.sin(beta))
              ),
              Cartesian3.magnitude(center),
              cMid
            )
            Cartesian3.add(center, cMid, center)

            Cartesian3.clone(cameraPosition, camera.position)

            Cartesian3.normalize(
              Cartesian3.subtract(center, cameraPosition),
              camera.direction
            )
            Cartesian3.clone(camera.direction, camera.direction)

            Cartesian3.cross(camera.direction, camera.up, camera.right)
            Cartesian3.cross(camera.right, camera.direction, camera.up)

            camera.setView({
              orientation
            })

            return
          }
        } else {
          const positionNormal = Cartesian3.normalize(centerPosition)
          const pickedNormal = Cartesian3.normalize(object._zoomWorldPosition)
          const dotProduct = Cartesian3.dot(pickedNormal, positionNormal)

          if (dotProduct > 0.0 && dotProduct < 1.0) {
            const angle = HEditorMath.acosClamped(dotProduct)
            const axis = Cartesian3.cross(pickedNormal, positionNormal)
            const denom =
              Math.abs(angle) > HEditorMath.toRadians(20.0)
                ? camera.positionCartographic.height * 0.75
                : camera.positionCartographic.height - distance
            const scalar = distance / denom
            camera.rotate(axis, angle * scalar)
          }
        }
      }
      object._rotatingZoom = !zoomOnVector
    }

    if ((!sameStartPosition && zoomOnVector) || zoomingOnVector) {
      let ray
      const zoomMouseStart = SceneTransforms.worldToWindowCoordinates(
        scene,
        object._zoomWorldPosition
      )
      if (
        mode !== SceneMode.COLUMBUS_VIEW &&
        Cartesian2.equals(startPosition, object._zoomMouseStart) &&
        defined(zoomMouseStart)
      ) {
        ray = camera.getPickRay(zoomMouseStart)
      } else {
        ray = camera.getPickRay(startPosition)
      }

      const rayDirection = ray.direction
      if (mode === SceneMode.COLUMBUS_VIEW || mode === SceneMode.SCENE2D) {
        Cartesian3.fromElements(
          rayDirection.y,
          rayDirection.z,
          rayDirection.x,
          rayDirection
        )
      }

      camera.move(rayDirection, distance)
      object._zoomingOnVector = true
    } else {
      camera.zoomIn(distance)
    }

    if (!object._cameraUnderground) {
      camera.setView({
        orientation
      })
    }
  }
  private _tilt3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: PinchMovement | LastInertiaConstructor
  ) {
    const scene = controller._scene
    const camera = scene.camera
    if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
      return
    }

    if (defined((movement as PinchMovement).angleAndHeight)) {
      movement = (movement as PinchMovement).angleAndHeight
    }
    if (
      !Cartesian2.equals(startPosition, controller._tiltCenterMousePosition)
    ) {
      controller._tiltOnEllipsoid = false
      controller._looking = false
    }

    if (controller._looking) {
      const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position)
      controller._look3D(controller, startPosition, movement as Movement, up)
      return
    }

    const ellipsoid = controller._ellipsoid
    const cartographic = ellipsoid.cartesianToCartographic(camera.position)

    if (
      controller._tiltOnEllipsoid ||
      cartographic?.height > controller.minimumCollisionTerrainHeight
    ) {
      controller._tiltOnEllipsoid = true
      controller._tilt3DOnEllipsoid(
        controller,
        startPosition,
        movement as Movement
      )
    } else {
      controller._tilt3DOnTerrain(
        controller,
        startPosition,
        movement as Movement
      )
    }
  }

  private _tilt3DOnEllipsoid(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: Movement
  ) {
    const ellipsoid = controller._ellipsoid
    const scene = controller._scene
    const camera = scene.camera
    const minHeight = controller.minimumZoomDistance * 0.25
    const height =
      ellipsoid.cartesianToCartographic(camera.positionWC)?.height || 0

    if (
      height - minHeight - 1.0 < HEditorMath.EPSILON3 &&
      movement.endPosition.y - movement.startPosition.y < 0.0
    ) {
      return
    }

    const canvas = scene.canvas

    const windowPosition = new Cartesian2()
    windowPosition.x = canvas.clientWidth / 2
    windowPosition.y = canvas.clientHeight / 2
    const ray = camera.getPickRay(windowPosition, tilt3DRay)!

    let center
    const intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid)

    if (defined(intersection)) {
      center = Ray.getPoint(ray, intersection.start)
    } else if (height > controller.minimumTrackBallHeight) {
      const grazingAltitudeLocation = IntersectionTests.grazingAltitudeLocation(
        ray,
        ellipsoid
      )
      if (!defined(grazingAltitudeLocation)) {
        return
      }

      const grazingAltitudeCart =
        ellipsoid.cartesianToCartographic(grazingAltitudeLocation) ||
        new Cartographic()
      grazingAltitudeCart!.height = 0.0
      center = ellipsoid.cartographicToCartesian(grazingAltitudeCart)
    } else {
      controller._looking = true
      const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position)
      controller._look3D(controller, startPosition, movement, up)
      Cartesian2.clone(startPosition, controller._tiltCenterMousePosition)
      return
    }

    const transform = Transforms.eastNorthUpToFixedFrame(center, ellipsoid)

    const oldGlobe = controller._globe
    const oldEllipsoid = controller._ellipsoid

    controller._globe = undefined
    controller._ellipsoid = Ellipsoid.UNIT_SPHERE
    controller._rotateFactor = 1.0
    controller._rotateRateRangeAdjustment = 1.0

    const oldTransform = Matrix4.clone(camera.transform)
    camera.setTransform(transform)

    controller._rotate3D(controller, startPosition, movement, Cartesian3.UNIT_Z)

    camera.setTransform(oldTransform)
    controller._globe = oldGlobe
    controller._ellipsoid = oldEllipsoid

    const radius = oldEllipsoid.maximumRadius
    controller._rotateFactor = 1.0 / radius
    controller._rotateRateRangeAdjustment = radius
  }

  private _tilt3DOnTerrain(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: MovePositionEvent
  ) {
    const ellipsoid = controller._ellipsoid
    const scene = controller._scene
    const camera = scene.camera
    const cameraUnderground = controller._cameraUnderground

    let center, ray, intersection

    if (Cartesian2.equals(startPosition, controller._tiltCenterMousePosition)) {
      center = Cartesian3.clone(controller._tiltCenter)
    } else {
      center = controller._pickPosition(controller, startPosition)

      if (!defined(center)) {
        ray = camera.getPickRay(startPosition, tilt3DRay)!
        intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid)

        if (!defined(intersection)) {
          const cartographic = ellipsoid.cartesianToCartographic(
            camera.position
          )!
          if (cartographic?.height <= controller.minimumTrackBallHeight) {
            controller._looking = true
            const up = controller._ellipsoid.geodeticSurfaceNormal(
              camera.position
            )
            controller._look3D(controller, startPosition, movement, up)
            Cartesian2.clone(startPosition, controller._tiltCenterMousePosition)
          }

          return
        }

        center = Ray.getPoint(ray, intersection.start)
      }

      if (cameraUnderground) {
        if (!defined(ray)) {
          ray = camera.getPickRay(startPosition, tilt3DRay)
        }
        controller._getTiltCenterUnderground(controller, ray, center, center)
      }

      Cartesian2.clone(startPosition, controller._tiltCenterMousePosition)
      Cartesian3.clone(center, controller._tiltCenter)
    }

    const canvas = scene.canvas

    const windowPosition = new Cartesian2()
    windowPosition.x = canvas.clientWidth / 2
    windowPosition.y = controller._tiltCenterMousePosition.y
    ray = camera.getPickRay(windowPosition, tilt3DRay)!

    const mag = Cartesian3.magnitude(center)
    const radii = Cartesian3.fromElements(mag, mag, mag)
    const newEllipsoid = Ellipsoid.fromCartesian3(radii)

    intersection = IntersectionTests.rayEllipsoid(ray, newEllipsoid)
    if (!defined(intersection)) {
      return
    }

    const t =
      Cartesian3.magnitude(ray.origin) > mag
        ? intersection.start
        : intersection.stop
    const verticalCenter = Ray.getPoint(ray, t)

    const transform = Transforms.eastNorthUpToFixedFrame(center, ellipsoid)
    const verticalTransform = Transforms.eastNorthUpToFixedFrame(
      verticalCenter,
      newEllipsoid
    )

    const oldGlobe = controller._globe
    const oldEllipsoid = controller._ellipsoid
    controller._globe = undefined
    controller._ellipsoid = Ellipsoid.UNIT_SPHERE
    controller._rotateFactor = 1.0
    controller._rotateRateRangeAdjustment = 1.0

    let constrainedAxis: Cartesian3 | undefined = Cartesian3.UNIT_Z

    const oldTransform = Matrix4.clone(camera.transform)
    camera.setTransform(verticalTransform)

    const tangent = Cartesian3.cross(verticalCenter, camera.positionWC)
    const dot = Cartesian3.dot(camera.rightWC, tangent)

    if (dot < 0.0) {
      const movementDelta = movement.startPosition.y - movement.endPosition.y
      if (
        (cameraUnderground && movementDelta < 0.0) ||
        (!cameraUnderground && movementDelta > 0.0)
      ) {
        constrainedAxis = undefined
      }

      const oldConstrainedAxis = camera.constrainedAxis
      camera.constrainedAxis = undefined

      controller._rotate3D(
        controller,
        startPosition,
        movement,
        constrainedAxis,
        true,
        false
      )

      camera.constrainedAxis = oldConstrainedAxis
    } else {
      controller._rotate3D(
        controller,
        startPosition,
        movement,
        constrainedAxis,
        false,
        true
      )
    }

    camera.setTransform(transform)
    controller._rotate3D(
      controller,
      startPosition,
      movement,
      constrainedAxis,
      false,
      true
    )
    if (defined(camera.constrainedAxis)) {
      const right = Cartesian3.cross(camera.direction, camera.constrainedAxis)
      if (
        !Cartesian3.equalsEpsilon(right, Cartesian3.ZERO, HEditorMath.EPSILON6)
      ) {
        if (Cartesian3.dot(right, camera.right) < 0.0) {
          Cartesian3.negate(right, right)
        }
        Cartesian3.cross(right, camera.direction, camera.up)
        Cartesian3.cross(camera.direction, camera.up, camera.right)

        Cartesian3.normalize(camera.right, camera.right)
        Cartesian3.normalize(camera.up, camera.up)
      }
    }

    camera.setTransform(oldTransform)
    controller._globe = oldGlobe
    controller._ellipsoid = oldEllipsoid

    const radius = oldEllipsoid.maximumRadius
    controller._rotateFactor = 1.0 / radius
    controller._rotateRateRangeAdjustment = radius

    const originalPosition = Cartesian3.clone(camera.positionWC)

    if (controller.enableCollisionDetection) {
      controller._adjustHeightForTerrain(controller, true)
    }

    if (!Cartesian3.equals(camera.positionWC, originalPosition)) {
      camera.setTransform(verticalTransform)
      camera.worldToCameraCoordinatesPoint(originalPosition, originalPosition)

      const magSqrd = Cartesian3.magnitudeSquared(originalPosition)
      if (Cartesian3.magnitudeSquared(camera.position) < magSqrd) {
        Cartesian3.normalize(camera.position, camera.position)
        Cartesian3.multiplyByScalar(
          camera.position,
          Math.sqrt(magSqrd),
          camera.position
        )
      }

      const angle = Cartesian3.angleBetween(originalPosition, camera.position)
      const axis = Cartesian3.cross(
        originalPosition,
        camera.position,
        originalPosition
      )
      Cartesian3.normalize(axis, axis)

      const quaternion = Quaternion.fromAxisAngle(axis, angle)
      const ratation = Matrix3.fromQuaternion(quaternion)
      Matrix3.multiplyByVector(ratation, camera.direction, camera.direction)
      Matrix3.multiplyByVector(ratation, camera.up, camera.up)
      Cartesian3.cross(camera.direction, camera.up, camera.right)
      Cartesian3.cross(camera.right, camera.direction, camera.up)

      camera.setTransform(oldTransform)
    }
  }

  private _look3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: Movement | LastInertiaConstructor,
    rotationAxis?: Cartesian3
  ) {
    const scene = controller._scene
    const camera = scene.camera

    const startPos = new Cartesian2()
    startPos.x = movement.startPosition.x
    startPos.y = 0.0

    const endPos = new Cartesian2()
    endPos.x = movement.endPosition.x
    endPos.y = 0.0

    let startRay = camera.getPickRay(startPos)!
    let endRay = camera.getPickRay(endPos)!
    let angle = 0.0
    let start, end

    if (camera.frustum instanceof OrthographicFrustum) {
      start = startRay.origin
      end = endRay.origin

      Cartesian3.add(camera.direction, start, start)
      Cartesian3.add(camera.direction, end, end)

      Cartesian3.subtract(start, camera.position, start)
      Cartesian3.subtract(end, camera.position, end)

      Cartesian3.normalize(start, start)
      Cartesian3.normalize(end, end)
    } else {
      start = startRay.direction
      end = endRay.direction
    }

    let dot = Cartesian3.dot(start, end)
    if (dot < 1.0) {
      angle = Math.acos(dot)
    }

    angle = movement.startPosition.x > movement.endPosition.x ? -angle : angle

    const horizontalRotationAxis = controller._horizontalRotationAxis

    if (defined(rotationAxis)) {
      camera.look(rotationAxis, -angle)
    } else if (defined(horizontalRotationAxis)) {
      camera.look(horizontalRotationAxis, -angle)
    } else {
      camera.lookLeft(angle)
    }

    startPos.x = 0.0
    startPos.y = movement.startPosition.y
    endPos.x = 0.0
    endPos.y = movement.endPosition.y

    startRay = camera.getPickRay(startPos)!
    endRay = camera.getPickRay(endPos)!
    angle = 0.0

    if (camera.frustum instanceof OrthographicFrustum) {
      start = startRay.origin
      end = endRay.origin

      Cartesian3.add(camera.direction, start, start)
      Cartesian3.add(camera.direction, end, end)

      Cartesian3.subtract(start, camera.position, start)
      Cartesian3.subtract(end, camera.position, end)

      Cartesian3.normalize(start, start)
      Cartesian3.normalize(end, end)
    } else {
      start = startRay.direction
      end = endRay.direction
    }

    dot = Cartesian3.dot(start, end)
    if (dot < 1.0) {
      angle = Math.acos(dot)
    }

    angle = movement.startPosition.y > movement.endPosition.y ? -angle : angle

    rotationAxis = defaultValue(rotationAxis, horizontalRotationAxis)!

    if (defined(rotationAxis)) {
      const direction = camera.direction
      const negativeRotationAxis = Cartesian3.negate(rotationAxis)
      const northParallel = Cartesian3.equalsEpsilon(
        direction,
        rotationAxis,
        HEditorMath.EPSILON2
      )
      const southParallel = Cartesian3.equalsEpsilon(
        direction,
        negativeRotationAxis,
        HEditorMath.EPSILON2
      )
      if (!northParallel && !southParallel) {
        dot = Cartesian3.dot(direction, rotationAxis)
        let angleToAxis = HEditorMath.acosClamped(dot)
        if (angle > 0 && angle > angleToAxis) {
          angle = angleToAxis - HEditorMath.EPSILON4
        }

        dot = Cartesian3.dot(direction, negativeRotationAxis)
        angleToAxis = HEditorMath.acosClamped(dot)
        if (angle < 0 && -angle > angleToAxis) {
          angle = -angleToAxis + HEditorMath.EPSILON4
        }

        const tagent = Cartesian3.cross(rotationAxis, direction)
        camera.look(tagent, angle)
      } else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
        camera.look(rotationAxis, -angle)
      }
    } else {
      camera.lookUp(angle)
    }
  }

  private _adjustHeightForTerrain(
    controller: ScreenSpaceCameraController,
    cameraChanged: boolean
  ) {
    controller._adjustedHeightForTerrain = true

    const scene = controller._scene
    const camera = scene.camera

    const ellipsoid = defaultValue(scene.ellipsoid, Ellipsoid.WGS84)

    let transform, mag

    if (!Matrix4.equals(Matrix4.IDENTITY, camera.transform)) {
      transform = Matrix4.clone(camera.transform)
      mag = Cartesian3.magnitude(camera.position)
      camera.setTransform(Matrix4.IDENTITY)
    }

    const cartographic = ellipsoid.cartesianToCartographic(camera.position)

    let heightUpdated = false
    if (cartographic.height < controller._minimumCollisionTerrainHeight) {
      const globeHeight = controller._scene.globeHeight
      if (defined(globeHeight)) {
        const height = globeHeight + controller.minimumZoomDistance
        const difference = globeHeight - controller._lastGlobeHeight
        const percentDifference = difference / controller._lastGlobeHeight

        if (
          cartographic.height < height &&
          (cameraChanged || Math.abs(percentDifference) <= 0.1)
        ) {
          cartographic.height = height
          ellipsoid.cartographicToCartesian(cartographic, camera.position)

          heightUpdated = true
        }

        if (cameraChanged || Math.abs(percentDifference) <= 0.1) {
          controller._lastGlobeHeight = globeHeight
        } else {
          controller._lastGlobeHeight += difference * 0.1
        }
      }
    }

    if (defined(transform)) {
      camera.setTransform(transform)
      if (heightUpdated && mag) {
        Cartesian3.normalize(camera.position, camera.position)
        Cartesian3.negate(camera.position, camera.direction)
        Cartesian3.multiplyByScalar(
          camera.direction,
          Math.max(mag, controller.minimumZoomDistance),
          camera.position
        )
        Cartesian3.normalize(camera.direction, camera.direction)
        Cartesian3.cross(camera.direction, camera.up, camera.right)
        Cartesian3.cross(camera.right, camera.direction, camera.up)
      }
    }
  }

  private _pickPosition(
    controller: ScreenSpaceCameraController,
    mousePosition: Cartesian2,
    result?: Cartesian3
  ) {
    const scene = controller._scene
    const globe = controller._globe
    const camera = scene.camera

    let depthIntersection
    if (scene.pickPositionSupported) {
      depthIntersection = scene.pickPositionWorldCoordinates(
        mousePosition,
        result
      )
    }

    if (!defined(globe) && defined(depthIntersection)) {
      return Cartesian3.clone(depthIntersection, result)
    }

    const cullBackFaces = !controller._cameraUnderground
    const ray = camera.getPickRay(mousePosition)
    const rayIntersection = globe!.pickWorldCoordinates(
      ray,
      scene,
      cullBackFaces
    )

    const pickDistance = defined(depthIntersection)
      ? Cartesian3.distance(depthIntersection, camera.positionWC)
      : Number.POSITIVE_INFINITY
    const rayDistance = defined(rayIntersection)
      ? Cartesian3.distance(rayIntersection, camera.positionWC)
      : Number.POSITIVE_INFINITY

    if (pickDistance < rayDistance && depthIntersection) {
      return Cartesian3.clone(depthIntersection, result)
    }

    return Cartesian3.clone(rayIntersection, result)
  }

  private _getZoomDistanceUnderground(
    controller: ScreenSpaceCameraController,
    ray: Ray
  ) {
    const origin = ray.origin
    const direction = ray.direction
    const distanceFromSurface = controller._getDistanceFromSurface(controller)

    const surfaceNormal = Cartesian3.normalize(origin)
    let strength = Math.abs(Cartesian3.dot(surfaceNormal, direction))
    strength = Math.max(strength, 0.5) * 2.0
    return distanceFromSurface * strength
  }
  private _getDistanceFromSurface(controller: ScreenSpaceCameraController) {
    const ellipsoid = controller._ellipsoid
    const scene = controller._scene
    const camera = scene.camera

    let height = 0.0

    const cartographic = ellipsoid.cartesianToCartographic(camera.position)
    if (defined(cartographic)) {
      height = cartographic.height
    }

    const globeHeight = defaultValue(controller._scene.globeHeight, 0.0)
    const distanceFromSurface = Math.abs(globeHeight - height)

    return distanceFromSurface
  }
  private _getTiltCenterUnderground(
    controller: ScreenSpaceCameraController,
    ray: Ray,
    pickedPosition: Cartesian3,
    result?: Cartesian3
  ) {
    let distance = Cartesian3.distance(ray.origin, pickedPosition)
    const distanceFromSurface = controller._getDistanceFromSurface(controller)

    const maximumDistance = HEditorMath.clamp(
      distanceFromSurface * 5.0,
      controller._minimumUndergroundPickDistance,
      controller._maximumUndergroundPickDistance
    )

    if (distance > maximumDistance) {
      distance = Math.min(distance, distanceFromSurface / 5.0)
      distance = Math.max(distance, 100.0)
    }

    return Ray.getPoint(ray, distance, result)
  }
  private _getStrafeStartPositionUnderground(
    controller: ScreenSpaceCameraController,
    ray: Ray,
    pickedPosition: Cartesian3,
    result?: Cartesian3
  ) {
    let distance
    if (!defined(distance)) {
      distance = controller._getDistanceFromSurface(controller)
    } else {
      distance = Cartesian3.distance(ray.origin, pickedPosition)
      if (distance > controller._maximumUndergroundPickDistance) {
        distance = controller._getDistanceFromSurface(controller)
      }
    }

    return Ray.getPoint(ray, distance, result)
  }
}
