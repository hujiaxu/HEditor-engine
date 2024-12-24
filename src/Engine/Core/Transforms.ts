import Cartesian3 from './Cartesian3'
import defaultValue from './DefaultValue'
import defined from './Defined'
import Ellipsoid from './Ellipsoid'
import HEditorMath from './Math'
import Matrix4 from './Matrix4'

export enum UpVectorProductLocalFrame {
  south = 'east',
  north = 'west',
  west = 'south',
  east = 'north'
}
export enum DownVectorProductLocalFrame {
  south = 'west',
  north = 'east',
  west = 'north',
  east = 'south'
}
export enum SouthVectorProductLocalFrame {
  up = 'west',
  down = 'east',
  west = 'down',
  east = 'up'
}
export enum NorthVectorProductLocalFrame {
  up = 'east',
  down = 'west',
  west = 'up',
  east = 'down'
}
export enum WestVectorProductLocalFrame {
  up = 'north',
  down = 'south',
  north = 'down',
  south = 'up'
}
export enum EastVectorProductLocalFrame {
  up = 'south',
  down = 'north',
  north = 'up',
  south = 'down'
}
export enum VectorProductLocalFrameEnum {
  up = 'up',
  down = 'down',
  north = 'north',
  south = 'south',
  east = 'east',
  west = 'west'
}
export type VectorProductLocalFrameType =
  | 'up'
  | 'down'
  | 'south'
  | 'north'
  | 'east'
  | 'west'
export type VectorProductLocalFrameTypeCollection =
  | UpVectorProductLocalFrame
  | DownVectorProductLocalFrame
  | SouthVectorProductLocalFrame
  | NorthVectorProductLocalFrame
  | WestVectorProductLocalFrame
  | EastVectorProductLocalFrame
const vectorProductLocalFrame: Record<
  VectorProductLocalFrameType,
  Record<string, VectorProductLocalFrameTypeCollection>
> = {
  up: {
    south: UpVectorProductLocalFrame.south,
    north: UpVectorProductLocalFrame.north,
    west: UpVectorProductLocalFrame.west,
    east: UpVectorProductLocalFrame.east
  },
  down: {
    south: DownVectorProductLocalFrame.south,
    north: DownVectorProductLocalFrame.north,
    west: DownVectorProductLocalFrame.west,
    east: DownVectorProductLocalFrame.east
  },
  south: {
    up: SouthVectorProductLocalFrame.up,
    down: SouthVectorProductLocalFrame.down,
    west: SouthVectorProductLocalFrame.west,
    east: SouthVectorProductLocalFrame.east
  },
  north: {
    up: NorthVectorProductLocalFrame.up,
    down: NorthVectorProductLocalFrame.down,
    west: NorthVectorProductLocalFrame.west,
    east: NorthVectorProductLocalFrame.east
  },
  west: {
    up: WestVectorProductLocalFrame.up,
    down: WestVectorProductLocalFrame.down,
    north: WestVectorProductLocalFrame.north,
    south: WestVectorProductLocalFrame.south
  },
  east: {
    up: EastVectorProductLocalFrame.up,
    down: EastVectorProductLocalFrame.down,
    north: EastVectorProductLocalFrame.north,
    south: EastVectorProductLocalFrame.south
  }
}

const scratchCalculateCartesian: Record<
  VectorProductLocalFrameType,
  Cartesian3
> = {
  east: new Cartesian3(),
  up: new Cartesian3(),
  down: new Cartesian3(),
  south: new Cartesian3(),
  north: new Cartesian3(),
  west: new Cartesian3()
}
let scratchFirstCartesian = new Cartesian3()
let scratchSecondCartesian = new Cartesian3()
let scratchThirdCartesian = new Cartesian3()

const degeneratePositionLocalFrame = {
  north: [-1, 0, 0],
  east: [0, 1, 0],
  up: [0, 0, 1],
  south: [1, 0, 0],
  west: [0, -1, 0],
  down: [0, 0, -1]
}
let localFrameToFixedFrameCache:
  | Record<
      string,
      (origin: Cartesian3, ellipsoid: Ellipsoid, result?: Matrix4) => Matrix4
    >
  | undefined = undefined

export type FixedFrameFunction = (
  origin: Cartesian3,
  ellipsoid: Ellipsoid,
  result?: Matrix4
) => Matrix4

export default class Transforms {
  static localFrameToFixedFrameGenerator: (
    firstAxis: VectorProductLocalFrameType,
    secondAxis: VectorProductLocalFrameType
  ) => FixedFrameFunction
  static eastNorthUpToFixedFrame: FixedFrameFunction
  static northEastDownToFixedFrame: FixedFrameFunction
  static northUpEastToFixedFrame: FixedFrameFunction
  static northWestUpToFixedFrame: FixedFrameFunction
}

Transforms.localFrameToFixedFrameGenerator = (
  firstAxis: VectorProductLocalFrameType,
  secondAxis: VectorProductLocalFrameType
) => {
  const thirdAxis = vectorProductLocalFrame[firstAxis][
    secondAxis
  ] as VectorProductLocalFrameType

  let resultat
  const hashAxis = firstAxis + secondAxis
  if (!defined(localFrameToFixedFrameCache)) {
    localFrameToFixedFrameCache = {}
  }
  if (defined(localFrameToFixedFrameCache[hashAxis])) {
    resultat = localFrameToFixedFrameCache[hashAxis]
  } else {
    resultat = (origin: Cartesian3, ellipsoid: Ellipsoid, result?: Matrix4) => {
      if (!defined(origin)) {
        throw new Error('origin is required.')
      }
      if (isNaN(origin.x) || isNaN(origin.y) || isNaN(origin.z)) {
        throw new Error('origin is NaN.')
      }
      if (!defined(result)) {
        result = new Matrix4()
      }

      if (
        Cartesian3.equalsEpsilon(origin, Cartesian3.ZERO, HEditorMath.EPSILON14)
      ) {
        Cartesian3.unpack(
          degeneratePositionLocalFrame[firstAxis],
          0,
          scratchFirstCartesian
        )
        Cartesian3.unpack(
          degeneratePositionLocalFrame[secondAxis],
          0,
          scratchSecondCartesian
        )
        Cartesian3.unpack(
          degeneratePositionLocalFrame[thirdAxis],
          0,
          scratchThirdCartesian
        )
      } else if (
        HEditorMath.equalsEpsilon(origin.x, 0.0, HEditorMath.EPSILON14) &&
        HEditorMath.equalsEpsilon(origin.y, 0.0, HEditorMath.EPSILON14)
      ) {
        const sign = HEditorMath.sign(origin.z)

        Cartesian3.unpack(
          degeneratePositionLocalFrame[firstAxis],
          0,
          scratchFirstCartesian
        )
        if (firstAxis !== 'east' && firstAxis !== 'west') {
          Cartesian3.multiplyByScalar(
            scratchFirstCartesian,
            sign,
            scratchFirstCartesian
          )
        }

        Cartesian3.unpack(
          degeneratePositionLocalFrame[secondAxis],
          0,
          scratchSecondCartesian
        )
        if (secondAxis !== 'east' && secondAxis !== 'west') {
          Cartesian3.multiplyByScalar(
            scratchSecondCartesian,
            sign,
            scratchSecondCartesian
          )
        }

        Cartesian3.unpack(
          degeneratePositionLocalFrame[thirdAxis],
          0,
          scratchThirdCartesian
        )
        if (thirdAxis !== 'east' && thirdAxis !== 'west') {
          Cartesian3.multiplyByScalar(
            scratchThirdCartesian,
            sign,
            scratchThirdCartesian
          )
        }
      } else {
        ellipsoid = defaultValue(ellipsoid, Ellipsoid.WGS84)
        ellipsoid.geodeticSurfaceNormal(origin, scratchCalculateCartesian.up)

        const up = scratchCalculateCartesian.up
        const east = scratchCalculateCartesian.east
        east.x = -origin.y
        east.y = origin.x
        east.z = 0.0
        Cartesian3.normalize(east, scratchCalculateCartesian.east)
        Cartesian3.cross(up, east, scratchCalculateCartesian.south)

        Cartesian3.multiplyByScalar(
          scratchCalculateCartesian.up,
          -1,
          scratchCalculateCartesian.down
        )
        Cartesian3.multiplyByScalar(
          scratchCalculateCartesian.east,
          -1,
          scratchCalculateCartesian.west
        )
        Cartesian3.multiplyByScalar(
          scratchCalculateCartesian.north,
          -1,
          scratchCalculateCartesian.south
        )

        scratchFirstCartesian = scratchCalculateCartesian[firstAxis]
        scratchSecondCartesian = scratchCalculateCartesian[secondAxis]
        scratchThirdCartesian = scratchCalculateCartesian[thirdAxis]
      }

      result.values[0] = scratchFirstCartesian.x
      result.values[1] = scratchFirstCartesian.y
      result.values[2] = scratchFirstCartesian.z
      result.values[3] = 0.0
      result.values[4] = scratchSecondCartesian.x
      result.values[5] = scratchSecondCartesian.y
      result.values[6] = scratchSecondCartesian.z
      result.values[7] = 0.0
      result.values[8] = scratchThirdCartesian.x
      result.values[9] = scratchThirdCartesian.y
      result.values[10] = scratchThirdCartesian.z
      result.values[11] = 0.0
      result.values[12] = origin.x
      result.values[13] = origin.y
      result.values[14] = origin.z
      result.values[15] = 0.0

      return result
    }

    localFrameToFixedFrameCache[hashAxis] = resultat
  }

  return resultat
}

Transforms.eastNorthUpToFixedFrame = Transforms.localFrameToFixedFrameGenerator(
  VectorProductLocalFrameEnum.east,
  VectorProductLocalFrameEnum.north
)
Transforms.northEastDownToFixedFrame =
  Transforms.localFrameToFixedFrameGenerator(
    VectorProductLocalFrameEnum.north,
    VectorProductLocalFrameEnum.east
  )
Transforms.northUpEastToFixedFrame = Transforms.localFrameToFixedFrameGenerator(
  VectorProductLocalFrameEnum.north,
  VectorProductLocalFrameEnum.up
)
Transforms.northWestUpToFixedFrame = Transforms.localFrameToFixedFrameGenerator(
  VectorProductLocalFrameEnum.north,
  VectorProductLocalFrameEnum.west
)
