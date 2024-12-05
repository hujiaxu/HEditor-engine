import { VertexArrayOptions, ContextType } from '../../type';
import Context from './Context';
import Buffer from './Buffer';
import Geometry from '../Scene/Geometry';
export default class VertexArray {
    context: Context;
    geometry: Geometry;
    indexBuffer: Buffer | undefined;
    _vao: WebGLVertexArrayObject | null;
    get vao(): WebGLVertexArrayObject | null;
    constructor({ context, geometry }: VertexArrayOptions);
    getVertexAttributes({ gl, shaderProgram, numberOfVertexAttributes }: {
        gl: ContextType | undefined;
        shaderProgram: WebGLProgram | undefined;
        numberOfVertexAttributes: number;
    }): {
        [key: string]: {
            name: string;
            type: number;
            index: number;
        };
    };
}
