import { BufferCreateIndexBufferOptions, BufferCreateVertexBufferOptions, BufferOptions, BufferTargetType, BufferUsageType, ContextType } from '../../type';
export default class Buffer {
    vertexArrayDestroyable: boolean;
    private _id;
    private _gl;
    private _webgl2;
    private _bufferTarget;
    private _sizeInBytes;
    private _usage;
    private _buffer;
    static createVertexBuffer: (options: BufferCreateVertexBufferOptions) => Buffer;
    static createIndexBuffer: (options: BufferCreateIndexBufferOptions) => Buffer;
    get id(): string;
    get gl(): ContextType;
    get webgl2(): boolean;
    get bufferTarget(): BufferTargetType;
    get sizeInBytes(): number;
    get usage(): BufferUsageType | undefined;
    get buffer(): WebGLBuffer;
    constructor(options: BufferOptions);
}
