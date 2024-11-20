export default class ShaderProgram {
    _gl;
    _program;
    get program() {
        return this._program;
    }
    constructor({ gl, vertexShaderSource, fragmentShaderSource }) {
        this._gl = gl;
        if (!this._gl) {
            throw new Error('Failed to create shader. Context is not initialized.');
        }
        const program = this._gl?.createProgram();
        if (!program) {
            throw new Error('Failed to create shader program.');
        }
        this._program = program;
        this.initializeProgram(this._program, vertexShaderSource, fragmentShaderSource);
    }
    initializeProgram(program, vertexShaderSource, fragmentShaderSource) {
        const vertexShader = this.createShader(this._gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) {
            throw new Error('Failed to create shader.');
        }
        this._gl.attachShader(program, vertexShader);
        this._gl.attachShader(program, fragmentShader);
        this._gl.linkProgram(program);
        const success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
        if (success) {
            return this._gl.useProgram(program);
        }
        console.log(this._gl.getProgramInfoLog(program));
        this._gl.deleteProgram(program);
    }
    createShader(type, source) {
        if (!this._gl) {
            throw new Error('Failed to create shader. Context is not initialized.');
        }
        const shader = this._gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create shader.');
        }
        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);
        const success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(this._gl.getShaderInfoLog(shader));
        this._gl.deleteShader(shader);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhZGVyUHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvU2hhZGVyUHJvZ3JhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLENBQUMsT0FBTyxPQUFPLGFBQWE7SUFDeEIsR0FBRyxDQUF5QjtJQUM1QixRQUFRLENBQTBCO0lBRTFDLElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtJQUN0QixDQUFDO0lBQ0QsWUFBWSxFQUNWLEVBQUUsRUFDRixrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ0M7UUFDckIsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFBO1FBQ3pFLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxDQUFBO1FBQ3pDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtRQUNyRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFFdkIsSUFBSSxDQUFDLGlCQUFpQixDQUNwQixJQUFJLENBQUMsUUFBUSxFQUNiLGtCQUFrQixFQUNsQixvQkFBb0IsQ0FDckIsQ0FBQTtJQUNILENBQUM7SUFFRCxpQkFBaUIsQ0FDZixPQUFxQixFQUNyQixrQkFBMEIsRUFDMUIsb0JBQTRCO1FBRTVCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQ3BDLElBQUksQ0FBQyxHQUFJLENBQUMsYUFBYSxFQUN2QixrQkFBa0IsQ0FDbkIsQ0FBQTtRQUNELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQ3RDLElBQUksQ0FBQyxHQUFJLENBQUMsZUFBZSxFQUN6QixvQkFBb0IsQ0FDckIsQ0FBQTtRQUNELElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFDN0MsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsR0FBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFDL0MsSUFBSSxDQUFDLEdBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUksQ0FBQyxtQkFBbUIsQ0FDM0MsT0FBTyxFQUNQLElBQUksQ0FBQyxHQUFJLENBQUMsV0FBVyxDQUN0QixDQUFBO1FBQ0QsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBQ2pELElBQUksQ0FBQyxHQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xDLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBWSxFQUFFLE1BQWM7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQTtRQUN6RSxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDM0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO1FBQzdDLENBQUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUM1RSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osT0FBTyxNQUFNLENBQUE7UUFDZixDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDL0IsQ0FBQztDQUNGIn0=