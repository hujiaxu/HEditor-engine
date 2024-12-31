import { FrameStateOptions, SceneMode } from '../../type';
import Context from '../Renderer/Context';
export default class FrameState {
    context: Context;
    pixelRatio: number;
    mode: SceneMode;
    scene3DOnly: boolean;
    passes: {
        render: boolean;
        pick: boolean;
        pickVoxel: boolean;
        depth: boolean;
        postProcess: boolean;
        offscreen: boolean;
    };
    constructor({ context }: FrameStateOptions);
}
