import Cartesian3 from './Cartesian3';
import defaultValue from './DefaultValue';
import { defined } from './Defined';
import Ellipsoid from './Ellipsoid';
import HEditorMath from './Math';
import Matrix4 from './Matrix4';
export var UpVectorProductLocalFrame;
(function (UpVectorProductLocalFrame) {
    UpVectorProductLocalFrame["south"] = "east";
    UpVectorProductLocalFrame["north"] = "west";
    UpVectorProductLocalFrame["west"] = "south";
    UpVectorProductLocalFrame["east"] = "north";
})(UpVectorProductLocalFrame || (UpVectorProductLocalFrame = {}));
export var DownVectorProductLocalFrame;
(function (DownVectorProductLocalFrame) {
    DownVectorProductLocalFrame["south"] = "west";
    DownVectorProductLocalFrame["north"] = "east";
    DownVectorProductLocalFrame["west"] = "north";
    DownVectorProductLocalFrame["east"] = "south";
})(DownVectorProductLocalFrame || (DownVectorProductLocalFrame = {}));
export var SouthVectorProductLocalFrame;
(function (SouthVectorProductLocalFrame) {
    SouthVectorProductLocalFrame["up"] = "west";
    SouthVectorProductLocalFrame["down"] = "east";
    SouthVectorProductLocalFrame["west"] = "down";
    SouthVectorProductLocalFrame["east"] = "up";
})(SouthVectorProductLocalFrame || (SouthVectorProductLocalFrame = {}));
export var NorthVectorProductLocalFrame;
(function (NorthVectorProductLocalFrame) {
    NorthVectorProductLocalFrame["up"] = "east";
    NorthVectorProductLocalFrame["down"] = "west";
    NorthVectorProductLocalFrame["west"] = "up";
    NorthVectorProductLocalFrame["east"] = "down";
})(NorthVectorProductLocalFrame || (NorthVectorProductLocalFrame = {}));
export var WestVectorProductLocalFrame;
(function (WestVectorProductLocalFrame) {
    WestVectorProductLocalFrame["up"] = "north";
    WestVectorProductLocalFrame["down"] = "south";
    WestVectorProductLocalFrame["north"] = "down";
    WestVectorProductLocalFrame["south"] = "up";
})(WestVectorProductLocalFrame || (WestVectorProductLocalFrame = {}));
export var EastVectorProductLocalFrame;
(function (EastVectorProductLocalFrame) {
    EastVectorProductLocalFrame["up"] = "south";
    EastVectorProductLocalFrame["down"] = "north";
    EastVectorProductLocalFrame["north"] = "up";
    EastVectorProductLocalFrame["south"] = "down";
})(EastVectorProductLocalFrame || (EastVectorProductLocalFrame = {}));
export var VectorProductLocalFrameEnum;
(function (VectorProductLocalFrameEnum) {
    VectorProductLocalFrameEnum["up"] = "up";
    VectorProductLocalFrameEnum["down"] = "down";
    VectorProductLocalFrameEnum["north"] = "north";
    VectorProductLocalFrameEnum["south"] = "south";
    VectorProductLocalFrameEnum["east"] = "east";
    VectorProductLocalFrameEnum["west"] = "west";
})(VectorProductLocalFrameEnum || (VectorProductLocalFrameEnum = {}));
const vectorProductLocalFrame = {
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
};
const scratchCalculateCartesian = {
    east: new Cartesian3(),
    up: new Cartesian3(),
    down: new Cartesian3(),
    south: new Cartesian3(),
    north: new Cartesian3(),
    west: new Cartesian3()
};
let scratchFirstCartesian = new Cartesian3();
let scratchSecondCartesian = new Cartesian3();
let scratchThirdCartesian = new Cartesian3();
const degeneratePositionLocalFrame = {
    north: [-1, 0, 0],
    east: [0, 1, 0],
    up: [0, 0, 1],
    south: [1, 0, 0],
    west: [0, -1, 0],
    down: [0, 0, -1]
};
let localFrameToFixedFrameCache = undefined;
export default class Transforms {
    static localFrameToFixedFrameGenerator;
    static eastNorthUpToFixedFrame;
    static northEastDownToFixedFrame;
    static northUpEastToFixedFrame;
    static northWestUpToFixedFrame;
}
Transforms.localFrameToFixedFrameGenerator = (firstAxis, secondAxis) => {
    const thirdAxis = vectorProductLocalFrame[firstAxis][secondAxis];
    let resultat;
    const hashAxis = firstAxis + secondAxis;
    if (!defined(localFrameToFixedFrameCache)) {
        localFrameToFixedFrameCache = {};
    }
    if (defined(localFrameToFixedFrameCache[hashAxis])) {
        resultat = localFrameToFixedFrameCache[hashAxis];
    }
    else {
        resultat = (origin, ellipsoid, result) => {
            if (!defined(origin)) {
                throw new Error('origin is required.');
            }
            if (isNaN(origin.x) || isNaN(origin.y) || isNaN(origin.z)) {
                throw new Error('origin is NaN.');
            }
            if (!defined(result)) {
                result = new Matrix4();
            }
            if (Cartesian3.equalsEpsilon(origin, Cartesian3.ZERO, HEditorMath.EPSILON14)) {
                Cartesian3.unpack(degeneratePositionLocalFrame[firstAxis], 0, scratchFirstCartesian);
                Cartesian3.unpack(degeneratePositionLocalFrame[secondAxis], 0, scratchSecondCartesian);
                Cartesian3.unpack(degeneratePositionLocalFrame[thirdAxis], 0, scratchThirdCartesian);
            }
            else if (HEditorMath.equalsEpsilon(origin.x, 0.0, HEditorMath.EPSILON14) &&
                HEditorMath.equalsEpsilon(origin.y, 0.0, HEditorMath.EPSILON14)) {
                const sign = HEditorMath.sign(origin.z);
                Cartesian3.unpack(degeneratePositionLocalFrame[firstAxis], 0, scratchFirstCartesian);
                if (firstAxis !== 'east' && firstAxis !== 'west') {
                    Cartesian3.multiplyByScalar(scratchFirstCartesian, sign, scratchFirstCartesian);
                }
                Cartesian3.unpack(degeneratePositionLocalFrame[secondAxis], 0, scratchSecondCartesian);
                if (secondAxis !== 'east' && secondAxis !== 'west') {
                    Cartesian3.multiplyByScalar(scratchSecondCartesian, sign, scratchSecondCartesian);
                }
                Cartesian3.unpack(degeneratePositionLocalFrame[thirdAxis], 0, scratchThirdCartesian);
                if (thirdAxis !== 'east' && thirdAxis !== 'west') {
                    Cartesian3.multiplyByScalar(scratchThirdCartesian, sign, scratchThirdCartesian);
                }
            }
            else {
                ellipsoid = defaultValue(ellipsoid, Ellipsoid.WGS84);
                ellipsoid.geodeticSurfaceNormal(origin, scratchCalculateCartesian.up);
                const up = scratchCalculateCartesian.up;
                const east = scratchCalculateCartesian.east;
                east.x = -origin.y;
                east.y = origin.x;
                east.z = 0.0;
                Cartesian3.normalize(east, scratchCalculateCartesian.east);
                Cartesian3.cross(up, east, scratchCalculateCartesian.south);
                Cartesian3.multiplyByScalar(scratchCalculateCartesian.up, -1, scratchCalculateCartesian.down);
                Cartesian3.multiplyByScalar(scratchCalculateCartesian.east, -1, scratchCalculateCartesian.west);
                Cartesian3.multiplyByScalar(scratchCalculateCartesian.north, -1, scratchCalculateCartesian.south);
                scratchFirstCartesian = scratchCalculateCartesian[firstAxis];
                scratchSecondCartesian = scratchCalculateCartesian[secondAxis];
                scratchThirdCartesian = scratchCalculateCartesian[thirdAxis];
            }
            result.values[0] = scratchFirstCartesian.x;
            result.values[1] = scratchFirstCartesian.y;
            result.values[2] = scratchFirstCartesian.z;
            result.values[3] = 0.0;
            result.values[4] = scratchSecondCartesian.x;
            result.values[5] = scratchSecondCartesian.y;
            result.values[6] = scratchSecondCartesian.z;
            result.values[7] = 0.0;
            result.values[8] = scratchThirdCartesian.x;
            result.values[9] = scratchThirdCartesian.y;
            result.values[10] = scratchThirdCartesian.z;
            result.values[11] = 0.0;
            result.values[12] = origin.x;
            result.values[13] = origin.y;
            result.values[14] = origin.z;
            result.values[15] = 0.0;
            return result;
        };
        localFrameToFixedFrameCache[hashAxis] = resultat;
    }
    return resultat;
};
Transforms.eastNorthUpToFixedFrame = Transforms.localFrameToFixedFrameGenerator(VectorProductLocalFrameEnum.east, VectorProductLocalFrameEnum.north);
Transforms.northEastDownToFixedFrame =
    Transforms.localFrameToFixedFrameGenerator(VectorProductLocalFrameEnum.north, VectorProductLocalFrameEnum.east);
Transforms.northUpEastToFixedFrame = Transforms.localFrameToFixedFrameGenerator(VectorProductLocalFrameEnum.north, VectorProductLocalFrameEnum.up);
Transforms.northWestUpToFixedFrame = Transforms.localFrameToFixedFrameGenerator(VectorProductLocalFrameEnum.north, VectorProductLocalFrameEnum.west);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNmb3Jtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9UcmFuc2Zvcm1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ25DLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQTtBQUNuQyxPQUFPLFdBQVcsTUFBTSxRQUFRLENBQUE7QUFDaEMsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRS9CLE1BQU0sQ0FBTixJQUFZLHlCQUtYO0FBTEQsV0FBWSx5QkFBeUI7SUFDbkMsMkNBQWMsQ0FBQTtJQUNkLDJDQUFjLENBQUE7SUFDZCwyQ0FBYyxDQUFBO0lBQ2QsMkNBQWMsQ0FBQTtBQUNoQixDQUFDLEVBTFcseUJBQXlCLEtBQXpCLHlCQUF5QixRQUtwQztBQUNELE1BQU0sQ0FBTixJQUFZLDJCQUtYO0FBTEQsV0FBWSwyQkFBMkI7SUFDckMsNkNBQWMsQ0FBQTtJQUNkLDZDQUFjLENBQUE7SUFDZCw2Q0FBYyxDQUFBO0lBQ2QsNkNBQWMsQ0FBQTtBQUNoQixDQUFDLEVBTFcsMkJBQTJCLEtBQTNCLDJCQUEyQixRQUt0QztBQUNELE1BQU0sQ0FBTixJQUFZLDRCQUtYO0FBTEQsV0FBWSw0QkFBNEI7SUFDdEMsMkNBQVcsQ0FBQTtJQUNYLDZDQUFhLENBQUE7SUFDYiw2Q0FBYSxDQUFBO0lBQ2IsMkNBQVcsQ0FBQTtBQUNiLENBQUMsRUFMVyw0QkFBNEIsS0FBNUIsNEJBQTRCLFFBS3ZDO0FBQ0QsTUFBTSxDQUFOLElBQVksNEJBS1g7QUFMRCxXQUFZLDRCQUE0QjtJQUN0QywyQ0FBVyxDQUFBO0lBQ1gsNkNBQWEsQ0FBQTtJQUNiLDJDQUFXLENBQUE7SUFDWCw2Q0FBYSxDQUFBO0FBQ2YsQ0FBQyxFQUxXLDRC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Q0FBQyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtZQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtZQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtZQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtZQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUN2QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDNUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFBO1lBQzVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUM1QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUV2QixPQUFPLE1BQU0sQ0FBQTtRQUNmLENBQUMsQ0FBQTtRQUVELDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsT0FBTyxRQUFRLENBQUE7QUFDakIsQ0FBQyxDQUFBO0FBRUQsVUFBVSxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQywrQkFBK0IsQ0FDN0UsMkJBQTJCLENBQUMsSUFBSSxFQUNoQywyQkFBMkIsQ0FBQyxLQUFLLENBQ2xDLENBQUE7QUFDRCxVQUFVLENBQUMseUJBQXlCO0lBQ2xDLFVBQVUsQ0FBQywrQkFBK0IsQ0FDeEMsMkJBQTJCLENBQUMsS0FBSyxFQUNqQywyQkFBMkIsQ0FBQyxJQUFJLENBQ2pDLENBQUE7QUFDSCxVQUFVLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDLCtCQUErQixDQUM3RSwyQkFBMkIsQ0FBQyxLQUFLLEVBQ2pDLDJCQUEyQixDQUFDLEVBQUUsQ0FDL0IsQ0FBQTtBQUNELFVBQVUsQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsK0JBQStCLENBQzdFLDJCQUEyQixDQUFDLEtBQUssRUFDakMsMkJBQTJCLENBQUMsSUFBSSxDQUNqQyxDQUFBIn0=