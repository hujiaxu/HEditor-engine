import Cartesian2 from '../../Engine/Core/Cartesian2'

export interface Update {
  [key: string]: boolean
}
export interface IsDown {
  [key: string]: boolean
}
export interface EventStartPosition {
  [key: string]: Cartesian2
}
export interface PressTime {
  [key: string]: Date
}
