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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pZm9ybVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJlci9Vbmlmb3JtU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE9BQU8sT0FBTyxZQUFZO0lBQy9CLEVBQUUsQ0FBYTtJQUVmLFVBQVUsR0FFTixFQUFFLENBQUE7SUFDTixZQUFZLEVBQUUsRUFBRSxFQUF1QjtRQUNyQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUVaLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFBO1FBQ3BELE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFBO1FBRWxELHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUsTUFBTSxRQUFRLEdBQUcsb0JBQW9CLEdBQUcscUJBQXFCLENBQUE7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBMEI7UUFDL0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFBO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQTtJQUMzQyxDQUFDO0NBQ0YifQ==