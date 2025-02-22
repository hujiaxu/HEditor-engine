import { createGuid } from '../../utils';
import { BufferTargetType, BufferUsage } from '../../type';
import Defined from '../Core/Defined';
import { Check } from '..';
import IndexDatatype from '../Core/IndexDatatype';
export default class Buffer {
    vertexArrayDestroyable;
    _id;
    _gl;
    _webgl2;
    _bufferTarget;
    _sizeInBytes;
    _usage;
    _buffer;
    static createVertexBuffer;
    static createIndexBuffer;
    get id() {
        return this._id;
    }
    get gl() {
        return this._gl;
    }
    get webgl2() {
        return this._webgl2;
    }
    get bufferTarget() {
        return this._bufferTarget;
    }
    get sizeInBytes() {
        return this._sizeInBytes;
    }
    get usage() {
        return this._usage;
    }
    get buffer() {
        return this._buffer;
    }
    constructor(options) {
        // const gl = options.gl
        // const buffer = gl.createBuffer()
        // gl.bindBuffer(bufferTarget, buffer)
        // gl.bufferData(bufferTarget, data, bufferUsage)
        // gl.bindBuffer(bufferTarget, null)
        // this.gl = gl
        // this.buffer = buffer!
        // this.bufferTarget = bufferTarget
        // this.bufferUsage = bufferUsage
        // // this._bufferType = bufferType;
        // this.id = createGuid()
        // this.vertexArrayDestroyable = true;
        if (!Defined(options.typedArray) && !Defined(options.sizeInBytes)) {
            throw new Error('Either options.sizeInBytes or options.typedArray is required.');
        }
        if (Defined(options.typedArray) && Defined(options.sizeInBytes)) {
            throw new Error('Cannot pass in both options.sizeInBytes and options.typedArray.');
        }
        if (Defined(options.typedArray)) {
            Check.typeOf.object('options.typedArray', options.typedArray);
            Check.typeOf.number('options.typedArray.byteLength', options.typedArray.byteLength);
        }
        if (!BufferUsage.validate(options.usage)) {
            throw new Error('usage is invalid.');
        }
        const gl = options.context.gl;
        const bufferTarget = options.bufferTarget;
        const typedArray = options.typedArray;
        let sizeInBytes = options.sizeInBytes;
        const usage = options.usage;
        const hasArray = Defined(typedArray);
        if (hasArray) {
            sizeInBytes = typedArray.byteLength;
        }
        // >>includeStart('debug', pragmas.debug);
        Check.typeOf.number.greaterThan('sizeInBytes', sizeInBytes, 0);
        // >>includeEnd('debug');
        const buffer = gl.createBuffer();
        gl.bindBuffer(bufferTarget, buffer);
        gl.bufferData(bufferTarget, (hasArray ? typedArray : sizeInBytes), usage);
        gl.bindBuffer(bufferTarget, null);
        this._id = createGuid();
        this._gl = gl;
        this._webgl2 = options.context.isSuppotedwebgl2;
        this._bufferTarget = bufferTarget;
        this._sizeInBytes = sizeInBytes;
        this._usage = usage;
        this._buffer = buffer;
        this.vertexArrayDestroyable = true;
    }
}
Buffer.createVertexBuffer = (options) => {
    return new Buffer({
        context: options.context,
        bufferTarget: BufferTargetType.ARRAY_BUFFER,
        typedArray: options.typedArray,
        sizeInBytes: options.sizeInBytes,
        usage: options.usage
    });
};
Buffer.createIndexBuffer = (options) => {
    // >>includeStart('debug', pragmas.debug);
    Check.defined('options.context', options.context);
    if (!IndexDatatype.validate(options.indexDatatype)) {
        throw new Error('Invalid indexDatatype.');
    }
    if (options.indexDatatype === IndexDatatype.UNSIGNED_INT &&
        !options.context.elementIndexUint) {
        throw new Error('IndexDatatype.UNSIGNED_INT requires OES_element_index_uint, which is not supported on this system.  Check context.elementIndexUint.');
    }
    // >>includeEnd('debug');
    const context = options.context;
    const indexDatatype = options.indexDatatype;
    const bytesPerIndex = IndexDatatype.getSizeInBytes(indexDatatype);
    const buffer = new Buffer({
        context: context,
        bufferTarget: BufferTargetType.ELEMENT_ARRAY_BUFFER,
        typedArray: options.typedArray,
        sizeInBytes: options.sizeInBytes,
        usage: options.usage
    });
    const numberOfIndices = buffer.sizeInBytes / bytesPerIndex;
    Object.defineProperties(buffer, {
        indexDatatype: {
            get: function () {
                return indexDatatype;
            }
        },
        bytesPerIndex: {
            get: function () {
                return bytesPerIndex;
            }
        },
        numberOfIndices: {
            get: function () {
                return numberOfIndices;
            }
        }
    });
    return buffer;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVmZmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJlci9CdWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUN4QyxPQUFPLEVBSUwsZ0JBQWdCLEVBQ2hCLFdBQVcsRUFHWixNQUFNLFlBQVksQ0FBQTtBQUNuQixPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQzFCLE9BQU8sYUFBYSxNQUFNLHVCQUF1QixDQUFBO0FBRWpELE1BQU0sQ0FBQyxPQUFPLE9BQU8sTUFBTTtJQUN6QixzQkFBc0IsQ0FBUztJQUN2QixHQUFHLENBQVE7SUFDWCxHQUFHLENBQWE7SUFDaEIsT0FBTyxDQUFTO0lBQ2hCLGFBQWEsQ0FBa0I7SUFDL0IsWUFBWSxDQUFRO0lBQ3BCLE1BQU0sQ0FBNkI7SUFDbkMsT0FBTyxDQUFhO0lBQzVCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FFZDtJQUNYLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBcUQ7SUFFN0UsSUFBSSxFQUFFO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFBO0lBQ2pCLENBQUM7SUFDRCxJQUFJLEVBQUU7UUFDSixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUE7SUFDakIsQ0FBQztJQUNELElBQUksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBQ0QsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQzNCLENBQUM7SUFDRCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUE7SUFDMUIsQ0FBQztJQUNELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUNwQixDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1Is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