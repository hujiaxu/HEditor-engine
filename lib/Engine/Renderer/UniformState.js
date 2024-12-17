// import HeadingPitchRoll from '../Core/HeadingPitchRoll'
// import Matrix3 from '../Core/Matrix3'
import Matrix4 from '../Core/Matrix4';
export default class UniformState {
    gl;
    uniformMap = {};
    constructor({ gl }) {
        this.gl = gl;
    }
    update(uniformState) {
        this.gl = uniformState.gl;
        this.uniformMap = uniformState.uniformMap;
    }
    updateCamera(camera) {
        const projectionMatrix = camera.frustum.projectionMatrix;
        const viewMatrix = camera.viewMatrix;
        // const rotation = Matrix4.fromRotation(
        //   Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(0.01, 0.01, 0.01))
        // )
        // Matrix4.multiply(viewMatrix, rotation, viewMatrix)
        this.uniformMap['u_projectionMatrix'] = Matrix4.toArray(projectionMatrix);
        this.uniformMap['u_viewMatrix'] = Matrix4.toArray(viewMatrix);
        this.uniformMap['u_modelMatrix'] = Matrix4.toArray(Matrix4.IDENTITY);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pZm9ybVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJlci9Vbmlmb3JtU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsMERBQTBEO0FBQzFELHdDQUF3QztBQUN4QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUdyQyxNQUFNLENBQUMsT0FBTyxPQUFPLFlBQVk7SUFDL0IsRUFBRSxDQUFhO0lBRWYsVUFBVSxHQUVOLEVBQUUsQ0FBQTtJQUNOLFlBQVksRUFBRSxFQUFFLEVBQXVCO1FBQ3JDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0lBQ2QsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUEwQjtRQUMvQixJQUFJLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUE7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFBO0lBQzNDLENBQUM7SUFFRCxZQUFZLENBQUMsTUFBYztRQUN6QixNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUE7UUFDeEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQTtRQUVwQyx5Q0FBeUM7UUFDekMseUVBQXlFO1FBQ3pFLElBQUk7UUFDSixxREFBcUQ7UUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUN6RSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0RSxDQUFDO0NBQ0YifQ==