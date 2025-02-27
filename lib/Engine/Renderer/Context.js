import { getExtension } from '../../utils';
import { PrimitiveType } from '../../type';
import ShaderProgram from './ShaderProgram';
import VertexShaderSource from '../../Shaders/vertex';
import FragmentShaderSource from '../../Shaders/fragment';
import UniformState from './UniformState';
import Defined from '../Core/Defined';
import Color from '../Core/Color';
import PickId from '../Core/PickId';
import ContextLimits from './ContextLimits';
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
    glVertexAttribDivisor;
    _pickObjects;
    _nextPickColor;
    _textureFloat = false;
    _textureHalfFloat = false;
    _s3tc = false;
    _pvrtc = false;
    _astc = false;
    _etc = false;
    _etc1 = false;
    _bc7 = false;
    _elementIndexUint = false;
    _textureFilterAnisotropic = false;
    _textureFloatLinear = false;
    _textureHalfFloatLinear = false;
    _defaultFramebufferMarker;
    _instancedArrays = false;
    _vertexAttribDivisors;
    _previousDrawInstanced;
    _vertexArrayObject = false;
    get vertexArrayObject() {
        return this._vertexArrayObject || this.isSuppotedwebgl2;
    }
    get uniformState() {
        return this._uniformState;
    }
    get depthTexture() {
        return this._depthTexture;
    }
    get isSuppotedwebgl2() {
        return typeof WebGL2RenderingContext !== 'undefined';
    }
    get floatingPointTexture() {
        return this.isSuppotedwebgl2 || this._textureFloat;
    }
    get halfFloatingPointTexture() {
        return this.isSuppotedwebgl2 || this._textureHalfFloat;
    }
    get s3tc() {
        return this._s3tc;
    }
    get pvrtc() {
        return this._pvrtc;
    }
    get elementIndexUint() {
        return this._elementIndexUint || this.isSuppotedwebgl2;
    }
    get instancedArrays() {
        return this._instancedArrays || this.isSuppotedwebgl2;
    }
    get astc() {
        return this._astc;
    }
    get etc() {
        return this._etc;
    }
    get etc1() {
        return this._etc1;
    }
    get bc7() {
        return this._bc7;
    }
    get textureFilterAnisotropic() {
        return this._textureFilterAnisotropic;
    }
    get textureFloatLinear() {
        return this._textureFloatLinear;
    }
    get textureHalfFloatLinear() {
        return this._textureHalfFloatLinear;
    }
    get defaultFramebuffer() {
        return this._defaultFramebufferMarker;
    }
    get drawingBufferWidth() {
        return this.gl.drawingBufferWidth;
    }
    get drawingBufferHeight() {
        return this.gl.drawingBufferHeight;
    }
    constructor(options) {
        this._canvas = options.canvas;
        this._useGPU = options.isUseGPU;
        const gl = this._initContext();
        this._initialFunctions();
        this.gl = gl;
        this._uniformState = new UniformState({
            gl: this.gl
        });
        this._depthTexture = !!getExtension(this.gl, [
            'WEBGL_depth_texture',
            'WEBKIT_WEBGL_depth_texture'
        ]);
        this._pickObjects = {};
        this._nextPickColor = new Uint32Array(1);
        this._defaultFramebufferMarker = undefined;
        ContextLimits._maximumVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS); // min: 8
        // Vertex attribute divisor state cache. Workaround for ANGLE (also look at VertexArray.setVertexAttribDivisor)
        this._vertexAttribDivisors = [];
        this._previousDrawInstanced = false;
        for (let i = 0; i < ContextLimits._maximumVertexAttributes; i++) {
            this._vertexAttribDivisors.push(0);
        }
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
        const contextType = this._gpuAdapter && this._useGPU
            ? 'webgpu'
            : this.isSuppotedwebgl2
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
        ContextLimits.maximumTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        ContextLimits.maximumVertexTextureImageUnits = this.gl.getParameter(this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        ContextLimits.maximumColorAttachments =
            this.gl.getParameter(WebGL2RenderingContext.MAX_COLOR_ATTACHMENTS) || 1;
        this._textureFloat = !!getExtension(this.gl, ['OES_texture_float']);
        this._textureHalfFloat = !!getExtension(this.gl, ['OES_texture_half_float']);
        this._s3tc = !!getExtension(this.gl, [
            'WEBGL_compressed_texture_s3tc',
            'MOZ_WEBGL_compressed_texture_s3tc',
            'WEBKIT_WEBGL_compressed_texture_s3tc'
        ]);
        this._pvrtc = !!getExtension(this.gl, [
            'WEBGL_compressed_texture_pvrtc',
            'WEBKIT_WEBGL_compressed_texture_pvrtc'
        ]);
        this._astc = !!getExtension(this.gl, ['WEBGL_compressed_texture_astc']);
        this._etc = !!getExtension(this.gl, ['WEBG_compressed_texture_etc']);
        this._etc1 = !!getExtension(this.gl, ['WEBGL_compressed_texture_etc1']);
        this._bc7 = !!getExtension(this.gl, ['EXT_texture_compression_bptc']);
        this._textureFilterAnisotropic = getExtension(this.gl, [
            'EXT_texture_filter_anisotropic',
            'WEBKIT_EXT_texture_filter_anisotropic'
        ]);
        this._textureFloatLinear = !!getExtension(this.gl, [
            'OES_texture_float_linear'
        ]);
        this._textureHalfFloatLinear = !!getExtension(this.gl, [
            'OES_texture_half_float_linear'
        ]);
        this._elementIndexUint = !!getExtension(this.gl, ['OES_element_index_uint']);
        this._instancedArrays = !!getExtension(this.gl, ['ANGLE_instanced_arrays']);
        if (this.gl instanceof WebGL2RenderingContext) {
            const gl = this.gl;
            this.glCreateVertexArray = gl.createVertexArray.bind(gl);
            this.glBindVertexArray = gl.bindVertexArray.bind(gl);
            this.glDeleteVertexArray = gl.deleteVertexArray.bind(gl);
            this.glVertexAttribDivisor = function (index, divisor) {
                gl.vertexAttribDivisor(index, divisor);
            };
        }
        else if (this.gl instanceof WebGLRenderingContext) {
            const gl = this.gl;
            const vertexArrayObject = getExtension(gl, ['OES_vertex_array_object']);
            if (vertexArrayObject) {
                this.glCreateVertexArray =
                    vertexArrayObject.createVertexArray.bind(vertexArrayObject);
                this.glBindVertexArray =
                    vertexArrayObject.bindVertexArray.bind(vertexArrayObject);
                this.glDeleteVertexArray =
                    vertexArrayObject.deleteVertexArray.bind(vertexArrayObject);
            }
            this._vertexArrayObject = !!vertexArrayObject;
            const instancedArrays = getExtension(gl, ['ANGLE_instanced_arrays']);
            if (instancedArrays) {
                this.glVertexAttribDivisor = function (index, divisor) {
                    instancedArrays.vertexAttribDivisor(index, divisor);
                };
            }
        }
    }
    createPickId(object) {
        if (!Defined(object)) {
            throw new Error('object is required.');
        }
        ++this._nextPickColor[0];
        const key = this._nextPickColor[0];
        if (key === 0) {
            throw new Error('The maximum number of pick IDs has been reached.');
        }
        this._pickObjects[key] = object;
        return new PickId(this._pickObjects, key, Color.fromRgba(key));
    }
    draw({ context, geometry, uniformState }) {
        if (!context.gl) {
            throw new Error('Context is not initialized. ');
        }
        context.gl.clearColor(0, 0, 0, 0);
        context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);
        context.gl.enable(context.gl.DEPTH_TEST);
        const shaderProgram = new ShaderProgram({
            gl: context.gl,
            vertexShaderSource: VertexShaderSource,
            fragmentShaderSource: FragmentShaderSource
        });
        shaderProgram.initialize();
        shaderProgram.bind();
        this._feedUniforms({ shaderProgram });
        this.shaderProgram = shaderProgram;
        if (uniformState &&
            uniformState.uniformMap !== context._uniformState.uniformMap) {
            context._uniformState.update(uniformState);
        }
        // const va = VertexArray.fromGeometry({
        //   gl: context.gl,
        //   geometry
        // })
        // context.glBindVertexArray!(va.vao)
        context.gl.viewport(0, 0, context.gl.drawingBufferWidth, context.gl.drawingBufferHeight);
        const count = geometry.indices.length;
        context.gl.drawElements(PrimitiveType.TRIANGLES, count, context.gl.UNSIGNED_SHORT, 0);
    }
    _feedUniforms({ shaderProgram }) {
        for (const uniformName in shaderProgram.uniforms) {
            const uniform = shaderProgram.uniforms[uniformName];
            uniform.set(this._uniformState.uniformMap[uniformName]);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFDLE9BQU8sRUFLTCxhQUFhLEVBQ2QsTUFBTSxZQUFZLENBQUE7QUFDbkIsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUE7QUFDM0MsT0FBTyxrQkFBa0IsTUFBTSxzQkFBc0IsQ0FBQTtBQUNyRCxPQUFPLG9CQUFvQixNQUFNLHdCQUF3QixDQUFBO0FBR3pELE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQTtBQUNqQyxPQUFPLE1BQU0sTUFBTSxnQkFBZ0IsQ0FBQTtBQUNuQyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUczQyxNQUFNLENBQUMsT0FBTyxPQUFPLE9BQU87SUFDbEIsT0FBTyxDQUFtQjtJQUUxQixPQUFPLEdBQVksS0FBSyxDQUFBO0lBQ3hCLFdBQVcsQ0FBd0I7SUFDbkMsVUFBVSxDQUF1QjtJQUNqQyxhQUFhLENBQVM7SUFFdEIsYUFBYSxDQUFjO0lBRW5DLEVBQUUsQ0FBYTtJQUVmLGFBQWEsQ0FBMkI7SUFFeEMsbUJBQW1CLENBQXNDO0lBQ3pELGlCQUFpQixDQUF1RDtJQUN4RSxtQkFBbUIsQ0FBZ0Q7SUFDbkUscUJBQXFCLENBQTJDO0lBQ3hELFlBQVksQ0FBYTtJQUN6QixjQUFjLENBQTBCO0lBQ3hDLGFBQWEsR0FBWSxLQUFLLENBQUE7SUFDOUIsaUJBQWlCLEdBQVksS0FBSyxDQUFBO0lBQ2xDLEtBQUssR0FBWSxLQUFLLENBQUE7SUFDdEIsTUFBTSxHQUFZLEtBQUssQ0FBQTtJQUN2QixLQUFLLEdBQVksS0FBSyxDQUFBO0lBQ3RCLElBQUksR0FBWSxLQUFLLENBQUE7SUFDckIsS0FBSyxHQUFZLEtBQUssQ0FBQTtJQUN0QixJQUFJLEdBQVksS0FBSyxDQUFBO0lBQ3JCLGlCQUFpQixHQUFZLEtBQUssQ0FBQTtJQUNsQyx5QkFBeUIsR0FBWSxLQUFLLENBQUE7SUFDMUMsbUJBQW1CLEdBQVksS0FBSyxDQUFBO0lBQ3BDLHVCQUF1QixHQUFZLEtBQUssQ0FBQTtJQUN4Qyx5QkFBeUIsQ0FBeUI7SUFDbEQsZ0JBQWdCLEdBQVksS0FBSyxDQUFBO0lBQ3pDLHFCQUFxQixDQUFVO0lBQy9CLHNCQUFzQixDQUFTO0lBQ3ZCLGtCQUFrQixHQUFZLEtBQUssQ0FBQTtJQUUzQyxJQUFJLGlCQUFpQjtRQUNuQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUE7SUFDekQsQ0FBQztJQUNELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUMzQixDQUFDO0lBQ0QsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQzNCLENBQUM7SUFDRCxJQUFJLGdCQUFnQjtRQUNsQixPQUFPLE9BQU8sc0JBQXNCLEtBQUssV0FBVyxDQUFBO0lBQ3RELENBQUM7SUFDRCxJQUFJLG9CQUFvQjtRQUN0QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQ3BELENBQUM7SUFDRCxJQUFJLHdCQUF3QjtRQUMxQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDeEQsQ0FBQztJQUNELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBQ0QsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQ3BCLENBQUM7SUFDRCxJQUFJLGdCQUFnQjtRQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUE7SUFDeEQsQ0FBQztJQUNELElBQUksZUFBZTtRQUNqQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUE7SUFDdkQsQ0FBQztJQUNELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBQ0QsSUFBSSxHQUFHO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUNELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBQ0QsSUFBSSx3QkFBd0I7UUFDMUIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUE7SUFDdkMsQ0FBQztJQUNELElBQUksa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFBO0lBQ2pDLENBQUM7SUFDRCxJQUFJLHNCQUFzQjtRQUN4QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQTtJQUNyQyxDQUFDO0lBQ0QsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUE7SUFDdkMsQ0FBQztJQUNELElBQUksa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQTtJQUNuQyxDQUFDO0lBQ0QsSUFBSSxtQkFBbUI7UUFDckIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFBO0lBQ3BDLENBQUM7SUFFRCxZQUFZLE9BQXVCO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQTtRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUE7UUFFL0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQzlCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBRVosSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFlBQVksQ0FBQztZQUNwQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7U0FDWixDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxxQkFBcUI7WUFDckIsNEJBQTRCO1NBQzdCLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQTtRQUUxQyxhQUFhLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FDdEQsRUFBRSxDQUFDLGtCQUFrQixDQUN0QixDQUFBLENBQUMsU0FBUztRQUVYLCtHQUErRztRQUMvRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFBO1FBQy9CLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUE7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEMsQ0FBQztJQUNILENBQUM7SUFFTyxZQUFZO1FBQ2xCLHNCQUFzQjtRQUN0Qiw2Q0FBNkM7UUFDN0MsdUJBQXVCO1FBQ3ZCLDhEQUE4RDtRQUM5RCxNQUFNO1FBQ04sb0RBQW9EO1FBRXBELGtDQUFrQztRQUNsQyw2QkFBNkI7UUFDN0IsSUFBSTtRQUNKLE1BQU0sV0FBVyxHQUNmLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU87WUFDOUIsQ0FBQyxDQUFDLFFBQVE7WUFDVixDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQjtnQkFDckIsQ0FBQyxDQUFDLFFBQVE7Z0JBQ1YsQ0FBQyxDQUFDLE9BQU8sQ0FBQTtRQUVmLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBZ0IsQ0FBQTtRQUU5RCxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDUixNQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUE7UUFDM0UsQ0FBQztRQUNELElBQUksRUFBRSxZQUFZLGdCQUFnQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0RCxFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNYLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDdkIsTUFBTSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ2hELFNBQVMsRUFBRSxlQUFlO2FBQzNCLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFFRCxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTTtRQUNwQixhQUFhLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQ3pCLENBQUE7UUFDRCxhQUFhLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQ2pFLElBQUksQ0FBQyxFQUFFLENBQUMsOEJBQThCLENBQ3ZDLENBQUE7UUFDRCxhQUFhLENBQUMsdUJBQXVCO1lBQ25DLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3pFLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFBO1FBQ25FLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7UUFDNUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDbkMsK0JBQStCO1lBQy9CLG1DQUFtQztZQUNuQyxzQ0FBc0M7U0FDdkMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDcEMsZ0NBQWdDO1lBQ2hDLHVDQUF1QztTQUN4QyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQTtRQUN2RSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQTtRQUNwRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQTtRQUN2RSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQTtRQUNyRSxJQUFJLENBQUMseUJBQXlCLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDckQsZ0NBQWdDO1lBQ2hDLHVDQUF1QztTQUN4QyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ2pELDBCQUEwQjtTQUMzQixDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ3JELCtCQUErQjtTQUNoQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFBO1FBQzVFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7UUFDM0UsSUFBSSxJQUFJLENBQUMsRUFBRSxZQUFZLHNCQUFzQixFQUFFLENBQUM7WUFDOUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQTRCLENBQUE7WUFDNUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDeEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3BELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBRXhELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxVQUFVLEtBQWEsRUFBRSxPQUFlO2dCQUNuRSxFQUFFLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQ3hDLENBQUMsQ0FBQTtRQUNILENBQUM7YUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLFlBQVkscUJBQXFCLEVBQUUsQ0FBQztZQUNwRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBMkIsQ0FBQTtZQUMzQyxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUE7WUFDdkUsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsbUJBQW1CO29CQUN0QixpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtnQkFDN0QsSUFBSSxDQUFDLGlCQUFpQjtvQkFDcEIsaUJBQWlCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO2dCQUMzRCxJQUFJLENBQUMsbUJBQW1CO29CQUN0QixpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUMvRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQTtZQUU3QyxNQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFBO1lBQ3BFLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxVQUFVLEtBQWEsRUFBRSxPQUFlO29CQUNuRSxlQUFlLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFBO2dCQUNyRCxDQUFDLENBQUE7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFTSxZQUFZLENBQUMsTUFBa0I7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQTtRQUN4QyxDQUFDO1FBRUQsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEMsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUE7UUFDckUsQ0FBQztRQUVELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFBO1FBQy9CLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2hFLENBQUM7SUFFTSxJQUFJLENBQUMsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLFlBQVksRUFLYjtRQUNDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1FBQ2pELENBQUM7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNqQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUMzRSxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ3hDLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO1lBQ3RDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNkLGtCQUFrQixFQUFFLGtCQUFrQjtZQUN0QyxvQkFBb0IsRUFBRSxvQkFBb0I7U0FDM0MsQ0FBQyxDQUFBO1FBQ0YsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzFCLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUVwQixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQTtRQUNyQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtRQUVsQyxJQUNFLFlBQVk7WUFDWixZQUFZLENBQUMsVUFBVSxLQUFLLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUM1RCxDQUFDO1lBQ0QsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDNUMsQ0FBQztRQUVELHdDQUF3QztRQUN4QyxvQkFBb0I7UUFDcEIsYUFBYTtRQUNiLEtBQUs7UUFFTCxxQ0FBcUM7UUFFckMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQ2pCLENBQUMsRUFDRCxDQUFDLEVBQ0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFDN0IsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FDL0IsQ0FBQTtRQUVELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFBO1FBRXJDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUNyQixhQUFhLENBQUMsU0FBUyxFQUN2QixLQUFLLEVBQ0wsT0FBTyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQ3pCLENBQUMsQ0FDRixDQUFBO0lBQ0gsQ0FBQztJQUNPLGFBQWEsQ0FBQyxFQUFFLGFBQWEsRUFBb0M7UUFDdkUsS0FBSyxNQUFNLFdBQVcsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakQsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUVuRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7UUFDekQsQ0FBQztJQUNILENBQUM7Q0FDRiJ9