import Defined from '../Core/Defined';
export default class BatchTable {
    _numberOfInstances;
    _attributes;
    constructor(attributes, numberOfInstances) {
        if (!Defined(numberOfInstances)) {
            throw new Error('numberOfInstances is required.');
        }
        if (!Defined(attributes)) {
            throw new Error('attributes is required.');
        }
        this._numberOfInstances = numberOfInstances;
        this._attributes = attributes;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF0Y2hUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvU2NlbmUvQmF0Y2hUYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUdyQyxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDdEIsa0JBQWtCLENBQVE7SUFDMUIsV0FBVyxDQUFxQjtJQUV2QyxZQUFZLFVBQStCLEVBQUUsaUJBQXlCO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtRQUNuRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQTtRQUM1QyxDQUFDO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFBO1FBQzNDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFBO0lBQy9CLENBQUM7Q0FDRiJ9