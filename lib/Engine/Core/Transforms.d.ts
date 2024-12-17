import Cartesian3 from './Cartesian3';
import Ellipsoid from './Ellipsoid';
import Matrix4 from './Matrix4';
export declare enum UpVectorProductLocalFrame {
    south = "east",
    north = "west",
    west = "south",
    east = "north"
}
export declare enum DownVectorProductLocalFrame {
    south = "west",
    north = "east",
    west = "north",
    east = "south"
}
export declare enum SouthVectorProductLocalFrame {
    up = "west",
    down = "east",
    west = "down",
    east = "up"
}
export declare enum NorthVectorProductLocalFrame {
    up = "east",
    down = "west",
    west = "up",
    east = "down"
}
export declare enum WestVectorProductLocalFrame {
    up = "north",
    down = "south",
    north = "down",
    south = "up"
}
export declare enum EastVectorProductLocalFrame {
    up = "south",
    down = "north",
    north = "up",
    south = "down"
}
export declare enum VectorProductLocalFrameEnum {
    up = "up",
    down = "down",
    north = "north",
    south = "south",
    east = "east",
    west = "west"
}
export type VectorProductLocalFrameType = 'up' | 'down' | 'south' | 'north' | 'east' | 'west';
export type VectorProductLocalFrameTypeCollection = UpVectorProductLocalFrame | DownVectorProductLocalFrame | SouthVectorProductLocalFrame | NorthVectorProductLocalFrame | WestVectorProductLocalFrame | EastVectorProductLocalFrame;
export type FixedFrameFunction = (origin: Cartesian3, ellipsoid: Ellipsoid, result?: Matrix4) => Matrix4;
export default class Transforms {
    static localFrameToFixedFrameGenerator: (firstAxis: VectorProductLocalFrameType, secondAxis: VectorProductLocalFrameType) => FixedFrameFunction;
    static eastNorthUpToFixedFrame: FixedFrameFunction;
    static northEastDownToFixedFrame: FixedFrameFunction;
    static northUpEastToFixedFrame: FixedFrameFunction;
    static northWestUpToFixedFrame: FixedFrameFunction;
}
