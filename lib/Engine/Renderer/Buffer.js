import { createGuid } from '../../utils';
export default class Buffer {
    buffer;
    gl;
    bufferTarget;
    bufferUsage;
    // private _bufferType: BufferType;
    id;
    constructor({ data, bufferTarget, bufferUsage, 
    // bufferType,
    gl }) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(bufferTarget, buffer);
        gl.bufferData(bufferTarget, data, bufferUsage);
        // gl.bindBuffer(bufferTarget, null)
        this.gl = gl;
        this.buffer = buffer;
        this.bufferTarget = bufferTarget;
        this.bufferUsage = bufferUsage;
        // this._bufferType = bufferType;
        this.id = createGuid();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVmZmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJlci9CdWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQVF4QyxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFDekIsTUFBTSxDQUFhO0lBRW5CLEVBQUUsQ0FBYTtJQUNmLFlBQVksQ0FBa0I7SUFDOUIsV0FBVyxDQUFpQjtJQUM1QixtQ0FBbUM7SUFFbkMsRUFBRSxDQUFRO0lBQ1YsWUFBWSxFQUNWLElBQUksRUFDSixZQUFZLEVBQ1osV0FBVztJQUNYLGNBQWM7SUFDZCxFQUFFLEVBQ1k7UUFDZCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDaEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDbkMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQzlDLG9DQUFvQztRQUVwQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO1FBQzlCLGlDQUFpQztRQUNqQyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsRUFBRSxDQUFBO0lBQ3hCLENBQUM7Q0FDRiJ9