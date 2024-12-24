import {
  CameraEventType,
  EventTypeAndModifier,
  InputActionFunctionForEditor,
  KeyboardEventModifier,
  LastInertiaConstructor,
  LastInertiaType,
  Movement,
  PinchMovement
} from '../../type'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import defaultValue from '../Core/DefaultValue'
import defined from '../Core/Defined'
import Ellipsoid from '../Core/Ellipsoid'
import HEditorMath from '../Core/Math'
import Matrix4 from '../Core/Matrix4'
import OrthographicFrustum from '../Core/OrthographicFrustum'
import CameraEventAggregator from './CameraEventAggregator'
import Scene from './Scene'

const sameMousePosition = (movement: Movement) => {
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
const inertiaMaxClickTimeThreshold = 0.4

export default class ScreenSpaceCameraControllerForEditor {
  public enableInputs: boolean = true

  public enableTranslate = true

  public enableZoom = true

  public enableRotate = true

  public enableTilt = true

  public enableLook = true

  public inertiaSpin = 0.9
  public inertiaTranslate = 0.9

  public maximumMovementRatio = 0.1
  public bounceAnimationTime = 3.0

  public inertiaZoom = 1.0
  private _zoomFactor: number = 0.5
  public minimumZoomDistance = 1.0
  public maximumZoomDistance = Number.POSITIVE_INFINITY

  public translateEventTypes = CameraEventType.LEFT_DRAG
  public zoomEventTypes = [
    // CameraEventType.RIGHT_DRAG,
    CameraEventType.WHEEL
    // CameraEventType.PINCH
  ]

  public rotateEventTypes = CameraEventType.RIGHT_DRAG

  public tiltEventTypes = [
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

  public lookEventTypes = {
    eventType: CameraEventType.LEFT_DRAG,
    modifier: KeyboardEventModifier.SHIFT
  }
  public enableCollisionDetection = true

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
      // '_lastInertiaSpinMovement',
      '_lastInertiaTranslateMovement',
      '_lastInertiaTiltMovement'
    ],
    _lastInertiaTiltMovement: [
      '_lastInertiaSpinMovement',
      '_lastInertiaTranslateMovement'
    ]
  }

  private _rotateMousePosition: Cartesian2 = new Cartesian2(-1, -1)
  private _rotateFactor: number = 1.0
  private _rotateRateRangeAdjustment: number = 0
  private _maximumRotateRate: number = 1.77
  private _minimumRotateRate: number = 1.0 / 5.0
  private _horizontalRotationAxis: undefined | Cartesian3 = undefined

  private _tiltCenterMousePosition: Cartesian2 = new Cartesian2(-1, -1)
  private _tiltOnEllipsoid: boolean = false
  private _looking: boolean = false

  private _scene: Scene
  private _ellipsoid: Ellipsoid
  // private _cameraUnderground: boolean = false

  get scene() {
    return this._scene
  }
  constructor(scene: Scene) {
    if (!defined(scene)) {
      throw new Error('scene is required')
    }

    this._scene = scene

    const canvas = scene.canvas

    this._aggregator = new CameraEventAggregator(canvas)

    this._ellipsoid = scene.ellipsoid
  }

  public update() {
    // const radius = this._ellipsoid.maximumRadius
    const radius = 1
    this._rotateFactor = 1.0 / radius
    this._rotateRateRangeAdjustment = radius
    this._update3D(this)

    this._aggregator.reset()
  }

  private _reactToInput(
    controller: ScreenSpaceCameraControllerForEditor,
    enabled: boolean,
    eventTypes:
      | CameraEventType
      | EventTypeAndModifier
      | (CameraEventType | EventTypeAndModifier)[],
    action: InputActionFunctionForEditor,
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
          action(controller, startPosition, movement)
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
    controller: ScreenSpaceCameraControllerForEditor,
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
    action: InputActionFunctionForEditor,
    object: ScreenSpaceCameraControllerForEditor,
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

  private _update3D(controller: ScreenSpaceCameraControllerForEditor) {
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

    controller._reactToInput(
      controller,
      controller.enableTranslate,
      controller.translateEventTypes,
      // @ts-expect-error: _translate3D function has incompatible parameter types, but it's a known issue that will be fixed later
      controller._translate3D,
      controller.inertiaTranslate,
      '_lastInertiaTranslateMovement'
    )
  }

  private _translate3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor | Movement
  ) {
    const scene = controller.scene
    const camera = scene.camera

    const deltaX = movement.endPosition.x - movement.startPosition.x
    const deltaY = movement.endPosition.y - movement.startPosition.y

    camera.moveUp(deltaY * controller.maximumMovementRatio)
    camera.moveLeft(deltaX * controller.maximumMovementRatio)
  }
  private _spin3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor | Movement
  ) {
    const scene = controller.scene
    const camera = scene.camera

    if (!Matrix4.equals(camera.viewMatrix, Matrix4.IDENTITY)) {
      controller._rotate3D(controller, startPosition, movement)
      return
    }

    Cartesian2.clone(startPosition, controller._rotateMousePosition)
  }

  private _zoom3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor | PinchMovement
  ) {
    if (defined((movement as PinchMovement).distance)) {
      movement = (movement as PinchMovement).distance
    }
    // const inertiaMovement = (movement as LastInertiaConstructor).inertiaEnabled

    const scene = controller.scene
    const camera = scene.camera
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

    const diff =
      (movement as LastInertiaConstructor).endPosition.y -
      (movement as LastInertiaConstructor).startPosition.y

    const distance = diff * controller._zoomFactor
    console.log('distance: ', distance)
    camera.zoomIn(distance)
  }

  private _tilt3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor | PinchMovement
  ) {
    const scene = controller.scene
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
    if (controller._tiltOnEllipsoid) {
      console.log(controller._tiltOnEllipsoid)
    }

    if (controller._looking) {
      const up = controller._ellipsoid.geodeticSurfaceNormal(camera.position)
      controller._look3D(controller, startPosition, movement as Movement, up)
      return
    }
  }

  private _look3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor,
    rotationAxis?: Cartesian3
  ) {
    const scene = controller.scene
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
      camera.look(rotationAxis, angle)
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

    rotationAxis = defaultValue(rotationAxis, horizontalRotationAxis)

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

        const tangent = Cartesian3.cross(rotationAxis, direction)
        camera.look(tangent, angle)
      } else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
        camera.look(camera.right, -angle)
      }
    } else {
      camera.lookUp(angle)
    }
  }

  private _rotate3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor,
    constrainedAxis?: Cartesian3,
    rotateOnlyVertical?: boolean,
    rotateOnlyHorizontal?: boolean
  ) {
    rotateOnlyVertical = defaultValue(rotateOnlyVertical, false)
    rotateOnlyHorizontal = defaultValue(rotateOnlyHorizontal, false)

    const scene = controller.scene
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
    if (rotateRate < controller._minimumRotateRate) {
      rotateRate = controller._minimumRotateRate
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
      camera.rotateRight(-deltaPhi)
    }
    if (!rotateOnlyHorizontal) {
      camera.rotateUp(-deltaTheta)
    }

    camera.constrainedAxis = oldAxis
  }
}
