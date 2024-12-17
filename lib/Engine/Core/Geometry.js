import Matrix4 from './Matrix4';
export default class Geometry {
    attributes;
    indices;
    primitiveType;
    modelMatrix;
    constructor({ attributes, indices, primitiveType, modelMatrix }) {
        this.attributes = attributes;
        this.indices = indices;
        this.primitiveType = primitiveType;
        this.modelMatrix = modelMatrix || Matrix4.IDENTITY;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvR2VvbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRy9CLE1BQU0sQ0FBQyxPQUFPLE9BQU8sUUFBUTtJQUMzQixVQUFVLENBRVQ7SUFDRCxPQUFPLENBQWE7SUFDcEIsYUFBYSxDQUFlO0lBQzVCLFdBQVcsQ0FBUztJQUNwQixZQUFZLEVBQ1YsVUFBVSxFQUNWLE9BQU8sRUFDUCxhQUFhLEVBQ2IsV0FBVyxFQUNLO1FBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO1FBQ2xDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUE7SUFDcEQsQ0FBQztDQUNGIn0=