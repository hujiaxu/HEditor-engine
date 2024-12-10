import {
  CameraEventType,
  EventStartPosition,
  IsDown,
  KeyboardEventModifier,
  Movement,
  PinchMovement,
  PressTime,
  ScreenSpaceEventType,
  Update
} from '../../type'
import Cartesian2 from '../Core/Cartesian2'
import { defined } from '../Core/Defined'
import HEditorMath from '../Core/Math'
import ScreenSpaceEventHandler from './ScreenSpaceEventHandler'

const getKey = (
  type: CameraEventType | string,
  modifier: KeyboardEventModifier | undefined
) => {
  let key: string = type + ''
  if (modifier) {
    key += '+' + modifier
  }

  return key
}

export default class CameraEventAggregator {
  private _eventHandler: ScreenSpaceEventHandler

  private _update: Update = {}
  private _movement: {
    [key: string]: Movement | object | PinchMovement
  } = {}
  private _lastMovement: {
    [key: string]: Movement | object
  } = {}
  private _isDown: IsDown = {}
  private _eventStartPosition: EventStartPosition = {}
  private _pressTime: PressTime = {}
  private _releaseTime: PressTime = {}

  private _buttonDown = 0
  private _currentMousePosition = new Cartesian2()

  get currentMousePosition() {
    return this._currentMousePosition
  }

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) throw new Error('canvas is required')

    this._eventHandler = new ScreenSpaceEventHandler(canvas)

    this._listenToWheel(this, undefined)
    this._listenToPinch(this, undefined, canvas)
    this._listenMouseButtonDownUp(this, undefined, CameraEventType.LEFT_DRAG)
    this._listenMouseButtonDownUp(this, undefined, CameraEventType.RIGHT_DRAG)
    this._listenMouseButtonDownUp(this, undefined, CameraEventType.MIDDLE_DRAG)
    this._listenMouseMove(this, undefined)

    for (const modifierName in KeyboardEventModifier) {
      const modifier = Number(
        KeyboardEventModifier[modifierName]
      ) as KeyboardEventModifier
      this._listenToWheel(this, modifier)
      this._listenToPinch(this, modifier, canvas)
      this._listenMouseButtonDownUp(this, modifier, CameraEventType.LEFT_DRAG)
      this._listenMouseButtonDownUp(this, modifier, CameraEventType.RIGHT_DRAG)
      this._listenMouseMove(this, modifier)
    }
  }

  private _listenToWheel(
    aggregator: CameraEventAggregator,
    modifier: KeyboardEventModifier | undefined
  ) {
    const key = getKey(CameraEventType.WHEEL, modifier)

    const pressTime = aggregator._pressTime
    const releaseTime = aggregator._releaseTime

    const update = aggregator._update
    update[key] = true

    let movement = aggregator._movement[key] as Movement
    if (!defined(movement)) {
      movement = aggregator._movement[key] = {
        startPosition: new Cartesian2(),
        endPosition: new Cartesian2()
        // valid: false
      }
    }

    let lastMovement = aggregator._lastMovement[key] as Movement
    if (!defined(lastMovement)) {
      lastMovement = aggregator._lastMovement[key] = {
        startPosition: new Cartesian2(),
        endPosition: new Cartesian2(),
        valid: false
      }
    }

    aggregator._eventHandler.setInputAction(
      (delta: number) => {
        const arcLength = 7.5 * HEditorMath.toRadians(delta)
        pressTime[key] = releaseTime[key] = new Date()

        movement.endPosition.x = 0.0
        movement.endPosition.y = arcLength
        Cartesian2.clone(movement.endPosition, lastMovement.endPosition)
        lastMovement.valid = true
        update[key] = false
      },
      ScreenSpaceEventType.WHEEL,
      modifier
    )
  }

  private _listenToPinch(
    aggregator: CameraEventAggregator,
    modifier: KeyboardEventModifier | undefined,
    canvas: HTMLCanvasElement
  ) {
    const key = getKey(CameraEventType.PINCH, modifier)

    const update = aggregator._update
    const isDown = aggregator._isDown
    const eventStartPosition = aggregator._eventStartPosition
    const pressTime = aggregator._pressTime
    const releaseTime = aggregator._releaseTime

    update[key] = true
    isDown[key] = false
    eventStartPosition[key] = new Cartesian2()

    let movement = aggregator._movement[key] as PinchMovement

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
    }

    aggregator._eventHandler.setInputAction(
      (e: { position1: Cartesian2; position2: Cartesian2 }) => {
        aggregator._buttonDown++
        isDown[key] = true
        pressTime[key] = new Date()

        Cartesian2.lerp(e.position1, e.position2, 0.5, eventStartPosition[key])
      },
      ScreenSpaceEventType.PINCH_START,
      modifier
    )

    aggregator._eventHandler.setInputAction(
      () => {
        aggregator._buttonDown = Math.max(0, aggregator._buttonDown - 1)
        releaseTime[key] = new Date()
        isDown[key] = false
      },
      ScreenSpaceEventType.PINCH_END,
      modifier
    )

    aggregator._eventHandler.setInputAction(
      (mouseMovement: PinchMovement) => {
        if (isDown[key]) {
          if (!update[key]) {
            Cartesian2.clone(
              mouseMovement.distance.endPosition,
              movement.distance.endPosition
            )
            Cartesian2.clone(
              mouseMovement.angleAndHeight.endPosition,
              movement.angleAndHeight.endPosition
            )
          } else {
            this._clonePinchMovement(mouseMovement, movement)
            update[key] = false
            movement.prevAngle = movement.angleAndHeight.startPosition.x
          }

          let angle = movement.angleAndHeight.endPosition.x
          const prevAngle = movement.prevAngle
          const TwoPI = Math.PI * 2.0
          while (angle >= prevAngle + Math.PI) {
            angle -= TwoPI
          }
          while (angle < prevAngle - Math.PI) {
            angle += TwoPI
          }
          movement.angleAndHeight.endPosition.x =
            (-angle * canvas.clientWidth) / 12
          movement.angleAndHeight.startPosition.x =
            (-prevAngle * canvas.clientWidth) / 12
        }
      },
      ScreenSpaceEventType.PINCH_MOVE,
      modifier
    )
  }

  private _listenMouseButtonDownUp(
    aggregator: CameraEventAggregator,
    modifier: KeyboardEventModifier | undefined,
    type: CameraEventType
  ) {
    const key = getKey(type, modifier)

    const isDown = aggregator._isDown
    const eventStartPosition = aggregator._eventStartPosition
    const pressTime = aggregator._pressTime
    const releaseTime = aggregator._releaseTime

    isDown[key] = false
    eventStartPosition[key] = new Cartesian2()

    let lastMovement = aggregator._lastMovement[key] as Movement
    if (!defined(lastMovement)) {
      lastMovement = aggregator._lastMovement[key] = {
        startPosition: new Cartesian2(),
        endPosition: new Cartesian2(),
        valid: false
      }
    }

    let down, up

    if (type === CameraEventType.LEFT_DRAG) {
      down = ScreenSpaceEventType.LEFT_DOWN
      up = ScreenSpaceEventType.LEFT_UP
    } else if (type === CameraEventType.RIGHT_DRAG) {
      down = ScreenSpaceEventType.RIGHT_DOWN
      up = ScreenSpaceEventType.RIGHT_UP
    } else if (type === CameraEventType.MIDDLE_DRAG) {
      down = ScreenSpaceEventType.MIDDLE_DOWN
      up = ScreenSpaceEventType.MIDDLE_UP
    }

    aggregator._eventHandler.setInputAction(
      (event: { position: Cartesian2 }) => {
        aggregator._buttonDown++
        lastMovement.valid = false
        isDown[key] = true
        pressTime[key] = new Date()
        Cartesian2.clone(event.position, eventStartPosition[key])
      },
      down!,
      modifier
    )

    aggregator._eventHandler.setInputAction(
      () => {
        aggregator._buttonDown = Math.max(0, aggregator._buttonDown - 1)
        releaseTime[key] = new Date()
        isDown[key] = false
      },
      up!,
      modifier
    )
  }

  private _listenMouseMove(
    aggregator: CameraEventAggregator,
    modifier: KeyboardEventModifier | undefined
  ) {
    const update = aggregator._update
    const movement = aggregator._movement
    const lastMovement = aggregator._lastMovement
    const isDown = aggregator._isDown

    for (const typeName in CameraEventType) {
      const type = CameraEventType[typeName]
      if (defined(type)) {
        const key = getKey(type, modifier)
        update[key] = true

        if (!defined(aggregator._lastMovement[key])) {
          aggregator._lastMovement[key] = {
            startPosition: new Cartesian2(),
            endPosition: new Cartesian2(),
            valid: false
          }
        }
        if (!defined(aggregator._movement[key])) {
          aggregator._movement[key] = {
            startPosition: new Cartesian2(),
            endPosition: new Cartesian2()
          }
        }
      }
    }

    aggregator._eventHandler.setInputAction(
      (mouseMovement: Movement) => {
        for (const typeName in CameraEventType) {
          const type = CameraEventType[typeName]
          if (defined(type)) {
            const key = getKey(type, modifier)
            if (isDown[key]) {
              if (!update[key]) {
                Cartesian2.clone(
                  mouseMovement.endPosition,
                  (movement[key] as Movement).endPosition
                )
              } else {
                const move = movement[key] as Movement
                const lastMove = lastMovement[key] as Movement
                lastMove.valid = true
                this._cloneMovement(move, lastMove)
                update[key] = false
              }
            }
          }
        }

        Cartesian2.clone(
          mouseMovement.endPosition,
          aggregator._currentMousePosition
        )
      },
      ScreenSpaceEventType.MOUSE_MOVE,
      modifier
    )
  }

  private _cloneMovement(movement: Movement, result: Movement) {
    Cartesian2.clone(movement.startPosition, result.startPosition)
    Cartesian2.clone(movement.endPosition, result.endPosition)
  }
  private _clonePinchMovement(
    pinchMovement: PinchMovement,
    result: PinchMovement
  ) {
    Cartesian2.clone(
      pinchMovement.distance.startPosition,
      result.distance.startPosition
    )
    Cartesian2.clone(
      pinchMovement.distance.endPosition,
      result.distance.endPosition
    )
    Cartesian2.clone(
      pinchMovement.angleAndHeight.startPosition,
      result.angleAndHeight.startPosition
    )
    Cartesian2.clone(
      pinchMovement.angleAndHeight.endPosition,
      result.angleAndHeight.endPosition
    )
  }

  public isMoving(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    const key = getKey(type, modifier)

    return !this._update[key]
  }
  public getMovement(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    const key = getKey(type, modifier)
    const movement = this._movement[key] as Movement | PinchMovement

    return movement
  }
  public getLastMovement(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    const key = getKey(type, modifier)
    const lastMovement = this._lastMovement[key] as Movement
    if (lastMovement.valid) {
      return lastMovement
    }

    return undefined
  }
  public getStartMousePosition(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    if (type === CameraEventType.WHEEL) {
      return this._currentMousePosition
    }
    const key = getKey(type, modifier)

    return this._eventStartPosition[key]
  }
  public getButtonPressTime(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    const key = getKey(type, modifier)

    return this._pressTime[key]
  }
  public getButtonReleaseTime(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    const key = getKey(type, modifier)

    return this._releaseTime[key]
  }
  public isButtonDown(
    type: CameraEventType,
    modifier: KeyboardEventModifier | undefined
  ) {
    if (!defined(type)) {
      throw new Error('type is required')
    }

    const key = getKey(type, modifier)

    return this._isDown[key]
  }
}
