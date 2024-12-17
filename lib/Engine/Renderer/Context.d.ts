import { ContextOptions, ContextType } from '../../type';
import ShaderProgram from './ShaderProgram';
import Geometry from '../Core/Geometry';
import UniformState from './UniformState';
export default class Context {
    private _canvas;
    private _useGPU;
    private _gpuAdapter;
    private _gpuDevice;
    private _depthTexture;
    private _uniformState;
    gl: ContextType;
    shaderProgram: ShaderProgram | undefined;
    glCreateVertexArray: () => WebGLVertexArrayObject | null;
    glBindVertexArray: (vertexArray: WebGLVertexArrayObject | null) => void;
    glDeleteVertexArray: (vertexArray: WebGLVertexArrayObject) => void;
    get uniformState(): UniformState;
    get depthTexture(): boolean;
    constructor(options: ContextOptions);
    private _initContext;
    private _initialFunctions;
    draw({ context, geometry, uniformState }: {
        context: Context;
        geometry: Geometry;
        uniformState?: UniformState;
    }): void;
    feedUniforms({ shaderProgram }: {
        shaderProgram: ShaderProgram;
    }): void;
}
