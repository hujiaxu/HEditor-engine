import { VertexArrayOptions, ContextType, VertexArrayFromGeometryOptions, VAAttributes } from '../../type';
import Context from './Context';
import Buffer from './Buffer';
export default class VertexArray {
    private _vao;
    private _numberOfVertices;
    private _hasInstancedAttributes;
    private _hasConstantAttributes;
    private _context;
    private _gl;
    private _attributes;
    private _indexBuffer;
    get vao(): WebGLVertexArrayObject | null;
    get numberOfVertexAttributes(): number;
    get numberOfVertices(): number;
    get hasInstancedAttributes(): boolean;
    get hasConstantAttributes(): boolean;
    get attributes(): VAAttributes[];
    get indexBuffer(): Buffer | undefined;
    get context(): Context;
    get gl(): ContextType;
    static fromGeometry: (options: VertexArrayFromGeometryOptions) => VertexArray;
    constructor(options: VertexArrayOptions);
    private _bind;
    private _addAttribute;
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
