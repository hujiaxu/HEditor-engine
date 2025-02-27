import defaultValue from '../Core/DefaultValue';
import Matrix4 from '../Core/Matrix4';
import { createGuid } from '../../utils';
export default class GeometryInstance {
    geometry;
    eastHemisphereGeometry;
    westHemisphereGeometry;
    id;
    modelMatrix;
    attributes = undefined;
    pickPrimitive;
    constructor(options) {
        this.geometry = options.geometry;
        this.id = options.id || createGuid();
        this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY);
        this.attributes = options.attributes;
        this.pickPrimitive = options.pickPrimitive || undefined;
        this.eastHemisphereGeometry = options.eastHemisphereGeometry;
        this.westHemisphereGeometry = options.westHemisphereGeometry;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnlJbnN0YW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9HZW9tZXRyeUluc3RhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBRy9DLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBRXJDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFeEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxnQkFBZ0I7SUFDbkMsUUFBUSxDQUFVO0lBQ2xCLHNCQUFzQixDQUFzQjtJQUM1QyxzQkFBc0IsQ0FBc0I7SUFDNUMsRUFBRSxDQUFRO0lBQ1YsV0FBVyxDQUFTO0lBQ3BCLFVBQVUsR0FBcUQsU0FBUyxDQUFBO0lBQ3hFLGFBQWEsQ0FBdUI7SUFDcEMsWUFBWSxPQUFnQztRQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUE7UUFDaEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxJQUFJLFVBQVUsRUFBRSxDQUFBO1FBQ3BDLElBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3RFLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQTtRQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFBO1FBQ3ZELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUE7UUFDNUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQTtJQUM5RCxDQUFDO0NBQ0YifQ==