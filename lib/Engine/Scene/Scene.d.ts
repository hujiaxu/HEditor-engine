import { SceneOptions } from '../../type';
import Context from '../Renderer/Context';
export default class Scene {
    canvas: HTMLCanvasElement;
    isUseGPU: boolean;
    context: Context;
    constructor(options: SceneOptions);
    draw(): void;
}
