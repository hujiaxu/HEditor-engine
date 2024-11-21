import { BufferTargetType, BufferUsageType } from '../../type';
import Buffer from './Buffer';
export default class VertexArray {
    context;
    geometry;
    indexBuffer;
    _vao;
    get vao() {
        return this._vao;
    }
    // va: []
    constructor({ context, geometry }) {
        this.context = context;
        this.geometry = geometry;
        const { gl, shaderProgram } = context;
        console.log('shaderProgram: ', shaderProgram);
        const { attributes, indices } = geometry;
        const numberOfVertexAttributes = gl.getProgramParameter(shaderProgram.program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
        const vertexAttributes = this.getVertexAttributes({
            shaderProgram: shaderProgram.program,
            numberOfVertexAttributes,
            gl
        });
        this._vao = context.glCreateVertexArray();
        context.glBindVertexArray(this._vao);
        for (const attributeName in vertexAttributes) {
            const { index, name } = vertexAttributes[attributeName];
            const { values, componentsPerAttribute, componentDatatype } = attributes[name];
            new Buffer({
                gl: this.context.gl,
                data: new Float32Array(values),
                bufferTarget: BufferTargetType.ARRAY_BUFFER,
                bufferUsage: BufferUsageType.STATIC_DRAW
            });
            gl.vertexAttribPointer(index, componentsPerAttribute, componentDatatype, false, 0, 0);
            gl.enableVertexAttribArray(index);
        }
        // this.va = va
        if (indices) {
            const indexBuffer = new Buffer({
                data: indices,
                bufferTarget: BufferTargetType.ELEMENT_ARRAY_BUFFER,
                bufferUsage: BufferUsageType.STATIC_DRAW,
                // bufferType: this._gl!.UNSIGNED_SHORT,
                gl: this.context.gl
            });
            gl.bindBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
            this.indexBuffer = indexBuffer;
        }
        context.glBindVertexArray(null);
    }
    getVertexAttributes({ gl, shaderProgram, numberOfVertexAttributes }) {
        const attributes = {};
        for (let i = 0; i < numberOfVertexAttributes; i++) {
            const attribute = gl.getActiveAttrib(shaderProgram, i);
            const location = gl.getAttribLocation(shaderProgram, attribute.name);
            attributes[attribute.name] = {
                index: location,
                type: attribute.type,
                name: attribute.name.split('_')[1]
            };
        }
        return attributes;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVydGV4QXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1JlbmRlcmVyL1ZlcnRleEFycmF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsZUFBZSxFQUVoQixNQUFNLFlBQVksQ0FBQTtBQUVuQixPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFHN0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFXO0lBQzlCLE9BQU8sQ0FBUztJQUNoQixRQUFRLENBQVU7SUFFbEIsV0FBVyxDQUFvQjtJQUUvQixJQUFJLENBQStCO0lBRW5DLElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsU0FBUztJQUVULFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFzQjtRQUNuRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUV4QixNQUFNLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLE9BQU8sQ0FBQTtRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBRTdDLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsUUFBUSxDQUFBO1FBQ3hDLE1BQU0sd0JBQXdCLEdBQUcsRUFBRyxDQUFDLG1CQUFtQixDQUN0RCxhQUFjLENBQUMsT0FBUSxFQUN2QixzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FDL0IsQ0FBQTtRQUNYLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBQ2hELGFBQWEsRUFBRSxhQUFjLENBQUMsT0FBUTtZQUN0Qyx3QkFBd0I7WUFDeEIsRUFBRTtTQUNILENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFvQixF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