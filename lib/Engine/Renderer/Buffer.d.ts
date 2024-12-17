import { BufferOptions, BufferTargetType, BufferUsageType, ContextType } from '../../type';
export default class Buffer {
    buffer: WebGLBuffer;
    gl: ContextType;
    bufferTarget: BufferTargetType;
    bufferUsage: BufferUsageType;
    id: string;
    constructor({ data, bufferTarget, bufferUsage, gl }: BufferOptions);
}
