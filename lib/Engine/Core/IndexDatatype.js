import Defined from './Defined';
import HEditorMath from './Math';
export default class IndexDatatype {
    static createTypedArray;
    static UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT;
    static UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE;
    static UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT;
    static validate;
    static getSizeInBytes;
}
IndexDatatype.createTypedArray = (numberOfVertices, indicesLengthOrArray) => {
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(numberOfVertices)) {
        throw new Error('numberOfVertices is required.');
    }
    // >>includeEnd('debug');
    const typedArray = typeof indicesLengthOrArray === 'number'
        ? new ArrayBuffer(indicesLengthOrArray)
        : indicesLengthOrArray;
    if (numberOfVertices >= HEditorMath.SIXTY_FOUR_KILOBYTES) {
        return new Uint32Array(typedArray);
    }
    // 2^16 - 1
    return new Uint16Array(typedArray);
};
IndexDatatype.validate = (indexDatatype) => {
    return (Defined(indexDatatype) &&
        (indexDatatype === IndexDatatype.UNSIGNED_BYTE ||
            indexDatatype === IndexDatatype.UNSIGNED_SHORT ||
            indexDatatype === IndexDatatype.UNSIGNED_INT));
};
IndexDatatype.getSizeInBytes = (indexDatatype) => {
    switch (indexDatatype) {
        case IndexDatatype.UNSIGNED_BYTE:
            return Uint8Array.BYTES_PER_ELEMENT;
        case IndexDatatype.UNSIGNED_SHORT:
            return Uint16Array.BYTES_PER_ELEMENT;
        case IndexDatatype.UNSIGNED_INT:
            return Uint32Array.BYTES_PER_ELEMENT;
    }
    // >>includeStart('debug', pragmas.debug);
    throw new Error('indexDatatype is required and must be a valid IndexDatatype constant.');
    // >>includeEnd('debug');
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5kZXhEYXRhdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9JbmRleERhdGF0eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLFdBQVcsTUFBTSxRQUFRLENBQUE7QUFFaEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFhO0lBQ2hDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FHaUM7SUFDeEQsTUFBTSxDQUFVLFlBQVksR0FBRyxzQkFBc0IsQ0FBQyxZQUFZLENBQUE7SUFDbEUsTUFBTSxDQUFVLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxhQUFhLENBQUE7SUFDcEUsTUFBTSxDQUFVLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQyxjQUFjLENBQUE7SUFDdEUsTUFBTSxDQUFDLFFBQVEsQ0FFeUI7SUFDeEMsTUFBTSxDQUFDLGNBQWMsQ0FBbUM7O0FBRzFELGFBQWEsQ0FBQyxnQkFBZ0IsR0FBRyxDQUMvQixnQkFBd0IsRUFDeEIsb0JBQThELEVBQzlELEVBQUU7SUFDRiwwQ0FBMEM7SUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7UUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0lBQ2xELENBQUM7SUFDRCx5QkFBeUI7SUFDekIsTUFBTSxVQUFVLEdBQ2QsT0FBTyxvQkFBb0IsS0FBSyxRQUFRO1FBQ3RDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztRQUN2QyxDQUFDLENBQUMsb0JBQW9CLENBQUE7SUFFMUIsSUFBSSxnQkFBZ0IsSUFBSSxXQUFXLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUN6RCxPQUFPLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRCxXQUFXO0lBQ1gsT0FBTyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNwQyxDQUFDLENBQUE7QUFDRCxhQUFhLENBQUMsUUFBUSxHQUFHLENBQUMsYUFBcUIsRUFBRSxFQUFFO0lBQ2pELE9BQU8sQ0FDTCxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQ3RCLENBQUMsYUFBYSxLQUFLLGFBQWEsQ0FBQyxhQUFhO1lBQzVDLGFBQWEsS0FBSyxhQUFhLENBQUMsY0FBYztZQUM5QyxhQUFhLEtBQUssYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUNoRCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsYUFBYSxDQUFDLGNBQWMsR0FBRyxDQUFDLGFBQXFCLEVBQUUsRUFBRTtJQUN2RCxRQUFRLGFBQWEsRUFBRSxDQUFDO1FBQ3RCLEtBQUssYUFBYSxDQUFDLGFBQWE7WUFDOUIsT0FBTyxVQUFVLENBQUMsaUJBQWlCLENBQUE7UUFDckMsS0FBSyxhQUFhLENBQUMsY0FBYztZQUMvQixPQUFPLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQTtRQUN0QyxLQUFLLGFBQWEsQ0FBQyxZQUFZO1lBQzdCLE9BQU8sV0FBVyxDQUFDLGlCQUFpQixDQUFBO0lBQ3hDLENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsTUFBTSxJQUFJLEtBQUssQ0FDYix1RUFBdUUsQ0FDeEUsQ0FBQTtJQUNELHlCQUF5QjtBQUMzQixDQUFDLENBQUEifQ==