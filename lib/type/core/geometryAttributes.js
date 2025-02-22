import { Defined } from '../../Engine';
export const ComponentDatatype = {
    BYTE: WebGLRenderingContext.BYTE,
    FLOAT: WebGLRenderingContext.FLOAT,
    SHORT: WebGLRenderingContext.SHORT,
    UNSIGNED_BYTE: WebGLRenderingContext.UNSIGNED_BYTE,
    UNSIGNED_SHORT: WebGLRenderingContext.UNSIGNED_SHORT,
    UNSIGNED_INT: WebGLRenderingContext.UNSIGNED_INT,
    // Desktop OpenGL
    DOUBLE: 0x140a,
    INT: WebGLRenderingContext.INT,
    validate: function (componentDatatype) {
        return (componentDatatype === ComponentDatatype.BYTE ||
            componentDatatype === ComponentDatatype.FLOAT ||
            componentDatatype === ComponentDatatype.SHORT ||
            componentDatatype === ComponentDatatype.UNSIGNED_BYTE ||
            componentDatatype === ComponentDatatype.UNSIGNED_SHORT ||
            componentDatatype === ComponentDatatype.UNSIGNED_INT ||
            componentDatatype === ComponentDatatype.DOUBLE ||
            componentDatatype === ComponentDatatype.INT);
    },
    getSizeInBytes: function (componentDatatype) {
        switch (componentDatatype) {
            case ComponentDatatype.BYTE:
                return Int8Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.UNSIGNED_BYTE:
                return Uint8Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.SHORT:
                return Int16Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.UNSIGNED_SHORT:
                return Uint16Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.INT:
                return Int32Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.UNSIGNED_INT:
                return Uint32Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.FLOAT:
                return Float32Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.DOUBLE:
                return Float64Array.BYTES_PER_ELEMENT;
            // >>includeStart('debug', pragmas.debug);
            default:
                throw new Error('componentDatatype is not a valid value.');
            // >>includeEnd('debug');
        }
    },
    createTypedArray: (componentDatatype, valuesOrLength) => {
        // >>includeStart('debug', pragmas.debug);
        if (!Defined(componentDatatype)) {
            throw new Error('componentDatatype is required.');
        }
        if (!Defined(valuesOrLength)) {
            throw new Error('valuesOrLength is required.');
        }
        // >>includeEnd('debug');
        switch (componentDatatype) {
            case ComponentDatatype.BYTE:
                return new Int8Array(valuesOrLength);
            case ComponentDatatype.UNSIGNED_BYTE:
                return new Uint8Array(valuesOrLength);
            case ComponentDatatype.SHORT:
                return new Int16Array(valuesOrLength);
            case ComponentDatatype.UNSIGNED_SHORT:
                return new Uint16Array(valuesOrLength);
            case ComponentDatatype.INT:
                return new Int32Array(valuesOrLength);
            case ComponentDatatype.UNSIGNED_INT:
                return new Uint32Array(valuesOrLength);
            case ComponentDatatype.FLOAT:
                return new Float32Array(valuesOrLength);
            case ComponentDatatype.DOUBLE:
                return new Float64Array(valuesOrLength);
            // >>includeStart('debug', pragmas.debug);
            default:
                throw new Error('componentDatatype is not a valid value.');
            // >>includeEnd('debug');
        }
    }
};
export var GeometryOffsetAttribute;
(function (GeometryOffsetAttribute) {
    GeometryOffsetAttribute[GeometryOffsetAttribute["NONE"] = 0] = "NONE";
    GeometryOffsetAttribute[GeometryOffsetAttribute["TOP"] = 1] = "TOP";
    GeometryOffsetAttribute[GeometryOffsetAttribute["ALL"] = 2] = "ALL";
})(GeometryOffsetAttribute || (GeometryOffsetAttribute = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbWV0cnlBdHRyaWJ1dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3R5cGUvY29yZS9nZW9tZXRyeUF0dHJpYnV0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBcUIsTUFBTSxjQUFjLENBQUE7QUFFekQsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUc7SUFDL0IsSUFBSSxFQUFFLHFCQUFxQixDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLEtBQUs7SUFDbEMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLEtBQUs7SUFDbEMsYUFBYSxFQUFFLHFCQUFxQixDQUFDLGFBQWE7SUFDbEQsY0FBYyxFQUFFLHFCQUFxQixDQUFDLGNBQWM7SUFDcEQsWUFBWSxFQUFFLHFCQUFxQixDQUFDLFlBQVk7SUFDaEQsaUJBQWlCO0lBQ2pCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsR0FBRyxFQUFFLHFCQUFxQixDQUFDLEdBQUc7SUFDOUIsUUFBUSxFQUFFLFVBQVUsaUJBQXlCO1FBQzNDLE9BQU8sQ0FDTCxpQkFBaUIsS0FBSyxpQkFBaUIsQ0FBQyxJQUFJO1lBQzVDLGlCQUFpQixLQUFLLGlCQUFpQixDQUFDLEtBQUs7WUFDN0MsaUJBQWlCLEtBQUssaUJBQWlCLENBQUMsS0FBSztZQUM3QyxpQkFBaUIsS0FBSyxpQkFBaUIsQ0FBQyxhQUFhO1lBQ3JELGlCQUFpQixLQUFLLGlCQUFpQixDQUFDLGNBQWM7WUFDdEQsaUJBQWlCLEtBQUssaUJBQWlCLENBQUMsWUFBWTtZQUNwRCxpQkFBaUIsS0FBSyxpQkFBaUIsQ0FBQyxNQUFNO1lBQzlDLGlCQUFpQixLQUFLLGlCQUFpQixDQUFDLEdBQUcsQ0FDNUMsQ0FBQTtJQUNILENBQUM7SUFDRCxjQUFjLEVBQUUsVUFBVSxpQkFBeUI7UUFDakQsUUFBUSxpQkFBaUIsRUFBRSxDQUFDO1lBQzFCLEtBQUssaUJBQWlCLENBQUMsSUFB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