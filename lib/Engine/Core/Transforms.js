import Cartesian3 from './Cartesian3';
import defaultValue from './DefaultValue';
import defined from './Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNmb3Jtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9UcmFuc2Zvcm1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFBO0FBQ25DLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQTtBQUNoQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsTUFBTSxDQUFOLElBQVkseUJBS1g7QUFMRCxXQUFZLHlCQUF5QjtJQUNuQywyQ0FBYyxDQUFBO0lBQ2QsMkNBQWMsQ0FBQTtJQUNkLDJDQUFjLENBQUE7SUFDZCwyQ0FBYyxDQUFBO0FBQ2hCLENBQUMsRUFMVyx5QkFBeUIsS0FBekIseUJBQXlCLFFBS3BDO0FBQ0QsTUFBTSxDQUFOLElBQVksMkJBS1g7QUFMRCxXQUFZLDJCQUEyQjtJQUNyQyw2Q0FBYyxDQUFBO0lBQ2QsNkNBQWMsQ0FBQTtJQUNkLDZDQUFjLENBQUE7SUFDZCw2Q0FBYyxDQUFBO0FBQ2hCLENBQUMsRUFMVywyQkFBMkIsS0FBM0IsMkJBQTJCLFFBS3RDO0FBQ0QsTUFBTSxDQUFOLElBQVksNEJBS1g7QUFMRCxXQUFZLDRCQUE0QjtJQUN0QywyQ0FBVyxDQUFBO0lBQ1gsNkNBQWEsQ0FBQTtJQUNiLDZDQUFhLENBQUE7SUFDYiwyQ0FBVyxDQUFBO0FBQ2IsQ0FBQyxFQUxXLDRCQUE0QixLQUE1Qiw0QkFBNEIsUUFLdkM7QUFDRCxNQUFNLENBQU4sSUFBWSw0QkFLWDtBQUxELFdBQVksNEJBQTRCO0lBQ3RDLDJDQUFXLENBQUE7SUFDWCw2Q0FBYSxDQUFBO0lBQ2IsMkNBQVcsQ0FBQTtJQUNYLDZDQUFhLENBQUE7QUFDZixDQUFDLEVBTFcsNEJBQTRCLEtBQTVC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cUJBQXFCLENBQUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUM1QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDNUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFBO1lBQzVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBRXZCLE9BQU8sTUFBTSxDQUFBO1FBQ2YsQ0FBQyxDQUFBO1FBRUQsMkJBQTJCLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFBO0lBQ2xELENBQUM7SUFFRCxPQUFPLFFBQVEsQ0FBQTtBQUNqQixDQUFDLENBQUE7QUFFRCxVQUFVLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDLCtCQUErQixDQUM3RSwyQkFBMkIsQ0FBQyxJQUFJLEVBQ2hDLDJCQUEyQixDQUFDLEtBQUssQ0FDbEMsQ0FBQTtBQUNELFVBQVUsQ0FBQyx5QkFBeUI7SUFDbEMsVUFBVSxDQUFDLCtCQUErQixDQUN4QywyQkFBMkIsQ0FBQyxLQUFLLEVBQ2pDLDJCQUEyQixDQUFDLElBQUksQ0FDakMsQ0FBQTtBQUNILFVBQVUsQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsK0JBQStCLENBQzdFLDJCQUEyQixDQUFDLEtBQUssRUFDakMsMkJBQTJCLENBQUMsRUFBRSxDQUMvQixDQUFBO0FBQ0QsVUFBVSxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQywrQkFBK0IsQ0FDN0UsMkJBQTJCLENBQUMsS0FBSyxFQUNqQywyQkFBMkIsQ0FBQyxJQUFJLENBQ2pDLENBQUEifQ==