import { ContextType } from './context';
export declare enum BufferTargetType {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,
    COPY_READ_BUFFER,
    COPY_WRITE_BUFFER,
    TRANSFORM_FEEDBACK_BUFFER,
    UNIFORM_BUFFER,
    PIXEL_PACK_BUFFER,
    PIXEL_UNPACK_BUFFER
}
export declare enum BufferUsageType {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW
}
export declare enum BufferType {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER
}
export declare enum IndexDataType {
    BYTE,
    UNSIGNED_BYTE,
    SHORT,
    UNSIGNED_SHORT,
    INT,
    UNSIGNED_INT
}
export interface BufferOptions {
    gl: ContextType;
    data: Float32Array | Uint16Array;
    bufferTarget: BufferTargetType;
    bufferUsage: BufferUsageType;
}
