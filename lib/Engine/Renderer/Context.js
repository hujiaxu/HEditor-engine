import { getExtension } from '../../utils';
import { PrimitiveType } from '../../type';
import ShaderProgram from './ShaderProgram';
import VertexShaderSource from '../../Shaders/vertex';
import FragmentShaderSource from '../../Shaders/fragment';
import VertexArray from './VertexArray';
import UniformState from './UniformState';
export default class Context {
    _canvas;
    _useGPU = false;
    _gpuAdapter;
    _gpuDevice;
    _uniformState;
    gl;
    shaderProgram;
    glCreateVertexArray;
    glBindVertexArray;
    glDeleteVertexArray;
    constructor(options) {
        this._canvas = options.canvas;
        this._useGPU = options.isUseGPU;
        this.gl = this._initContext();
        this._initialFunctions();
        this._uniformState = new UniformState({
            gl: this.gl
        });
    }
    _initContext() {
        // if (this._useGPU) {
        //   const gpuAdapter = await isSuppotedGPU()
        //   if (!gpuAdapter) {
        //     throw new Error('The browser does not support WebGPU.')
        //   }
        //   const device = await gpuAdapter.requestDevice()
        //   this._gpuAdapter = gpuAdapter
        //   this._gpuDevice = device
        // }
        const isSuppotedwebgl2 = typeof WebGL2RenderingContext !== 'undefined';
        const contextType = this._gpuAdapter && this._useGPU
            ? 'webgpu'
            : isSuppotedwebgl2
                ? 'webgl2'
                : 'webgl';
        const gl = this._canvas.getContext(contextType);
        if (!gl) {
            throw new Error('The browser supports WebGL, but initialization failed.');
        }
        if (gl instanceof GPUCanvasContext && this._gpuDevice) {
            gl.configure({
                device: this._gpuDevice,
                format: navigator.gpu.getPreferredCanvasFormat(),
                alphaMode: 'premultiplied'
            });
        }
        return gl;
    }
    _initialFunctions() {
        if (!this.gl)
            return;
        if (this.gl instanceof WebGL2RenderingContext) {
            this.glCreateVertexArray = this.gl.createVertexArray.bind(this.gl);
            this.glBindVertexArray = this.gl.bindVertexArray.bind(this.gl);
            this.glDeleteVertexArray = this.gl.deleteVertexArray.bind(this.gl);
        }
        else if (this.gl instanceof WebGLRenderingContext) {
            const vertexArrayObject = getExtension(this.gl, [
                'OES_vertex_array_object'
            ]);
            if (vertexArrayObject) {
                this.glCreateVertexArray =
                    vertexArrayObject.createVertexArray.bind(vertexArrayObject);
                this.glBindVertexArray =
                    vertexArrayObject.bindVertexArray.bind(vertexArrayObject);
                this.glDeleteVertexArray =
                    vertexArrayObject.deleteVertexArray.bind(vertexArrayObject);
            }
        }
    }
    draw({ context, geometry, uniformState }) {
        if (!context.gl) {
            throw new Error('Context is not initialized. ');
        }
        context.gl.clearColor(0, 0, 0, 0);
        context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);
        const shaderProgram = new ShaderProgram({
            gl: context.gl,
            vertexShaderSource: VertexShaderSource,
            fragmentShaderSource: FragmentShaderSource
        });
        shaderProgram.initialize();
        shaderProgram.bind();
        this.feedUniforms({ shaderProgram });
        this.shaderProgram = shaderProgram;
        if (uniformState &&
            uniformState.uniformMap !== context._uniformState.uniformMap) {
            context._uniformState.update(uniformState);
        }
        const va = new VertexArray({
            context,
            geometry
        });
        console.log(va);
        context.glBindVertexArray(va.vao);
        context.gl.viewport(0, 0, context.gl.drawingBufferWidth, context.gl.drawingBufferHeight);
        context.gl.drawElements(PrimitiveType.TRIANGLES, 6, context.gl.UNSIGNED_SHORT, 0);
    }
    feedUniforms({ shaderProgram }) {
        for (const uniformName in shaderProgram.uniforms) {
            const uniform = shaderProgram.uniforms[uniformName];
            uniform.set(this._uniformState.uniformMap[uniformName]);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFDLE9BQU8sRUFBK0IsYUFBYSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3ZFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFBO0FBQzNDLE9BQU8sa0JBQWtCLE1BQU0sc0JBQXNCLENBQUE7QUFDckQsT0FBTyxvQkFBb0IsTUFBTSx3QkFBd0IsQ0FBQTtBQUN6RCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUE7QUFFdkMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUE7QUFFekMsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUFPO0lBQ2xCLE9BQU8sQ0FBbUI7SUFFMUIsT0FBTyxHQUFZLEtBQUssQ0FBQTtJQUN4QixXQUFXLENBQXdCO0lBQ25DLFVBQVUsQ0FBdUI7SUFFakMsYUFBYSxDQUFjO0lBRW5DLEVBQUUsQ0FBYTtJQUVmLGFBQWEsQ0FBMkI7SUFFeEMsbUJBQW1CLENBQXNDO0lBQ3pELGlCQUFpQixDQUF1RDtJQUN4RSxtQkFBbUIsQ0FBZ0Q7SUFFbkUsWUFBWSxPQUF1QjtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUE7UUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBO1FBRS9CLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQzdCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBRXhCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxZQUFZLENBQUM7WUFDcEMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1NBQ1osQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVPLFlBQVk7UUFDbEIsc0JBQXNC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