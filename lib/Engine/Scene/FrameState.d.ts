import { FrameStateOptions, SceneMode } from '../../type';
import GeographicProjection from '../Core/GeographicProjection';
import Context from '../Renderer/Context';
import Camera from './Camera';
export default class FrameState {
    context: Context;
    pixelRatio: number;
    mode: SceneMode;
    camera: Camera | undefined;
    scene3DOnly: boolean;
    mapProjection: undefined | GeographicProjection;
    passes: {
        render: boolean;
        pick: boolean;
        pickVoxel: boolean;
        depth: boolean;
        postProcess: boolean;
        offscreen: boolean;
    };
    afterRender: (() => void)[];
    constructor({ context }: FrameStateOptions);
}
