import { SceneMode } from '../../type';
export default class FrameState {
    context;
    pixelRatio;
    mode;
    camera;
    scene3DOnly = true;
    mapProjection;
    passes = {
        render: false,
        pick: false,
        pickVoxel: false,
        depth: false,
        postProcess: false,
        offscreen: false
    };
    afterRender = [];
    constructor({ context }) {
        this.context = context;
        this.camera = undefined;
        this.pixelRatio = 1.0;
        this.mode = SceneMode.SCENE3D;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhbWVTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvU2NlbmUvRnJhbWVTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUt6RCxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDN0IsT0FBTyxDQUFTO0lBQ2hCLFVBQVUsQ0FBUTtJQUNsQixJQUFJLENBQVc7SUFDZixNQUFNLENBQW9CO0lBQ25CLFdBQVcsR0FBWSxJQUFJLENBQUE7SUFDM0IsYUFBYSxDQUFrQztJQUMvQyxNQUFNLEdBQUc7UUFDZCxNQUFNLEVBQUUsS0FBSztRQUNiLElBQUksRUFBRSxLQUFLO1FBQ1gsU0FBUyxFQUFFLEtBQUs7UUFDaEIsS0FBSyxFQUFFLEtBQUs7UUFDWixXQUFXLEVBQUUsS0FBSztRQUNsQixTQUFTLEVBQUUsS0FBSztLQUNqQixDQUFBO0lBQ00sV0FBVyxHQUFtQixFQUFFLENBQUE7SUFDdkMsWUFBWSxFQUFFLE9BQU8sRUFBcUI7UUFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUE7UUFFdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUE7UUFFckIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFBO0lBQy9CLENBQUM7Q0FDRiJ9