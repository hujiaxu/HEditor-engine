import { Primitive } from '../../Engine';
export type ContextType = WebGL2RenderingContext | WebGLRenderingContext;
export interface ContextOptions {
    canvas: HTMLCanvasElement;
    isUseGPU: boolean;
}
export interface PickObject {
    id: string;
    primitive: Primitive;
}
export type PickObjects = Record<string, PickObject>;
