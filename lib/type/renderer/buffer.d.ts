import { Context } from '../../Engine';
import { GeometryAttributeValuesType } from '../core/geometryAttributes';
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
    bufferTarget: BufferTargetType;
    bufferUsage?: BufferUsageType;
    context: Context;
    typedArray?: ArrayBuffer | GeometryAttributeValuesType;
    usage: BufferUsageType;
    sizeInBytes?: number;
}
export declare const BufferUsage: {
    STREAM_DRAW: BufferUsageType;
    STATIC_DRAW: BufferUsageType;
    DYNAMIC_DRAW: BufferUsageType;
    validate: (bufferUsage: BufferUsageType) => boolean;
};
export interface BufferCreateVertexBufferOptions {
    context: Context;
    typedArray: ArrayBuffer | GeometryAttributeValuesType;
    sizeInBytes?: number;
    usage: number;
}
export interface BufferCreateIndexBufferOptions {
    context: Context;
    typedArray: ArrayBuffer | GeometryAttributeValuesType;
    usage: number;
    indexDatatype: number;
    sizeInBytes?: number;
}
