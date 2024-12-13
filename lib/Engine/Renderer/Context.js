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
    _depthTexture;
    _uniformState;
    gl;
    shaderProgram;
    glCreateVertexArray;
    glBindVertexArray;
    glDeleteVertexArray;
    get uniformState() {
        return this._uniformState;
    }
    get depthTexture() {
        return this._depthTexture;
    }
    constructor(options) {
        this._canvas = options.canvas;
        this._useGPU = options.isUseGPU;
        this.gl = this._initContext();
        this._initialFunctions();
        this._uniformState = new UniformState({
            gl: this.gl
        });
        this._depthTexture = !!getExtension(this.gl, [
            'WEBGL_depth_texture',
            'WEBKIT_WEBGL_depth_texture'
        ]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFDLE9BQU8sRUFBK0IsYUFBYSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3ZFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFBO0FBQzNDLE9BQU8sa0JBQWtCLE1BQU0sc0JBQXNCLENBQUE7QUFDckQsT0FBTyxvQkFBb0IsTUFBTSx3QkFBd0IsQ0FBQTtBQUN6RCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUE7QUFFdkMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUE7QUFFekMsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUFPO0lBQ2xCLE9BQU8sQ0FBbUI7SUFFMUIsT0FBTyxHQUFZLEtBQUssQ0FBQTtJQUN4QixXQUFXLENBQXdCO0lBQ25DLFVBQVUsQ0FBdUI7SUFDakMsYUFBYSxDQUFTO0lBRXRCLGFBQWEsQ0FBYztJQUVuQyxFQUFFLENBQWE7SUFFZixhQUFhLENBQTJCO0lBRXhDLG1CQUFtQixDQUFzQztJQUN6RCxpQkFBaUIsQ0FBdUQ7SUFDeEUsbUJBQW1CLENBQWdEO0lBRW5FLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUMzQixDQUFDO0lBQ0QsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQzNCLENBQUM7SUFFRCxZQUFZLE9BQXVCO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQTtRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUE7UUFFL0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixF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