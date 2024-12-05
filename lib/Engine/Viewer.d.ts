import { ViewerOptions } from '../type';
import Scene from './Scene/Scene';
export default class Viewer {
    canvas: HTMLCanvasElement;
    scene: Scene;
    constructor({ container, canvasHeight, canvasWidth, useGPU }: ViewerOptions);
    draw(): void;
}
