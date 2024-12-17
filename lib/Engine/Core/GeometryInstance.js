import defaultValue from './DefaultValue';
import Matrix4 from './Matrix4';
export default class GeometryInstance {
    geometry;
    id;
    modelMatrix;
    attributes = undefined;
    constructor(options) {
        this.geometry = options.geometry;
        this.id = options.id;
        this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY);
        this.attributes = options.attributes;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnlJbnN0YW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9HZW9tZXRyeUluc3RhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBR3pDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFnQjtJQUNuQyxRQUFRLENBQVU7SUFDbEIsRUFBRSxDQUFRO0lBQ1YsV0FBVyxDQUFTO0lBQ3BCLFVBQVUsR0FBcUQsU0FBUyxDQUFBO0lBQ3hFLFlBQVksT0FBZ0M7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQTtRQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN0RSxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7SUFDdEMsQ0FBQztDQUNGIn0=