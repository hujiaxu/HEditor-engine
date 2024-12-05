import { SceneOptions } from '../../type';
import Context from '../Renderer/Context';
export default class Scene {
    canvas: HTMLCanvasElement;
    isUseGPU: boolean;
    context: Context;
    get drawingBufferWidth(): number;
    get drawingBufferHeight(): number;
    constructor(options: SceneOptions);
    draw(): void;
}
