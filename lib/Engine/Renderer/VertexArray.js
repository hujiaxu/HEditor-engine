import { BufferUsage, ComponentDatatype } from '../../type';
import Buffer from './Buffer';
import Geometry from '../Core/Geometry';
import defaultValue from '../Core/DefaultValue';
import Defined from '../Core/Defined';
import HEditorMath from '../Core/Math';
import IndexDatatype from '../Core/IndexDatatype';
import { Check } from '..';
import DeveloperError from '../Core/DeveloperError';
export default class VertexArray {
    _vao;
    _numberOfVertices;
    _hasInstancedAttributes;
    _hasConstantAttributes;
    _context;
    _gl;
    _attributes;
    _indexBuffer;
    get vao() {
        return this._vao;
    }
    get numberOfVertexAttributes() {
        return this._attributes.length;
    }
    get numberOfVertices() {
        return this._numberOfVertices;
    }
    get hasInstancedAttributes() {
        return this._hasInstancedAttributes;
    }
    get hasConstantAttributes() {
        return this._hasConstantAttributes;
    }
    get attributes() {
        return this._attributes;
    }
    get indexBuffer() {
        return this._indexBuffer;
    }
    get context() {
        return this._context;
    }
    get gl() {
        return this._gl;
    }
    static fromGeometry;
    constructor(options) {
        // this.context = context
        // this.geometry = geometry
        // const { gl, shaderProgram } = context
        // const { attributes, indices } = geometry
        // const numberOfVertexAttributes = gl!.getProgramParameter(
        //   shaderProgram!.program!,
        //   WebGL2RenderingContext.ACTIVE_ATTRIBUTES
        // ) as number
        // const vertexAttributes = this.getVertexAttributes({
        //   shaderProgram: shaderProgram!.program!,
        //   numberOfVertexAttributes,
        //   gl
        // })
        // this._vao = context.glCreateVertexArray!()
        // context.glBindVertexArray!(this._vao!)
        // for (const attributeName in vertexAttributes) {
        //   const { index, name } = vertexAttributes[attributeName]
        //   const { values, componentsPerAttribute, componentDatatype } =
        //     attributes[name]
        //   new Buffer({
        //     gl: this.context.gl!,
        //     data: new Float32Array(values),
        //     bufferTarget: BufferTargetType.ARRAY_BUFFER,
        //     bufferUsage: BufferUsageType.STATIC_DRAW
        //   })
        //   gl!.vertexAttribPointer(
        //     index,
        //     componentsPerAttribute,
        //     componentDatatype,
        //     false,
        //     0,
        //     0
        //   )
        //   gl!.enableVertexAttribArray(index)
        // }
        // if (indices) {
        //   const indexBuffer = new Buffer({
        //     data: indices,
        //     bufferTarget: BufferTargetType.ELEMENT_ARRAY_BUFFER,
        //     bufferUsage: BufferUsageType.STATIC_DRAW,
        //     // bufferType: this._gl!.UNSIGNED_SHORT,
        //     gl: this.context.gl!
        //   })
        //   gl!.bindBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer)
        //   this.indexBuffer = indexBuffer
        // }
        // context.glBindVertexArray!(null)
        // context.glBindVertexArray!(null)
        // >>includeStart('debug', pragmas.debug);
        Check.defined('options.context', options.context);
        Check.defined('options.attributes', options.attributes);
        // >>includeEnd('debug');
        this._context = options.context;
        const context = options.context;
        const gl = context.gl;
        const attributes = options.attributes;
        const indexBuffer = options.indexBuffer;
        let i;
        const vaAttributes = [];
        let numberOfVertices = 1; // if every attribute is backed by a single value
        let hasInstancedAttributes = false;
        let hasConstantAttributes = false;
        let length = attributes.length;
        for (i = 0; i < length; ++i) {
            this._addAttribute(vaAttributes, attributes[i], i, context);
        }
        length = vaAttributes.length;
        for (i = 0; i < length; ++i) {
            const attribute = vaAttributes[i];
            if (Defined(attribute.vertexBuffer) && attribute.instanceDivisor === 0) {
                // This assumes that each vertex buffer in the vertex array has the same number of vertices.
                const bytes = attribute.strideInBytes ||
                    attribute.componentsPerAttribute *
                        ComponentDatatype.getSizeInBytes(attribute.componentDatatype);
                numberOfVertices = attribute.vertexBuffer.sizeInBytes / bytes;
                break;
            }
        }
        for (i = 0; i < length; ++i) {
            if (vaAttributes[i].instanceDivisor > 0) {
                hasInstancedAttributes = true;
            }
            if (Defined(vaAttributes[i].value)) {
                hasConstantAttributes = true;
            }
        }
        // >>includeStart('debug', pragmas.debug);
        // Verify all attribute names are unique
        const uniqueIndices = {};
        for (i = 0; i < length; ++i) {
            const index = vaAttributes[i].index;
            if (uniqueIndices[index]) {
                throw new DeveloperError(`Index ${index} is used by more than one attribute.`);
            }
            uniqueIndices[index] = true;
        }
        // >>includeEnd('debug');
        let vao = null;
        // Setup VAO if supported
        if (context.vertexArrayObject) {
            vao = context.glCreateVertexArray();
            context.glBindVertexArray(vao);
            this._bind(gl, vaAttributes, indexBuffer);
            context.glBindVertexArray(null);
        }
        this._numberOfVertices = numberOfVertices;
        this._hasInstancedAttributes = hasInstancedAttributes;
        this._hasConstantAttributes = hasConstantAttributes;
        this._context = context;
        this._gl = gl;
        this._vao = vao;
        this._attributes = vaAttributes;
        this._indexBuffer = indexBuffer;
    }
    _bind(gl, attributes, indexBuffer) {
        for (let i = 0; i < attributes.length; ++i) {
            const attribute = attributes[i];
            if (attribute.enabled) {
                attribute.vertexAttrib(gl);
            }
        }
        if (Defined(indexBuffer)) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
        }
    }
    _addAttribute(attributes, attribute, index, context) {
        const hasVertexBuffer = Defined(attribute.vertexBuffer);
        const hasValue = Defined(attribute.value);
        const componentsPerAttribute = attribute.value
            ? attribute.value.length
            : attribute.componentsPerAttribute;
        // >>includeStart('debug', pragmas.debug);
        if (!hasVertexBuffer && !hasValue) {
            throw new DeveloperError('attribute must have a vertexBuffer or a value.');
        }
        if (hasVertexBuffer && hasValue) {
            throw new DeveloperError('attribute cannot have both a vertexBuffer and a value.  It must have either a vertexBuffer property defining per-vertex data or a value property defining data for all vertices.');
        }
        if (componentsPerAttribute !== 1 &&
            componentsPerAttribute !== 2 &&
            componentsPerAttribute !== 3 &&
            componentsPerAttribute !== 4) {
            if (hasValue) {
                throw new DeveloperError('attribute.value.length must be in the range [1, 4].');
            }
            throw new DeveloperError('attribute.componentsPerAttribute must be in the range [1, 4].');
        }
        if (Defined(attribute.componentDatatype) &&
            !ComponentDatatype.validate(attribute.componentDatatype)) {
            throw new DeveloperError('attribute must have a valid componentDatatype or not specify it.');
        }
        if (Defined(attribute.strideInBytes) && attribute.strideInBytes > 255) {
            // WebGL limit.  Not in GL ES.
            throw new DeveloperError('attribute must have a strideInBytes less than or equal to 255 or not specify it.');
        }
        if (Defined(attribute.instanceDivisor) &&
            attribute.instanceDivisor > 0 &&
            !context.instancedArrays) {
            throw new DeveloperError('instanced arrays is not supported');
        }
        if (Defined(attribute.instanceDivisor) && attribute.instanceDivisor < 0) {
            throw new DeveloperError('attribute must have an instanceDivisor greater than or equal to zero');
        }
        if (Defined(attribute.instanceDivisor) && hasValue) {
            throw new DeveloperError('attribute cannot have have an instanceDivisor if it is not backed by a buffer');
        }
        if (Defined(attribute.instanceDivisor) &&
            attribute.instanceDivisor > 0 &&
            attribute.index === 0) {
            throw new DeveloperError('attribute zero cannot have an instanceDivisor greater than 0');
        }
        // >>includeEnd('debug');
        // Shallow copy the attribute; we do not want to copy the vertex buffer.
        const attr = {
            index: defaultValue(attribute.index, index),
            enabled: defaultValue(attribute.enabled, true),
            vertexBuffer: attribute.vertexBuffer,
            value: hasValue ? attribute.value.slice(0) : undefined,
            componentsPerAttribute: componentsPerAttribute,
            componentDatatype: defaultValue(attribute.componentDatatype, ComponentDatatype.FLOAT),
            normalize: defaultValue(attribute.normalize, false),
            offsetInBytes: defaultValue(attribute.offsetInBytes, 0),
            strideInBytes: defaultValue(attribute.strideInBytes, 0),
            instanceDivisor: defaultValue(attribute.instanceDivisor, 0)
        };
        if (hasVertexBuffer) {
            // Common case: vertex buffer for per-vertex data
            attr.vertexAttrib = function (gl) {
                const index = this.index;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.buffer);
                gl.vertexAttribPointer(index, this.componentsPerAttribute, this.componentDatatype, this.normalize, this.strideInBytes, this.offsetInBytes);
                gl.enableVertexAttribArray(index);
                if (this.instanceDivisor > 0) {
                    context.glVertexAttribDivisor(index, this.instanceDivisor);
                    context._vertexAttribDivisors[index] = this.instanceDivisor;
                    context._previousDrawInstanced = true;
                }
            };
            attr.disableVertexAttribArray = function (gl) {
                gl.disableVertexAttribArray(this.index);
                if (this.instanceDivisor > 0) {
                    context.glVertexAttribDivisor(index, 0);
                }
            };
        }
        else {
            // Less common case: value array for the same data for each vertex
            switch (attr.componentsPerAttribute) {
                case 1:
                    attr.vertexAttrib = function (gl) {
                        gl.vertexAttrib1fv(this.index, this.value);
                    };
                    break;
                case 2:
                    attr.vertexAttrib = function (gl) {
                        gl.vertexAttrib2fv(this.index, this.value);
                    };
                    break;
                case 3:
                    attr.vertexAttrib = function (gl) {
                        gl.vertexAttrib3fv(this.index, this.value);
                    };
                    break;
                case 4:
                    attr.vertexAttrib = function (gl) {
                        gl.vertexAttrib4fv(this.index, this.value);
                    };
                    break;
            }
            attr.disableVertexAttribArray = function (gl) {
                gl.disableVertexAttribArray(this.index);
            };
        }
        attributes.push(attr);
    }
    getVertexAttributes({ gl, shaderProgram, numberOfVertexAttributes }) {
        const attributes = {};
        for (let i = 0; i < numberOfVertexAttributes; i++) {
            const attribute = gl.getActiveAttrib(shaderProgram, i);
            const location = gl.getAttribLocation(shaderProgram, attribute.name);
            attributes[attribute.name] = {
                index: location,
                type: attribute.type,
                name: attribute.name.split('_')[1]
            };
        }
        return attributes;
    }
}
const computeNumberOfVertices = (attribute) => {
    return attribute.values.length / attribute.componentsPerAttribute;
};
const computeAttributeSizeInBytes = (attribute) => {
    return (ComponentDatatype.getSizeInBytes(attribute.componentDatatype) *
        attribute.componentsPerAttribute);
};
const interleaveAttributes = (attributes) => {
    let j;
    let name;
    let attribute;
    // Extract attribute names.
    const names = [];
    for (name in attributes) {
        // Attribute needs to have per-vertex values; not a constant value for all vertices.
        if (Defined(attributes[name]) && Defined(attributes[name].values)) {
            names.push(name);
            if (attributes[name]?.componentDatatype === ComponentDatatype.DOUBLE) {
                attributes[name].componentDatatype = ComponentDatatype.FLOAT;
                attributes[name].values = ComponentDatatype.createTypedArray(ComponentDatatype.FLOAT, attributes[name].values);
            }
        }
    }
    // Validation.  Compute number of vertices.
    let numberOfVertices;
    const namesLength = names.length;
    if (namesLength > 0) {
        numberOfVertices = computeNumberOfVertices(attributes[names[0]]);
        for (j = 1; j < namesLength; ++j) {
            const currentNumberOfVertices = computeNumberOfVertices(attributes[names[j]]);
            if (currentNumberOfVertices !== numberOfVertices) {
                throw new Error(`${'Each attribute list must have the same number of vertices.  ' +
                    'Attribute '}${names[j]} has a different number of vertices ` +
                    `(${currentNumberOfVertices.toString()})` +
                    ` than attribute ${names[0]} (${numberOfVertices.toString()}).`);
            }
        }
    }
    // Sort attributes by the size of their components.  From left to right, a vertex stores floats, shorts, and then bytes.
    names.sort(function (left, right) {
        return (ComponentDatatype.getSizeInBytes(attributes[right].componentDatatype) -
            ComponentDatatype.getSizeInBytes(attributes[left].componentDatatype));
    });
    // Compute sizes and strides.
    let vertexSizeInBytes = 0;
    const offsetsInBytes = {};
    for (j = 0; j < namesLength; ++j) {
        name = names[j];
        attribute = attributes[name];
        offsetsInBytes[name] = vertexSizeInBytes;
        vertexSizeInBytes += computeAttributeSizeInBytes(attribute);
    }
    if (vertexSizeInBytes > 0) {
        // Pad each vertex to be a multiple of the largest component datatype so each
        // attribute can be addressed using typed arrays.
        const maxComponentSizeInBytes = ComponentDatatype.getSizeInBytes(attributes[names[0]].componentDatatype); // Sorted large to small
        const remainder = vertexSizeInBytes % maxComponentSizeInBytes;
        if (remainder !== 0) {
            vertexSizeInBytes += maxComponentSizeInBytes - remainder;
        }
        // Total vertex buffer size in bytes, including per-vertex padding.
        const vertexBufferSizeInBytes = numberOfVertices * vertexSizeInBytes;
        // Create array for interleaved vertices.  Each attribute has a different view (pointer) into the array.
        const buffer = new ArrayBuffer(vertexBufferSizeInBytes);
        const views = {};
        for (j = 0; j < namesLength; ++j) {
            name = names[j];
            const sizeInBytes = ComponentDatatype.getSizeInBytes(attributes[name].componentDatatype);
            views[name] = {
                pointer: ComponentDatatype.createTypedArray(attributes[name].componentDatatype, buffer),
                index: offsetsInBytes[name] / sizeInBytes, // Offset in ComponentType
                strideInComponentType: vertexSizeInBytes / sizeInBytes
            };
        }
        // Copy attributes into one interleaved array.
        // PERFORMANCE_IDEA:  Can we optimize these loops?
        for (j = 0; j < numberOfVertices; ++j) {
            for (let n = 0; n < namesLength; ++n) {
                name = names[n];
                attribute = attributes[name];
                const values = attribute.values;
                const view = views[name];
                const pointer = view.pointer;
                const numberOfComponents = attribute.componentsPerAttribute;
                for (let k = 0; k < numberOfComponents; ++k) {
                    pointer[view.index + k] = values[j * numberOfComponents + k];
                }
                view.index += view.strideInComponentType;
            }
        }
        return {
            buffer: buffer,
            offsetsInBytes: offsetsInBytes,
            vertexSizeInBytes: vertexSizeInBytes
        };
    }
    // No attributes to interleave.
    return undefined;
};
VertexArray.fromGeometry = (options) => {
    const context = options.context;
    const geometry = options.geometry;
    const bufferUsage = defaultValue(options.bufferUsage, BufferUsage.DYNAMIC_DRAW);
    const attributeLocations = options.attributeLocations;
    const interleave = defaultValue(options.interleave, false);
    const createdVAAttributes = options.vertexArrayAttributes;
    let name;
    let attribute;
    let vertexBuffer;
    const vaAttributes = Defined(createdVAAttributes) ? createdVAAttributes : [];
    const attributes = geometry.attributes;
    if (interleave) {
        // Use a single vertex buffer with interleaved vertices.
        const interleavedAttributes = interleaveAttributes(attributes);
        if (Defined(interleavedAttributes)) {
            vertexBuffer = Buffer.createVertexBuffer({
                context: context,
                typedArray: interleavedAttributes.buffer,
                usage: bufferUsage
            });
            const offsetsInBytes = interleavedAttributes.offsetsInBytes;
            const strideInBytes = interleavedAttributes.vertexSizeInBytes;
            for (name in attributes) {
                if (Defined(attributes[name])) {
                    attribute = attributes[name];
                    if (Defined(attribute.values)) {
                        // Common case: per-vertex attributes
                        vaAttributes.push({
                            index: attributeLocations[name],
                            vertexBuffer: vertexBuffer,
                            componentDatatype: attribute.componentDatatype,
                            componentsPerAttribute: attribute.componentsPerAttribute,
                            normalize: attribute.normalize,
                            offsetInBytes: offsetsInBytes[name],
                            strideInBytes: strideInBytes
                        });
                    }
                    else {
                        // Constant attribute for all vertices
                        vaAttributes.push({
                            index: attributeLocations[name],
                            // value: attribute.value,
                            value: [],
                            componentDatatype: attribute.componentDatatype,
                            normalize: attribute.normalize
                        });
                    }
                }
            }
        }
    }
    else {
        // One vertex buffer per attribute.
        for (name in attributes) {
            if (Defined(attributes[name])) {
                attribute = attributes[name];
                let componentDatatype = attribute.componentDatatype;
                if (componentDatatype === ComponentDatatype.DOUBLE) {
                    componentDatatype = ComponentDatatype.FLOAT;
                }
                vertexBuffer = undefined;
                if (Defined(attribute.values)) {
                    vertexBuffer = Buffer.createVertexBuffer({
                        context: context,
                        typedArray: ComponentDatatype.createTypedArray(componentDatatype, attribute.values),
                        usage: bufferUsage
                    });
                }
                vaAttributes.push({
                    index: attributeLocations[name],
                    vertexBuffer: vertexBuffer,
                    // value: attribute.value,
                    value: [],
                    componentDatatype: componentDatatype,
                    componentsPerAttribute: attribute.componentsPerAttribute,
                    normalize: attribute.normalize
                });
            }
        }
    }
    let indexBuffer;
    const indices = geometry.indices;
    if (Defined(indices)) {
        if (Geometry.computeNumberOfVertices(geometry) >=
            HEditorMath.SIXTY_FOUR_KILOBYTES &&
            context.elementIndexUint) {
            indexBuffer = Buffer.createIndexBuffer({
                context: context,
                typedArray: new Uint32Array(indices),
                usage: bufferUsage,
                indexDatatype: IndexDatatype.UNSIGNED_INT
            });
        }
    }
    return new VertexArray({
        context: context,
        attributes: vaAttributes,
        indexBuffer: indexBuffer
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVydGV4QXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1JlbmRlcmVyL1ZlcnRleEFycmF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJTCxXQUFXLEVBQ1gsaUJBQWlCLEVBR2xCLE1BQU0sWUFBWSxDQUFBO0FBRW5CLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQTtBQUM3QixPQUFPLFFBQVEsTUFBTSxrQkFBa0IsQ0FBQTtBQUN2QyxPQUFPLFlBQVksTUFBTSxzQkFBc0IsQ0FBQTtBQUMvQyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUdyQyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFDdEMsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUE7QUFDakQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQTtBQUMxQixPQUFPLGNBQWMsTUFBTSx3QkFBd0IsQ0FBQTtBQUVuRCxNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVc7SUFDdEIsSUFBSSxDQUErQjtJQUNuQyxpQkFBaUIsQ0FBUTtJQUN6Qix1QkFBdUIsQ0FBUztJQUNoQyxzQkFBc0IsQ0FBUztJQUMvQixRQUFRLENBQVM7SUFDakIsR0FBRyxDQUFhO0lBQ2hCLFdBQVcsQ0FBZ0I7SUFDM0IsWUFBWSxDQUFvQjtJQUV4QyxJQUFJLEdBQUc7UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDbEIsQ0FBQztJQUVELElBQUksd0JBQXdCO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUE7SUFDaEMsQ0FBQztJQUVELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0lBQy9CLENBQUM7SUFFRCxJQUFJLHNCQUFzQjtRQUN4QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQTtJQUNyQyxDQUFDO0lBRUQsSUFBSSxxQkFBcUI7UUFDdkIsT0FBTyxJ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