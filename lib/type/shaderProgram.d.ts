import { ContextType } from './context';
export interface ShaderProgramOptions {
    vertexShaderSource: string;
    fragmentShaderSource: string;
    gl: ContextType;
}
export interface ShaderSourceCache {
    vertexShaderSource: string;
    fragmentShaderSource: string;
}
export type VertexAttributesType = Record<string, {
    location: number;
    name: string;
    type: number;
}>;
