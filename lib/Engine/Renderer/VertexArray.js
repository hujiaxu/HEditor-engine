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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVydGV4QXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1JlbmRlcmVyL1ZlcnRleEFycmF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsZUFBZSxFQUVoQixNQUFNLFlBQVksQ0FBQTtBQUVuQixPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFHN0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFXO0lBQzlCLE9BQU8sQ0FBUztJQUNoQixRQUFRLENBQVU7SUFFbEIsV0FBVyxDQUFvQjtJQUUvQixJQUFJLENBQStCO0lBRW5DLElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsU0FBUztJQUVULFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFzQjtRQUNuRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUV4QixNQUFNLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLE9BQU8sQ0FBQTtRQUVyQyxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLFFBQVEsQ0FBQTtRQUN4QyxNQUFNLHdCQUF3QixHQUFHLEVBQUcsQ0FBQyxtQkFBbUIsQ0FDdEQsYUFBYyxDQUFDLE9BQVEsRUFDdkIsc0JBQXNCLENBQUMsaUJBQWlCLENBQy9CLENBQUE7UUFDWCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztZQUNoRCxhQUFhLEVBQUUsYUFBYyxDQUFDLE9BQVE7WUFDdEMsd0JBQXdCO1lBQ3hCLEVBQUU7U0FDSCxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBb0IsRUFBRSxDQUFBO1FBQzFDLE9BQU8sQ0FBQyxpQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUE7UUFDdEMsS0FBSyxNQUFNLGFBQWEsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQzdDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdkQsTUFBTSxFQUFFLE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxHQUN6RCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDbEIsSUFBSSxNQUFNLENBQUM7Z0JBQ1QsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRztnQkFDcEIsSUFBSSxFQUFFLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDOUIsWUFBWSxFQUFFLGdCQUFnQixDQUFDLFlBQVk7Z0JBQzNDLFdBQVcsRUFBRSxlQUFlLENBQUMsV0FBVzthQUN6QyxDQUFDLENBQUE7WUFDRixFQUFHLENBQUMsbUJBQW1CLENBQ3JCLEtBQUssRUFDTCxzQkFBc0IsRUFDdEIsaUJBQWlCLEVBQ2pCLEtBQUssRUFDTCxDQUFDLEVBQ0QsQ0FBQyxDQUNGLENBQUE7WUFDRCxFQUFHLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDcEMsQ0FBQztRQUVELGVBQWU7UUFFZixJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUM7Z0JBQzdCLElBQUksRUFBRSxPQUFPO2dCQUNiLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxvQkFBb0I7Z0JBQ25ELFdBQVcsRUFBRSxlQUFlLENBQUMsV0FBVztnQkFDeEMsd0NBQXdDO2dCQUN4QyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFHO2FBQ3JCLENBQUMsQ0FBQTtZQUVGLEVBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBRXpFLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO1FBQ2hDLENBQUM7UUFFRCxPQUFPLENBQUMsaUJBQWtCLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbEMsQ0FBQztJQUVELG1CQUFtQixDQUFDLEVBQ2xCLEVBQUUsRUFDRixhQUFhLEVBQ2Isd0JBQXdCLEVBS3pCO1FBQ0MsTUFBTSxVQUFVLEdBTVosRUFBRSxDQUFBO1FBRU4sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLHdCQUF3QixFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEQsTUFBTSxTQUFTLEdBQUcsRUFBRyxDQUFDLGVBQWUsQ0FBQyxhQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDeEQsTUFBTSxRQUFRLEdBQUcsRUFBRyxDQUFDLGlCQUFpQixDQUFDLGFBQWMsRUFBRSxTQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7WUFFdkUsVUFBVSxDQUFDLFNBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRztnQkFDNUIsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsSUFBSSxFQUFFLFNBQVUsQ0FBQyxJQUFJO2dCQUNyQixJQUFJLEVBQUUsU0FBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BDLENBQUE7UUFDSCxDQUFDO1FBRUQsT0FBTyxVQUFVLENBQUE7SUFDbkIsQ0FBQztDQUNGIn0=