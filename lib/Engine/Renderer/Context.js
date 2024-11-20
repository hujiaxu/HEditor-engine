import { getExtension, isSuppotedGPU } from '../../utils';
import { PrimitiveType } from '../../type';
import ShaderProgram from './ShaderProgram';
import VertexShaderSource from '../../Shaders/vertex';
import FragmentShaderSource from '../../Shaders/fragment';
import VertexArray from './VertexArray';
export default class Context {
    canvas;
    _useGPU = false;
    gl;
    _gpuAdapter;
    _gpuDevice;
    shaderProgram;
    glCreateVertexArray;
    glBindVertexArray;
    glDeleteVertexArray;
    constructor(options) {
        this.canvas = options.canvas;
        this._useGPU = options.isUseGPU;
        this.initContext();
    }
    async initContext() {
        if (this._useGPU) {
            const gpuAdapter = await isSuppotedGPU();
            if (!gpuAdapter) {
                throw new Error('The browser does not support WebGPU.');
            }
            const device = await gpuAdapter.requestDevice();
            this._gpuAdapter = gpuAdapter;
            this._gpuDevice = device;
        }
        const isSuppotedwebgl2 = typeof WebGL2RenderingContext !== 'undefined';
        const contextType = this._gpuAdapter && this._useGPU
            ? 'webgpu'
            : isSuppotedwebgl2
                ? 'webgl2'
                : 'webgl';
        const context = this.canvas.getContext(contextType);
        if (!context) {
            throw new Error('The browser supports WebGL, but initialization failed.');
        }
        if (context instanceof GPUCanvasContext && this._gpuDevice) {
            context.configure({
                device: this._gpuDevice,
                format: navigator.gpu.getPreferredCanvasFormat(),
                alphaMode: 'premultiplied'
            });
        }
        this.gl = context;
        this._initialFunctions();
        return this.gl;
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
    draw({ context, geometry }) {
        if (!context.gl) {
            throw new Error('Context is not initialized.');
        }
        context.gl.clearColor(0, 0, 0, 0);
        context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);
        const shaderProgram = new ShaderProgram({
            gl: context.gl,
            vertexShaderSource: VertexShaderSource,
            fragmentShaderSource: FragmentShaderSource
        });
        this.shaderProgram = shaderProgram;
        const va = new VertexArray({
            context,
            geometry
        });
        console.log(va);
        context.glBindVertexArray(va.vao);
        context.gl.drawElements(PrimitiveType.TRIANGLES, 6, context.gl.UNSIGNED_SHORT, 0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUN6RCxPQUFPLEVBQStCLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUN2RSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLGtCQUFrQixNQUFNLHNCQUFzQixDQUFBO0FBQ3JELE9BQU8sb0JBQW9CLE1BQU0sd0JBQXdCLENBQUE7QUFDekQsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFBO0FBR3ZDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUMxQixNQUFNLENBQW1CO0lBRWpCLE9BQU8sR0FBWSxLQUFLLENBQUE7SUFFaEMsRUFBRSxDQUF5QjtJQUVuQixXQUFXLENBQXdCO0lBQ25DLFVBQVUsQ0FBdUI7SUFFekMsYUFBYSxDQUEyQjtJQUV4QyxtQkFBbUIsQ0FBbUQ7SUFDdEUsaUJBQWlCLENBRUo7SUFDYixtQkFBbUIsQ0FFTjtJQUViLFlBQVksT0FBdUI7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFBO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQTtRQUUvQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDcEIsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXO1FBQ2YsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQTtZQUN4QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQTtZQUN6RCxDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQUcs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