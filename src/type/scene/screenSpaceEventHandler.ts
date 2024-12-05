import Cartesian2 from '../../Engine/Core/Cartesian2'

export interface SinglePositionEvent {
  position: Cartesian2
}
export interface DoublePositionEvent {
  position1: Cartesian2
  position2: Cartesian2
}
export interface MovePositionEvent {
  startPosition: Cartesian2
  endPosition: Cartesian2
}
export interface PinchMovement {
  distance: {
    startPosition: Cartesian2
    endPosition: Cartesian2
  }
  angleAndHeight: {
    startPosition: Cartesian2
    endPosition: Cartesian2
  }
  prevAngle: number
}
export interface Movement {
  startPosition: Cartesian2
  endPosition: Cartesian2
  valid?: boolean
}
export type WheelEventFunction = <T extends number>(delta: T) => void
export type MouseDownEventFunction = <T extends SinglePositionEvent>(
  event: T
) => void
export type DoublePositionEventFunction = <T extends DoublePositionEvent>(
  event: T
) => void
export type PinchMoveEventFunction = <T extends PinchMovement>(event: T) => void
export type MoveEventFunction = <T extends Movement>(event: T) => void
export type EventFunctionType =
  | WheelEventFunction
  | MouseDownEventFunction
  | DoublePositionEventFunction
  | PinchMoveEventFunction
  | MoveEventFunction
