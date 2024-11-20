import { ShaderProgramOptions } from '../../type';
export default class ShaderProgram {
    private _gl;
    private _program;
    get program(): WebGLProgram | undefined;
    constructor({ gl, vertexShaderSource, fragmentShaderSource }: ShaderProgramOptions);
    initializeProgram(program: WebGLProgram, vertexShaderSource: string, fragmentShaderSource: string): void;
    createShader(type: number, source: string): WebGLShader | undefined;
}
