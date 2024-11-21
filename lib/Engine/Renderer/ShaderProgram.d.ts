import { ContextType, ShaderProgramOptions, VertexAttributesType } from '../../type';
import Uniform from './Uniform';
export default class ShaderProgram {
    private _gl;
    private _program;
    private _vertexShaderSource;
    private _fragmentShaderSource;
    private _vertexAttributes;
    private _uniforms;
    get program(): WebGLProgram | undefined;
    get vertexAttributes(): VertexAttributesType;
    get uniforms(): {
        [key: string]: Uniform;
    };
    constructor({ gl, vertexShaderSource, fragmentShaderSource }: ShaderProgramOptions);
    initialize(): void;
    reinitialize(): void;
    bind(): void;
    createAndLinkProgram(): WebGLProgram;
    getVertexAttributes({ program, gl }: {
        program: WebGLProgram;
        gl: ContextType;
    }): VertexAttributesType;
    getUniforms({ program, gl }: {
        program: WebGLProgram;
        gl: ContextType;
    }): {
        [key: string]: Uniform;
    };
    createShader(type: number, source: string): WebGLShader | undefined;
}
