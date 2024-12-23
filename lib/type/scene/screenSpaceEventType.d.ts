import { EventFunctionType } from './screenSpaceEventHandler';
export declare enum ScreenSpaceEventType {
    LEFT_DOWN = 0,
    LEFT_UP = 1,
    LEFT_CLICK = 2,
    LEFT_DOUBLE_CLICK = 3,
    RIGHT_DOWN = 5,
    RIGHT_UP = 6,
    RIGHT_CLICK = 7,
    MIDDLE_DOWN = 10,
    MIDDLE_UP = 11,
    MIDDLE_CLICK = 12,
    MOUSE_MOVE = 15,
    WHEEL = 16,
    PINCH_START = 17,
    PINCH_END = 18,
    PINCH_MOVE = 19
}
export declare enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
}
export interface InputEvents {
    [key: string]: EventFunctionType;
}
