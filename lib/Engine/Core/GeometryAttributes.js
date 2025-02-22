export default class GeometryAttributes {
    position;
    normal;
    st;
    binormal;
    tangent;
    bitangent;
    color;
    batchId;
    position3DHigh;
    position3DLow;
    constructor(options) {
        const { position, normal, st, binormal, tangent, color, bitangent, batchId } = options || {};
        this.position = position;
        this.normal = normal;
        this.st = st;
        this.binormal = binormal;
        this.tangent = tangent;
        this.color = color;
        this.bitangent = bitangent;
        this.batchId = batchId;
        this.position3DHigh = undefined;
        this.position3DLow = undefined;
        // this.extrudeDirection = extrudeDirection
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnlBdHRyaWJ1dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL0dlb21ldHJ5QXR0cmlidXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsT0FBTyxPQUFPLGtCQUFrQjtJQUNyQyxRQUFRLENBQStCO0lBQ3ZDLE1BQU0sQ0FBZ0M7SUFDdEMsRUFBRSxDQUFnQztJQUNsQyxRQUFRLENBQWdDO0lBQ3hDLE9BQU8sQ0FBZ0M7SUFDdkMsU0FBUyxDQUFnQztJQUN6QyxLQUFLLENBQWdDO0lBQ3JDLE9BQU8sQ0FBZ0M7SUFDdkMsY0FBYyxDQUFnQztJQUM5QyxhQUFhLENBQWlDO0lBSTlDLFlBQVksT0FBbUM7UUFDN0MsTUFBTSxFQUNKLFFBQVEsRUFDUixNQUFNLEVBQ04sRUFBRSxFQUNGLFFBQVEsRUFDUixPQUFPLEVBQ1AsS0FBSyxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1IsR0FBRyxPQUFPLElBQUksRUFBRSxDQUFBO1FBRWpCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ1osSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7UUFFbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFFdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUE7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUE7UUFDOUIsMkNBQTJDO0lBQzdDLENBQUM7Q0FDRiJ9