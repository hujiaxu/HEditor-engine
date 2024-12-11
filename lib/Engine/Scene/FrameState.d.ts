import { FrameStateOptions, SceneMode } from '../../type';
import Context from '../Renderer/Context';
export default class FrameState {
    context: Context;
    pixelRatio: number;
    mode: SceneMode;
    constructor({ context }: FrameStateOptions);
}
