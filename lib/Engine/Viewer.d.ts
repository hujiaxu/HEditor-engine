import { ViewerOptions } from '../type';
import Scene from './Scene/Scene';
export default class Viewer {
    canvas: HTMLCanvasElement;
    scene: Scene;
    defaultRenderLoop: boolean;
    constructor({ container, canvasHeight, canvasWidth, useGPU, defaultRenderLoop }: ViewerOptions);
    draw(): void;
}
