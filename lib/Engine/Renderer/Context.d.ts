import { ContextOptions, ContextType } from '../../type';
import ShaderProgram from './ShaderProgram';
import Geometry from '../Scene/Geometry';
export default class Context {
    canvas: HTMLCanvasElement;
    private _useGPU;
    gl: ContextType | undefined;
    private _gpuAdapter;
    private _gpuDevice;
    shaderProgram: ShaderProgram | undefined;
    glCreateVertexArray: (() => WebGLVertexArrayObject | null) | undefined;
    glBindVertexArray: ((vertexArray: WebGLVertexArrayObject | null) => void) | undefined;
    glDeleteVertexArray: ((vertexArray: WebGLVertexArrayObject) => void) | undefined;
    constructor(options: ContextOptions);
    initContext(): Promise<ContextType>;
    private _initialFunctions;
    draw({ context, geometry }: {
        context: Context;
        geometry: Geometry;
    }): void;
}
