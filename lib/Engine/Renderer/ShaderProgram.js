import Uniform from './Uniform';
export default class ShaderProgram {
    _gl;
    _program;
    _vertexShaderSource;
    _fragmentShaderSource;
    // private _numberOfVertexAttributes: number = 0
    _vertexAttributes = {};
    _uniforms = {};
    get program() {
        return this._program;
    }
    get vertexAttributes() {
        return this._vertexAttributes;
    }
    get uniforms() {
        return this._uniforms;
    }
    constructor({ gl, vertexShaderSource, fragmentShaderSource }) {
        this._gl = gl;
        this._vertexShaderSource = vertexShaderSource;
        this._fragmentShaderSource = fragmentShaderSource;
    }
    initialize() {
        if (this._program) {
            return;
        }
        this.reinitialize();
    }
    reinitialize() {
        const oldProgram = this._program;
        const gl = this._gl;
        const program = this.createAndLinkProgram();
        this._program = program;
        this._vertexAttributes = this.getVertexAttributes({
            program,
            gl
        });
        this._uniforms = this.getUniforms({
            program,
            gl
        });
        if (oldProgram) {
            gl.deleteProgram(oldProgram);
        }
    }
    bind() {
        if (!this._program)
            return;
        const gl = this._gl;
        gl.useProgram(this._program);
    }
    createAndLinkProgram() {
        const gl = this._gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, this._vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, this._fragmentShaderSource);
        if (!vertexShader || !fragmentShader) {
            throw new Error('Failed to create shader.');
        }
        const program = gl.createProgram();
        if (!program) {
            throw new Error('Failed to create shader program.');
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            return program;
        }
        gl.deleteProgram(program);
        let errorMessage = '';
        let log = '';
        const consolePrefix = 'HEditor-engine: ';
        const vsSource = this._vertexShaderSource;
        const fsSource = this._fragmentShaderSource;
        if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            log = gl.getShaderInfoLog(fragmentShader);
            console.error(`${consolePrefix}Fragment shader compile log: ${log}`);
            console.error(`${consolePrefix} Fragment shader source:\n${fsSource}`);
            errorMessage = `Fragment shader failed to compile.  Compile log: ${log}`;
        }
        else if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            log = gl.getShaderInfoLog(vertexShader);
            console.error(`${consolePrefix}Vertex shader compile log: ${log}`);
            console.error(`${consolePrefix} Vertex shader source:\n${vsSource}`);
            errorMessage = `Vertex shader failed to compile.  Compile log: ${log}`;
        }
        else {
            log = gl.getProgramInfoLog(program);
            console.error(`${consolePrefix}Shader program link log: ${log}`);
            // logTranslatedSource(vertexShader, "vertex");
            // logTranslatedSource(fragmentShader, "fragment");
            errorMessage = `Program failed to link.  Link log: ${log}`;
        }
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteProgram(program);
        throw new Error(errorMessage);
    }
    getVertexAttributes({ program, gl }) {
        const numberOfVertexAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        const vertexAttributes = {};
        for (let index = 0; index < numberOfVertexAttributes; index++) {
            const { name, type } = gl.getActiveAttrib(program, index);
            vertexAttributes[name] = { location: index, name, type };
        }
        return vertexAttributes;
    }
    getUniforms({ program, gl }) {
        const numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        const uniforms = {};
        for (let index = 0; index < numberOfUniforms; index++) {
            const { name, type } = gl.getActiveUniform(program, index);
            const location = gl.getUniformLocation(program, name);
            uniforms[name] = new Uniform({
                gl,
                location,
                type
            });
        }
        return uniforms;
    }
    createShader(type, source) {
        const shader = this._gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create shader. ');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhZGVyUHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvU2hhZGVyUHJvZ3JhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFFL0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFhO0lBQ3hCLEdBQUcsQ0FBYTtJQUNoQixRQUFRLENBQTBCO0lBRWxDLG1CQUFtQixDQUFRO0lBQzNCLHFCQUFxQixDQUFRO0lBRXJDLGdEQUFnRDtJQUV4QyxpQkFBaUIsR0FBeUIsRUFBRSxDQUFBO0lBQzVDLFNBQVMsR0FBK0IsRUFBRSxDQUFBO0lBRWxELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtJQUN0QixDQUFDO0lBQ0QsSUFBSSxnQkFBZ0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDL0IsQ0FBQztJQUNELElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtJQUN2QixDQUFDO0lBQ0QsWUFBWSxFQUNWLEVBQUUsRUFDRixrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ0M7UUFDckIsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDYixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUE7UUFDN0MsSUFBSSxDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFBO0lBQ25ELENBQUM7SUFFRCxVQUFVO1FBQ1IsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEIsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7SUFDckIsQ0FBQztJQUVELFlBQVk7UUFDVixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO1FBRWhDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUE7UUFFbkIsTUFBTSxPQUFP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