import {
  DoublePositionEventFunction,
  EventFunctionType,
  InputEvents,
  KeyboardEventModifier,
  MouseButton,
  MouseDownEventFunction,
  MoveEventFunction,
  ScreenSpaceEventType,
  WheelEventFunction
} from '../../type'
import AssociativeArray from '../Core/AssociativeArray'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import { defined } from '../Core/Defined'
import FeatureDetection from '../Core/FeatureDetection'
import getTimestamp from '../Core/GetTimestamp'

const checkPixelTolerance = (
  a: Cartesian2,
  b: Cartesian2,
  pixelTolerance: number
) => {
  const xDiff = a.x - b.x
  const yDiff = a.y - b.y
  const totalPixels = Math.sqrt(xDiff * xDiff + yDiff * yDiff)
  return totalPixels < pixelTolerance
}
const getKey = (
  type: ScreenSpaceEventType | string,
  modifier: KeyboardEventModifier | undefined
) => {
  let key: string = type + ''
  if (modifier) {
    key += '+' + modifier
  }

  return key
}
const mouseDownEvent = {
  position: new Cartesian2()
}
const mouseUpEvent = {
  position: new Cartesian2()
}
const mouseClickEvent = {
  position: new Cartesian2()
}
const mouseMoveEvent = {
  startPosition: new Cartesian2(),
  endPosition: new Cartesian2()
}
const mouseDblClickEvent = {
  position: new Cartesian2()
}
const touchStartEvent = {
  position: new Cartesian2()
}
const touch2StartEvent = {
  position1: new Cartesian2(),
  position2: new Cartesian2()
}
const touchEndEvent = {
  position: new Cartesian2()
}
const touchHoldEvent = {
  position: new Cartesian2()
}
const touchMoveEvent = {
  startPosition: new Cartesian2(),
  endPosition: new Cartesian2()
}
const touchPinchMovementEvent = {
  distance: {
    startPosition: new Cartesian2(),
    endPosition: new Cartesian2()
  },
  angleAndHeight: {
    startPosition: new Cartesian2(),
    endPosition: new Cartesian2()
  }
}
const touchClickEvent = {
  position: new Cartesian2()
}

export default class ScreenSpaceEventHandler {
  static mouseEmulationIgnoreMilliseconds: number
  static touchHoldDelayMillseconds: number

  private _inputEvents: InputEvents = {}
  private _buttonDown = {
    [MouseButton.LEFT]: false,
    [MouseButton.MIDDLE]: false,
    [MouseButton.RIGHT]: false
  }

  private _isPinching = false
  private _isTouchHolding = false

  private _lastSeenTouchEvent =
    -ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds

  private _primaryStartPosition = new Cartesian2()
  private _primaryPosition = new Cartesian2()
  private _primaryPreviousPosition = new Cartesian2()

  private _positions = new AssociativeArray<Cartesian2 | Cartesian3>()
  private _previousPositions = new AssociativeArray<Cartesian2 | Cartesian3>()

  private _removalFunctions: (() => void)[] = []
  private _touchHoldTimer: NodeJS.Timeout | undefined = undefined

  private _clickPixelTolerance = 5
  private _holdPixelTolerance = 25

  private _isDestroyed = false

  private _element: HTMLElement

  constructor(element: HTMLElement) {
    this._element = element || document

    this._registerListeners(this)
  }

  private _unRigisterListeners(handler: ScreenSpaceEventHandler) {
    handler._removalFunctions.forEach((func) => {
      func()
    })
  }

  private _registerListeners(handler: ScreenSpaceEventHandler) {
    const element = handler._element

    if (FeatureDetection.supportsPointerEvents()) {
      this._registerListener(
        handler,
        'pointerdown',
        element,
        handler._handlePointerDown
      )
      this._registerListener(
        handler,
        'pointerup',
        element,
        handler._handlePointerUp
      )
      this._registerListener(
        handler,
        'pointermove',
        element,
        handler._handlePointerMove
      )
      this._registerListener(
        handler,
        'pointercancel',
        element,
        handler._handlePointerUp
      )
    } else {
      this._registerListener(
        handler,
        'mousedown',
        element,
        handler._handleMouseDown
      )
      this._registerListener(
        handler,
        'mouseup',
        element,
        handler._handleMouseUp
      )
      this._registerListener(
        handler,
        'mousemove',
        element,
        handler._handleMouseMove
      )
      this._registerListener(
        handler,
        'touchstart',
        element,
        handler._handleTouchStart
      )
      this._registerListener(
        handler,
        'touchend',
        element,
        handler._handleTouchEnd
      )
      this._registerListener(
        handler,
        'touchmove',
        element,
        handler._handleTouchMove
      )
      this._registerListener<TouchEvent>(
        handler,
        'touchcancel',
        element,
        handler._handleTouchEnd
      )
    }

    this._registerListener<MouseEvent>(
      handler,
      'dblclick',
      element,
      handler._handleDblClick
    )

    let wheelEvent
    if ('onwheel' in element) {
      wheelEvent = 'wheel'
    } else {
      wheelEvent = 'DOMMouseScroll'
    }
    // else if (document.onmousewheel !== undefined) {
    //   wheelEvent = 'mousewheel'
    // }

    this._registerListener<WheelEvent>(
      handler,
      wheelEvent,
      element,
      handler._handleWheel
    )
  }

  private _registerListener<T = Event>(
    handler: ScreenSpaceEventHandler,
    type: string,
    element: HTMLElement,
    callback: (handler: ScreenSpaceEventHandler, event: T) => void
  ) {
    const listener: EventListener = (event: Event) => {
      callback(handler, event as T)
    }
    if (FeatureDetection.isInternetExplorer()) {
      element.addEventListener(type, listener, false)
    } else {
      element.addEventListener(type, listener, {
        passive: false,
        capture: false
      })
    }

    handler._removalFunctions.push(() => {
      element.removeEventListener(type, listener, false)
    })
  }

  private _handlePointerDown(
    handler: ScreenSpaceEventHandler,
    event: PointerEvent
  ) {
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)

    if (event.pointerType === 'touch' && event instanceof TouchEvent) {
      const positions = handler._positions

      const identifier = event.pointerId
      positions.set(
        identifier,
        handler._getPosition(handler, event, new Cartesian2())
      )

      handler._fireTouchEvents(handler, event)

      const previousPositions = handler._previousPositions
      previousPositions.set(
        identifier,
        Cartesian2.clone(positions.get(identifier))
      )
    } else {
      handler._handleMouseDown(handler, event)
    }
  }
  private _handlePointerUp(
    handler: ScreenSpaceEventHandler,
    event: PointerEvent
  ) {
    if (event.pointerType === 'touch' && event instanceof TouchEvent) {
      const positions = handler._positions

      const identifier = event.pointerId

      positions.remove(identifier)

      handler._fireTouchEvents(handler, event)

      const previousPositions = handler._previousPositions
      previousPositions.remove(identifier)
    } else {
      handler._handleMouseUp(handler, event)
    }
  }
  private _handlePointerMove(
    handler: ScreenSpaceEventHandler,
    event: PointerEvent
  ) {
    if (event.pointerType === 'touch' && event instanceof TouchEvent) {
      const positions = handler._positions
      const identifier = event.pointerId
      const position = positions.get(identifier)

      if (!defined(position)) {
        return
      }

      handler._getPosition(handler, event, position)
      handler._fireTouchMoveEvents(handler, event)

      const previousPositions = handler._previousPositions
      Cartesian2.clone(
        positions.get(identifier),
        previousPositions.get(identifier)
      )
    } else {
      handler._handleMouseMove(handler, event)
    }
  }
  private _handleMouseDown(
    handler: ScreenSpaceEventHandler,
    event: MouseEvent
  ) {
    if (!handler._canProcessMouseEvent(handler)) {
      return
    }
    const button = event.button as MouseButton
    handler._buttonDown[button] = true

    let screenSpaceEventType

    if (button === MouseButton.LEFT) {
      screenSpaceEventType = ScreenSpaceEventType.LEFT_DOWN
    } else if (button === MouseButton.MIDDLE) {
      screenSpaceEventType = ScreenSpaceEventType.MIDDLE_DOWN
    } else if (button === MouseButton.RIGHT) {
      screenSpaceEventType = ScreenSpaceEventType.RIGHT_DOWN
    } else {
      return
    }

    const position = handler._getPosition(
      handler,
      event,
      handler._primaryPosition
    )
    Cartesian2.clone(position, handler._primaryStartPosition)
    Cartesian2.clone(position, handler._primaryPreviousPosition)

    const modifier = handler._getModifier(event)

    const action = handler._getInputAction(screenSpaceEventType, modifier)

    if (defined(action)) {
      Cartesian2.clone(position, mouseDownEvent.position)
      ;(action as MouseDownEventFunction)(mouseDownEvent)

      event.preventDefault()
    }
  }
  private _handleMouseUp(handler: ScreenSpaceEventHandler, event: MouseEvent) {
    if (!handler._canProcessMouseEvent(handler)) {
      return
    }

    const button = event.button as MouseButton

    if (
      button !== MouseButton.LEFT &&
      button !== MouseButton.MIDDLE &&
      button !== MouseButton.RIGHT
    ) {
      return
    }

    if (handler._buttonDown[MouseButton.LEFT]) {
      handler._cancelMouseEvent(
        handler,
        ScreenSpaceEventType.LEFT_UP,
        ScreenSpaceEventType.LEFT_CLICK,
        event
      )
      handler._buttonDown[MouseButton.LEFT] = false
    }
    if (handler._buttonDown[MouseButton.MIDDLE]) {
      handler._cancelMouseEvent(
        handler,
        ScreenSpaceEventType.MIDDLE_UP,
        ScreenSpaceEventType.MIDDLE_CLICK,
        event
      )
      handler._buttonDown[MouseButton.MIDDLE] = false
    }
    if (handler._buttonDown[MouseButton.RIGHT]) {
      handler._cancelMouseEvent(
        handler,
        ScreenSpaceEventType.RIGHT_UP,
        ScreenSpaceEventType.RIGHT_CLICK,
        event
      )
      handler._buttonDown[MouseButton.RIGHT] = false
    }
  }
  private _handleMouseMove(
    handler: ScreenSpaceEventHandler,
    event: MouseEvent
  ) {
    if (!handler._canProcessMouseEvent(handler)) {
      return
    }

    const modifier = handler._getModifier(event)

    const position = handler._getPosition(
      handler,
      event,
      handler._primaryPosition
    )
    const previousPosition = handler._primaryPreviousPosition

    const action = handler._getInputAction(
      ScreenSpaceEventType.MOUSE_MOVE,
      modifier
    )

    if (defined(action)) {
      Cartesian2.clone(previousPosition, mouseMoveEvent.startPosition)
      Cartesian2.clone(position, mouseMoveEvent.endPosition)
      ;(action as MoveEventFunction)(mouseMoveEvent)
    }

    Cartesian2.clone(position, previousPosition)

    if (
      handler._buttonDown[MouseButton.LEFT] ||
      handler._buttonDown[MouseButton.MIDDLE] ||
      handler._buttonDown[MouseButton.RIGHT]
    ) {
      event.preventDefault()
    }
  }
  private _handleTouchStart(
    handler: ScreenSpaceEventHandler,
    event: TouchEvent
  ) {
    handler._getTouchEvent(handler)

    const changedTouches = event.changedTouches
    let touch, identifier
    const positions = handler._positions

    for (let i = 0; i < changedTouches.length; i++) {
      touch = changedTouches[i]
      identifier = touch.identifier

      positions.set(
        identifier,
        handler._getPosition(handler, touch, new Cartesian2())
      )
    }

    handler._fireTouchEvents(handler, event)

    const previousPositions = handler._previousPositions

    for (let i = 0; i < changedTouches.length; i++) {
      touch = changedTouches[i]
      identifier = touch.identifier

      previousPositions.set(
        identifier,
        Cartesian2.clone(positions.get(identifier))
      )
    }
  }
  private _handleTouchEnd(handler: ScreenSpaceEventHandler, event: TouchEvent) {
    handler._getTouchEvent(handler)

    const changedTouches = event.changedTouches
    let touch, identifier
    const positions = handler._positions
    const previousPositions = handler._previousPositions

    for (let i = 0; i < changedTouches.length; i++) {
      touch = changedTouches[i]
      identifier = touch.identifier

      positions.remove(identifier)
    }

    handler._fireTouchEvents(handler, event)

    for (let i = 0; i < changedTouches.length; i++) {
      touch = changedTouches[i]
      identifier = touch.identifier

      previousPositions.remove(identifier)
    }
  }
  private _handleTouchMove(
    handler: ScreenSpaceEventHandler,
    event: TouchEvent
  ) {
    handler._getTouchEvent(handler)

    const changedTouches = event.changedTouches
    let touch, identifier
    const positions = handler._positions

    for (let i = 0; i < changedTouches.length; i++) {
      touch = changedTouches[i]
      identifier = touch.identifier

      const position = positions.get(identifier)
      if (defined(position)) {
        handler._getPosition(handler, touch, position)
      }
    }

    handler._fireTouchMoveEvents(handler, event)

    const previousPositions = handler._previousPositions
    for (let i = 0; i < changedTouches.length; i++) {
      touch = changedTouches[i]
      identifier = touch.identifier

      Cartesian2.clone(
        positions.get(identifier),
        previousPositions.get(identifier)
      )
    }
  }
  private _fireTouchEvents(
    handler: ScreenSpaceEventHandler,
    event: TouchEvent
  ) {
    const modifier = handler._getModifier(event)
    const positions = handler._positions
    const numberOfTouches = positions.length

    let action, clickAction
    const pinching = handler._isPinching

    if (numberOfTouches !== 1 && handler._buttonDown[MouseButton.LEFT]) {
      handler._buttonDown[MouseButton.LEFT] = false

      if (defined(handler._touchHoldTimer)) {
        clearTimeout(handler._touchHoldTimer)
        handler._touchHoldTimer = undefined
      }

      action = handler._getInputAction(ScreenSpaceEventType.LEFT_UP, modifier)

      if (defined(action)) {
        Cartesian2.clone(handler._primaryPosition, touchEndEvent.position)
        ;(action as MouseDownEventFunction)(touchEndEvent)
      }

      if (numberOfTouches === 0 && !handler._isTouchHolding) {
        action = handler._getInputAction(
          ScreenSpaceEventType.LEFT_CLICK,
          modifier
        )

        if (defined(action)) {
          const startPosition = handler._primaryStartPosition
          const endPosition = handler._previousPositions.values[0]

          if (
            checkPixelTolerance(
              startPosition,
              endPosition,
              handler._clickPixelTolerance
            )
          ) {
            Cartesian2.clone(handler._primaryPosition, touchClickEvent.position)
            ;(action as MouseDownEventFunction)(touchClickEvent)
          }
        }
      }

      handler._isTouchHolding = false
    }

    if (numberOfTouches === 0 && pinching) {
      handler._isPinching = false

      action = handler._getInputAction(ScreenSpaceEventType.PINCH_END, modifier)

      if (defined(action)) {
        ;(action as () => void)()
      }
    }

    if (numberOfTouches === 1 && !pinching) {
      const position = positions.values[0]

      Cartesian2.clone(position, handler._primaryPosition)
      Cartesian2.clone(position, handler._primaryStartPosition)
      Cartesian2.clone(position, handler._primaryPreviousPosition)

      handler._buttonDown[MouseButton.LEFT] = true

      action = handler._getInputAction(ScreenSpaceEventType.LEFT_DOWN, modifier)

      if (defined(action)) {
        Cartesian2.clone(position, touchStartEvent.position)
        ;(action as MouseDownEventFunction)(touchStartEvent)
      }

      handler._touchHoldTimer = setTimeout(() => {
        if (!handler.isDestroyed()) {
          handler._isTouchHolding = true
          handler._touchHoldTimer = undefined

          clickAction = handler._getInputAction(
            ScreenSpaceEventType.RIGHT_CLICK,
            modifier
          )

          if (defined(clickAction)) {
            const startPosition = handler._primaryStartPosition
            const endPosition = handler._previousPositions.values[0]

            if (
              checkPixelTolerance(
                startPosition,
                endPosition,
                handler._holdPixelTolerance
              )
            ) {
              Cartesian2.clone(endPosition, touchHoldEvent.position)
              ;(clickAction as MouseDownEventFunction)(touchHoldEvent)
            }
          }
        }
      }, ScreenSpaceEventHandler.touchHoldDelayMillseconds)

      event.preventDefault()
    }

    if (numberOfTouches === 2 && !pinching) {
      handler._isPinching = true

      action = handler._getInputAction(
        ScreenSpaceEventType.PINCH_START,
        modifier
      )

      if (defined(action)) {
        Cartesian2.clone(positions.values[0], touch2StartEvent.position1)
        Cartesian2.clone(positions.values[1], touch2StartEvent.position2)
        ;(action as DoublePositionEventFunction)(touch2StartEvent)

        event.preventDefault()
      }
    }
  }
  private _fireTouchMoveEvents(
    handler: ScreenSpaceEventHandler,
    event: TouchEvent
  ) {
    const modifier = handler._getModifier(event)
    const positions = handler._positions
    const previousPositions = handler._previousPositions
    const numberOfTouches = positions.length
    let action

    if (numberOfTouches === 1 && handler._buttonDown[MouseButton.LEFT]) {
      const position = positions.values[0]
      Cartesian2.clone(position, handler._primaryPosition)

      const previousPosition = handler._primaryPreviousPosition

      action = handler._getInputAction(
        ScreenSpaceEventType.MOUSE_MOVE,
        modifier
      )

      if (defined(action)) {
        Cartesian2.clone(previousPosition, touchMoveEvent.startPosition)
        Cartesian2.clone(position, touchMoveEvent.endPosition)
        ;(action as MoveEventFunction)(touchMoveEvent)
      }

      Cartesian2.clone(position, previousPosition)

      event.preventDefault()
    } else if (numberOfTouches === 2 && handler._isPinching) {
      action = handler._getInputAction(
        ScreenSpaceEventType.PINCH_MOVE,
        modifier
      )

      if (defined(action)) {
        const position1 = positions.values[0]
        const position2 = positions.values[1]
        const previousPosition1 = previousPositions.values[0]
        const previousPosition2 = previousPositions.values[1]

        const dX = position2.x - position1.x
        const dY = position2.y - position1.y
        const dist = Math.sqrt(dX * dX + dY * dY) * 0.25

        const prevDX = previousPosition2.x - previousPosition1.x
        const prevDY = previousPosition2.y - previousPosition1.y
        const prevDist = Math.sqrt(prevDX * prevDX + prevDY * prevDY) * 0.25

        const cY = (position1.y + position2.y) * 0.125
        const prevCY = (previousPosition1.y + previousPosition2.y) * 0.125
        const angle = Math.atan2(dY, dX)
        const prevAngle = Math.atan2(prevDY, prevDX)

        Cartesian2.fromElements(
          0.0,
          prevDist,
          touchPinchMovementEvent.distance.startPosition
        )
        Cartesian2.fromElements(
          0.0,
          dist,
          touchPinchMovementEvent.distance.endPosition
        )

        Cartesian2.fromElements(
          prevAngle,
          prevCY,
          touchPinchMovementEvent.angleAndHeight.startPosition
        )
        Cartesian2.fromElements(
          angle,
          cY,
          touchPinchMovementEvent.angleAndHeight.endPosition
        )
      }
    }
  }
  private _handleDblClick(handler: ScreenSpaceEventHandler, event: MouseEvent) {
    const button = event.button

    let screenSpaceEventType

    if (button === MouseButton.LEFT) {
      screenSpaceEventType = ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    } else {
      return
    }

    const modifier = handler._getModifier(event)
    const action = handler._getInputAction(screenSpaceEventType, modifier)

    if (defined(action)) {
      handler._getPosition(handler, event, mouseDblClickEvent.position)
      ;(action as MouseDownEventFunction)(mouseDblClickEvent)
    }
  }
  private _handleWheel(handler: ScreenSpaceEventHandler, event: WheelEvent) {
    let delta

    if (defined(event.deltaY)) {
      const deltaMode = event.deltaMode
      if (deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        delta = -event.deltaY
      } else if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta = -event.deltaY * 40
      } else {
        delta = -event.deltaY * 120
      }
    } else if (event.detail > 0) {
      delta = event.detail * -120
    } else {
      // delta = event.wheelDelta
    }

    if (!defined(delta)) return

    const modifier = handler._getModifier(event)
    const action = handler._getInputAction(ScreenSpaceEventType.WHEEL, modifier)

    if (defined(action)) {
      ;(action as WheelEventFunction)(delta)

      event.preventDefault()
    }
  }

  private _canProcessMouseEvent(handler: ScreenSpaceEventHandler) {
    return (
      getTimestamp() - handler._lastSeenTouchEvent >
      ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds
    )
  }
  private _cancelMouseEvent(
    handler: ScreenSpaceEventHandler,
    screenSpaceEventType: ScreenSpaceEventType,
    clickScreenSpaceEventType: ScreenSpaceEventType,
    event: MouseEvent
  ) {
    const modifier = handler._getModifier(event)
    const action = handler._getInputAction(screenSpaceEventType, modifier)
    const clickAction = handler._getInputAction(
      clickScreenSpaceEventType,
      modifier
    )

    if (defined(action) || defined(clickAction)) {
      const position = handler._getPosition(
        handler,
        event,
        handler._primaryPosition
      )

      if (defined(action)) {
        Cartesian2.clone(position, mouseUpEvent.position)
        ;(action as MouseDownEventFunction)(mouseUpEvent)
      }

      if (defined(clickAction)) {
        const startPosition = handler._primaryStartPosition

        if (
          checkPixelTolerance(
            startPosition,
            position,
            handler._clickPixelTolerance
          )
        ) {
          Cartesian2.clone(startPosition, mouseClickEvent.position)
          ;(clickAction as MouseDownEventFunction)(mouseClickEvent)
        }
      }
    }
  }
  private _getTouchEvent(handler: ScreenSpaceEventHandler) {
    handler._lastSeenTouchEvent = getTimestamp()
  }
  private _getPosition(
    handler: ScreenSpaceEventHandler,
    event: PointerEvent | MouseEvent | Touch,
    result: Cartesian2
  ) {
    const element = handler._element

    if (element instanceof Document) {
      result.x = event.clientX
      result.y = event.clientY
      return result
    }

    const rect = element.getBoundingClientRect()
    result.x = event.clientX - rect.left
    result.y = event.clientY - rect.top
    return result
  }

  private _getModifier(event: MouseEvent | TouchEvent) {
    if (event.shiftKey) {
      return KeyboardEventModifier.SHIFT
    } else if (event.ctrlKey) {
      return KeyboardEventModifier.CTRL
    } else if (event.altKey) {
      return KeyboardEventModifier.ALT
    }

    return undefined
  }

  private _getInputAction(
    type: ScreenSpaceEventType,
    modifier?: KeyboardEventModifier
  ) {
    if (!defined(type)) {
      throw new Error('type is required.')
    }
    const key = getKey(type, modifier)

    return this._inputEvents[key]
  }

  public setInputAction(
    action: EventFunctionType,
    type: ScreenSpaceEventType,
    modifier?: KeyboardEventModifier | undefined
  ) {
    if (!defined(action)) {
      throw new Error('action is required.')
    }
    if (!defined(type)) {
      throw new Error('type is required.')
    }

    const key = getKey(type, modifier)
    this._inputEvents[key] = action
  }
  public destory() {
    this._unRigisterListeners(this)
    this._isDestroyed = true
  }

  isDestroyed() {
    return this._isDestroyed
  }
}

ScreenSpaceEventHandler.mouseEmulationIgnoreMilliseconds = 800
ScreenSpaceEventHandler.touchHoldDelayMillseconds = 1500
