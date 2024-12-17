// import HeadingPitchRoll from '../Core/HeadingPitchRoll'
// import Matrix3 from '../Core/Matrix3'
import Matrix4 from '../Core/Matrix4';
export default class UniformState {
    gl;
    uniformMap = {};
    constructor({ gl }) {
        this.gl = gl;
        const u_drawingBufferHeight = gl.drawingBufferHeight;
        const u_drawingBufferWidth = gl.drawingBufferWidth;
        // this.uniformMap['u_drawingBufferHeight'] = [u_drawingBufferHeight]
        // this.uniformMap['u_drawingBufferWidth'] = [u_drawingBufferWidth]
        const u_aspect = u_drawingBufferWidth / u_drawingBufferHeight;
        this.uniformMap['u_aspect'] = [u_aspect];
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pZm9ybVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJlci9Vbmlmb3JtU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsMERBQTBEO0FBQzFELHdDQUF3QztBQUN4QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUdyQyxNQUFNLENBQUMsT0FBTyxPQUFPLFlBQVk7SUFDL0IsRUFBRSxDQUFhO0lBRWYsVUFBVSxHQUVOLEVBQUUsQ0FBQTtJQUNOLFlBQVksRUFBRSxFQUFFLEVBQXVCO1FBQ3JDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBRVosTUFBTSxxQkFBcUIsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUE7UUFDcEQsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUE7UUFFbEQscUVBQXFFO1FBQ3JFLG1FQUFtRTtRQUNuRSxNQUFNLFFBQVEsR0FBRyxvQkFBb0IsR0FBRyxxQkFBcUIsQ0FBQTtRQUM3RCxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUMsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUEwQjtRQUMvQixJQUFJLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUE7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFBO0lBQzNDLENBQUM7SUFFRCxZQUFZLENBQUMsTUFBYztRQUN6QixNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUE7UUFDeEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQTtRQUVwQyx5Q0FBeUM7UUFDekMseUVBQXlFO1FBQ3pFLElBQUk7UUFDSixxREFBcUQ7UUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUN6RSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDL0QsQ0FBQztDQUNGIn0=