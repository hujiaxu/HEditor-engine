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
import { defined } from '../Core/Defined'
import HEditorMath from '../Core/Math'
import Matrix4 from '../Core/Matrix4'
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
  public inertiaZoom = 0.9

  public maximumMovementRatio = 0.1
  public bounceAnimationTime = 3.0

  public minimumZoomDistance = 1.0
  public maximumZoomDistance = Number.POSITIVE_INFINITY

  public translateEventTypes = CameraEventType.LEFT_DRAG
  public zoomEventTypes = [
    CameraEventType.RIGHT_DRAG,
    CameraEventType.WHEEL,
    CameraEventType.PINCH
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
      '_lastInertiaSpinMovement',
      '_lastInertiaTranslateMovement',
      '_lastInertiaTiltMovement'
    ],
    _lastInertiaTiltMovement: [
      '_lastInertiaSpinMovement',
      '_lastInertiaTranslateMovement'
    ]
  }

  private _rotateMousePosition: Cartesian2 = new Cartesian2(-1, -1)

  private _scene: Scene

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
  }

  public update() {
    this._update3D(this)
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
    camera.updateViewMatrix(camera)
    // const canvas = scene.canvas
  }

  private _tilt3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor | PinchMovement
  ) {
    const scene = controller.scene
    const camera = scene.camera
    camera.updateViewMatrix(camera)
    console.log(startPosition, movement)
  }

  private _look3D(
    controller: ScreenSpaceCameraControllerForEditor,
    startPosition: Cartesian2,
    movement: LastInertiaConstructor
  ) {
    const scene = controller.scene
    const camera = scene.camera
    camera.updateViewMatrix(camera)
    console.log(startPosition, movement)
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

    if (rotateOnlyVertical || rotateOnlyHorizontal) {
      console.log(startPosition, movement)
    }
    const scene = controller.scene
    const camera = scene.camera
    // const canvas = scene.canvas

    const oldAxis = camera.constrainedAxis
    if (defined(constrainedAxis)) {
      camera.constrainedAxis = constrainedAxis
    }
    camera.constrainedAxis = oldAxis
  }
}
