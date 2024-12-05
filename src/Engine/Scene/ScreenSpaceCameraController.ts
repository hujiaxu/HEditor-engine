import {
  CameraEventType,
  KeyboardEventModifier,
  Movement,
  MovePositionEvent,
  PinchMovement
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
import TweenCollection from './TweenCollection'

let preIntersectionDistance = 0

interface EventTypeAndModifier {
  eventType: CameraEventType
  modifier: KeyboardEventModifier
}

const scratchDadii = new Cartesian3()
const scratchLookUp = new Cartesian3()
const scratchEllipsoid = new Ellipsoid()
const scratchCartographic = new Cartographic()
const scratchMousePosition = new Cartesian3()

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
  private _lastInertiaZoomMovement = undefined
  private _lastInertiaTranslateMovement = undefined
  private _lastInertiaTiltMovement = undefined

  private _inertiaDisablers = {
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

  private _tweens = new TweenCollection()
  private _tween = undefined

  private _horizontalRotationAxis = undefined

  private _tiltCenterMousePosition = new Cartesian2(-1.0, -1.0)
  private _tiltCenter = new Cartesian3()
  private _rotateMousePosition = new Cartesian2(-1.0, -1.0)
  private _rotateStartPosition = new Cartesian3()
  private _strafeStartPosition = new Cartesian3()
  private _strafeMousePosition = new Cartesian2()
  private _strafeEndMousePosition = new Cartesian2()
  private _zoomMouseStart = new Cartesian2(-1.0, -1.0)
  private _zoomWorldPosition = new Cartesian3()
  private _useZoomWorldPosition = false
  private _panLastMousePosition = new Cartesian2()
  private _panLastWorldPosition = new Cartesian3()
  private _tiltCVOffMap = false
  private _looking = false
  private _rotating = false
  private _strafing = false
  private _zoomingUnderground = false
  private _zoomingOnVector = false
  private _rotatingZoom = false
  private _adnustedHeightForTerrain = false
  private _cameraUnderground = false

  private _tiltOnEllipsoid = false

  private _zoomFactor = 5.0
  private _rotateFactor = 1.0
  private _rotateRateRangeAdjustment = 1.0
  private _maximumRotateRate = 1.77
  private minimumRotateRate = 1.0 / 5000.0
  private minimumZoomRate = 20.0
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

    this.minimumTrackBallHeight = Ellipsoid.WGS84.equals(ellipsoid)
      ? 7500000.0
      : ellipsoid.minimumRadius * 1.175

    this._aggregator = new CameraEventAggregator(scene.canvas)
  }

  update() {
    const { camera } = this._scene
  }

  private _reactToInput(
    controller: ScreenSpaceCameraController,
    enabled: boolean,
    eventTypes:
      | CameraEventType
      | EventTypeAndModifier
      | (CameraEventType | EventTypeAndModifier)[],
    action: Function,
    inertiaConstant?: number,
    inertiaStateName?: string
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
          action(controller, startPosition, movement)
        }
      }
    }
  }

  update3D(controller: ScreenSpaceCameraController) {
    controller._reactToInput(
      controller,
      controller.enableRotate,
      controller.rotateEventTypes,
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
      controller._look3D
    )
  }

  private _spin3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: Movement
  ) {
    const scene = controller._scene
    const camera = scene.camera
    const cameraUnderground = controller._cameraUnderground
    let ellipsoid = controller._ellipsoid

    if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
      controller.rotate3D(controller, startPosition, movement)
      return
    }

    let magnitude, radii

    const up = ellipsoid.geodeticSurfaceNormal(camera.position, scratchLookUp)

    if (Cartesian2.equals(startPosition, controller._rotateMousePosition)) {
      if (controller._looking) {
        controller.look3D(controller, startPosition, movement, up)
      } else if (controller._rotating) {
        controller.rotate3D(controller, startPosition, movement)
      } else if (controller._strafing) {
        controller.continueStrafing(controller, movement)
      } else {
        if (
          Cartesian3.magnitude(camera.position) <
          Cartesian3.magnitude(controller._rotateStartPosition)
        ) {
          return
        }

        magnitude = Cartesian3.magnitude(controller._rotateStartPosition)
        radii = scratchDadii
        radii.x = radii.y = radii.z = magnitude
        ellipsoid = Ellipsoid.fromCartesian3(radii, scratchEllipsoid)

        controller.pan3D(controller, startPosition, movement, ellipsoid)
      }

      return
    }

    controller._looking = false
    controller._rotating = false
    controller._strafing = false

    const height =
      ellipsoid.cartesianToCartographic(camera.positionWC, scratchCartographic)
        ?.height || 0
    const globe = controller._globe

    if (
      defined(globe) &&
      defined(height) &&
      height < controller.minimumPickingTerrainHeight
    ) {
      const mousePos = controller.pickPosition(
        controller,
        movement.startPosition,
        scratchMousePosition
      )

      if (defined(mousePos)) {
        let strafing = false
        const ray = camera.getPickRay(
          movement.startPosition,
          pickGlobeScrachRay
        )
        if (cameraUnderground) {
          const strafing = false
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
          radii = scratchDadii
          radii.x = radii.y = radii.z = magnitude
          ellipsoid = Ellipsoid.fromCartesian3(radii, scratchEllipsoid)

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
    } else if (height > controller._minimumTrackBallHeight) {
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
    movement: Movement,
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
    }

    if (!rotateOnlyHorizontal) {
      camera.rotateUp(deltaTheta)
    }

    camera.constranedAxis = oldAxis
  }

  private _pan3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: Movement,
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
      ellipsoid.cartesianToCartographic(camera.position, scratchCartographic)
        ?.height || 0.0

    let p0, p1

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
        ).direction
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
        if (defined(camera.frustum.fov)) {
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
      p0 = camera.pickEllipsoid(startMousePosition, ellipsoid, pan3DP0)
      p1 = camera.pickEllipsoid(endMousePosition, ellipsoid, pan3DP1)
    }

    if (!defined(p0) || !defined(p1)) {
      controller._rotating = true
      controller._rotate3D(controller, startPosition, movement)
      return
    }

    p0 = camera.worldToCameraCoordinates(p0, p1)
    p1 = camera.worldToCameraCoordinates(p1, p1)

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
      const basis0 = camera.constainedAxis
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
    movement: Movement
  ) {
    if (defined(movement.distance)) {
      movement = movement.distance
    }

    const inertiaMovement = movement.inertiaEnabled

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
      windowPosition.x = startPosition.x
      windowPosition.y = startPosition.y
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
      intersection = controller._pickPosition(
        controller,
        windowPosition,
        zoomCVIntersection
      )
    }

    let distance
    if (defined(intersection)) {
      distance = Cartesian3.distance(ray.origin, intersection)
      preIntersectionDistance = distance
    }

    if (cameraUnderground) {
      const distanceUnderground = controller._getZoomDistanceUnderground(
        controller,
        ray,
        height
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
      movement,
      controller._zoomFactor,
      distance,
      Cartesian3.dot(unitPosition, camera.direction)
    )
  }

  private _tilt3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: PinchMovement | MovePositionEvent
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
      controller._look3D(
        controller,
        startPosition,
        movement as MovePositionEvent,
        up
      )
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
        movement as MovePositionEvent
      )
    } else {
      controller._tilt3DOnTerrain(
        controller,
        startPosition,
        movement as MovePositionEvent
      )
    }
  }

  private _tilt3DOnEllipsoid(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: MovePositionEvent
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
    const newEllipsoid = Ellipsoid.fromCartesian3(radii, scratchEllipsoid)

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

      if (defined(camera.constrainedAxis)) {
        const right = Cartesian3.cross(camera.direction, camera.constrainedAxis)
        if (
          !Cartesian3.equalsEpsilon(
            right,
            Cartesian3.ZERO,
            HEditorMath.EPSILON6
          )
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
  }

  private _look3D(
    controller: ScreenSpaceCameraController,
    startPosition: Cartesian2,
    movement: MovePositionEvent,
    rotationAxis: Cartesian3
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
}
