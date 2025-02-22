import { getExtension } from '../../utils';
import { PrimitiveType } from '../../type';
import ShaderProgram from './ShaderProgram';
import VertexShaderSource from '../../Shaders/vertex';
import FragmentShaderSource from '../../Shaders/fragment';
import VertexArray from './VertexArray';
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
        const va = new VertexArray({
            context,
            geometry
        });
        context.glBindVertexArray(va.vao);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFDLE9BQU8sRUFLTCxhQUFhLEVBQ2QsTUFBTSxZQUFZLENBQUE7QUFDbkIsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUE7QUFDM0MsT0FBTyxrQkFBa0IsTUFBTSxzQkFBc0IsQ0FBQTtBQUNyRCxPQUFPLG9CQUFvQixNQUFNLHdCQUF3QixDQUFBO0FBQ3pELE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQTtBQUV2QyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUE7QUFDakMsT0FBTyxNQUFNLE1BQU0sZ0JBQWdCLENBQUE7QUFDbkMsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUE7QUFHM0MsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUFPO0lBQ2xCLE9BQU8sQ0FBbUI7SUFFMUIsT0FBTyxHQUFZLEtBQUssQ0FBQTtJQUN4QixXQUFXLENBQXdCO0lBQ25DLFVBQVUsQ0FBdUI7SUFDakMsYUFBYSxDQUFTO0lBRXRCLGFBQWEsQ0FBYztJQUVuQyxFQUFFLENBQWE7SUFFZixhQUFhLENBQTJCO0lBRXhDLG1CQUFtQixDQUFzQztJQUN6RCxpQkFBaUIsQ0FBdUQ7SUFDeEUsbUJBQW1CLENBQWdEO0lBQ25FLHFCQUFxQixDQUEyQztJQUN4RCxZQUFZLENBQWE7SUFDekIsY0FBYyxDQUEwQjtJQUN4QyxhQUFhLEdBQVksS0FBSyxDQUFBO0lBQzlCLGlCQUFpQixHQUFZLEtBQUssQ0FBQTtJQUNsQyxLQUFLLEdBQVksS0FBSyxDQUFBO0lBQ3RCLE1BQU0sR0FBWSxLQUFLLENBQUE7SUFDdkIsS0FB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