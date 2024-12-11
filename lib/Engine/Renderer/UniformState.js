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
        this.uniformMap['u_projectionMatrix'] = Matrix4.toArray(projectionMatrix);
        this.uniformMap['u_viewMatrix'] = Matrix4.toArray(viewMatrix);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pZm9ybVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJlci9Vbmlmb3JtU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFHckMsTUFBTSxDQUFDLE9BQU8sT0FBTyxZQUFZO0lBQy9CLEVBQUUsQ0FBYTtJQUVmLFVBQVUsR0FFTixFQUFFLENBQUE7SUFDTixZQUFZLEVBQUUsRUFBRSxFQUF1QjtRQUNyQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUVaLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFBO1FBQ3BELE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFBO1FBRWxELHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUsTUFBTSxRQUFRLEdBQUcsb0JBQW9CLEdBQUcscUJBQXFCLENBQUE7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBMEI7UUFDL0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFBO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsWUFBWSxDQUFDLE1BQWM7UUFDekIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFBO1FBQ3hELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUE7UUFFcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUN6RSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDL0QsQ0FBQztDQUNGIn0=