import Matrix4 from './Matrix4';
import BoundingSphere from './BoundingSphere';
import Cartesian3 from './Cartesian3';
import Defined from './Defined';
export default class Geometry {
    attributes;
    indices;
    primitiveType;
    modelMatrix;
    boundingSphere;
    boundingSphereCV;
    offsetAttribute;
    static computeNumberOfVertices;
    constructor({ attributes, indices, primitiveType, modelMatrix, boundingSphere, boundingSphereCV }) {
        this.attributes = attributes;
        this.indices = indices || new Uint16Array(0);
        this.primitiveType = primitiveType;
        this.modelMatrix = modelMatrix || Matrix4.IDENTITY;
        this.boundingSphere =
            boundingSphere || new BoundingSphere(Cartesian3.ZERO, 0);
        this.boundingSphereCV = boundingSphereCV || undefined;
    }
}
Geometry.computeNumberOfVertices = (geometry) => {
    let numberOfVertices = -1;
    for (const property in geometry.attributes) {
        if (Defined(geometry.attributes) &&
            Defined(geometry.attributes[property]) &&
            Defined(geometry.attributes[property].values)) {
            const attribute = geometry.attributes[property];
            const num = attribute.values.length / attribute.componentsPerAttribute;
            // >>includeStart('debug', pragmas.debug);
            if (numberOfVertices !== num && numberOfVertices !== -1) {
                throw new Error('All attribute lists must have the same number of attributes.');
            }
            // >>includeEnd('debug');
            numberOfVertices = num;
        }
    }
    return numberOfVertices;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvR2VvbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBRS9CLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFRO0lBQzNCLFVBQVUsQ0FBb0I7SUFDOUIsT0FBTyxDQUFxQjtJQUM1QixhQUFhLENBQWU7SUFDNUIsV0FBVyxDQUFTO0lBRXBCLGNBQWMsQ0FBZ0I7SUFDOUIsZ0JBQWdCLENBQTRCO0lBQzVDLGVBQWUsQ0FBcUM7SUFDcEQsTUFBTSxDQUFDLHVCQUF1QixDQUFnQztJQUM5RCxZQUFZLEVBQ1YsVUFBVSxFQUNWLE9BQU8sRUFDUCxhQUFhLEVBQ2IsV0FBVyxFQUNYLGNBQWMsRUFDZCxnQkFBZ0IsRUFDQTtRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM1QyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtRQUNsQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFBO1FBQ2xELElBQUksQ0FBQyxjQUFjO1lBQ2pCLGNBQWMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRTFELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsSUFBSSxTQUFTLENBQUE7SUFDdkQsQ0FBQztDQUNGO0FBRUQsUUFBUSxDQUFDLHVCQUF1QixHQUFHLENBQUMsUUFBa0IsRUFBRSxFQUFFO0lBQ3hELElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFekIsS0FBSyxNQUFNLFFBQVEsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDM0MsSUFDRSxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUM1QixPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFpQyxDQUFDLENBQUM7WUFDL0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBaUMsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxFQUN2RSxDQUFDO1lBQ0QsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFpQyxDQUFFLENBQUE7WUFDekUsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLHNCQUFzQixDQUFBO1lBQ3RFLDBDQUEwQztZQUMxQyxJQUFJLGdCQUFnQixLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN4RCxNQUFNLElBQUksS0FBSyxDQUNiLDhEQUE4RCxDQUMvRCxDQUFBO1lBQ0gsQ0FBQztZQUNELHlCQUF5QjtZQUN6QixnQkFBZ0IsR0FBRyxHQUFHLENBQUE7UUFDeEIsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLGdCQUFnQixDQUFBO0FBQ3pCLENBQUMsQ0FBQSJ9