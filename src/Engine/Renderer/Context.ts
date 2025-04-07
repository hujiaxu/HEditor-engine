import { getExtension } from '../../utils'
import {
  ContextOptions,
  ContextType,
  PickObject,
  PickObjects,
  PrimitiveType
} from '../../type'
import ShaderProgram from './ShaderProgram'
import VertexShaderSource from '../../Shaders/vertex'
import FragmentShaderSource from '../../Shaders/fragment'
// import VertexArray from './VertexArray'
import Geometry from '../Core/Geometry'
import UniformState from './UniformState'
import Defined from '../Core/Defined'
import Color from '../Core/Color'
import PickId from '../Core/PickId'
import ContextLimits from './ContextLimits'
import Framebuffer from './Framebuffer'
import Texture from './Texture'
import { DefaultValue } from '..'

export default class Context {
  private _canvas: HTMLCanvasElement

  private _useGPU: boolean = false
  private _gpuAdapter: GPUAdapter | undefined
  private _gpuDevice: GPUDevice | undefined
  private _depthTexture: boolean

  private _uniformState: UniformState

  gl: ContextType

  shaderProgram: ShaderProgram | undefined

  glCreateVertexArray!: () => WebGLVertexArrayObject | null
  glBindVertexArray!: (vertexArray: WebGLVertexArrayObject | null) => void
  glDeleteVertexArray!: (vertexArray: WebGLVertexArrayObject) => void
  glVertexAttribDivisor!: (index: number, divisor: number) => void
  private _pickObjects: PickObjects
  private _nextPickColor: Uint32Array<ArrayBuffer>
  private _textureFloat: boolean = false
  private _textureHalfFloat: boolean = false
  private _s3tc: boolean = false
  private _pvrtc: boolean = false
  private _astc: boolean = false
  private _etc: boolean = false
  private _etc1: boolean = false
  private _bc7: boolean = false
  private _elementIndexUint: boolean = false
  private _textureFilterAnisotropic: boolean = false
  private _textureFloatLinear: boolean = false
  private _textureHalfFloatLinear: boolean = false
  private _defaultFramebufferMarker: Framebuffer | undefined
  private _instancedArrays: boolean = false
  _vertexAttribDivisors: number[]
  _previousDrawInstanced: boolean
  private _vertexArrayObject: boolean = false
  private _defaultTexture: Texture | undefined
  private _allowTextureFilterAnisotropic: boolean

  get vertexArrayObject() {
    return this._vertexArrayObject || this.isSuppotedwebgl2
  }
  get uniformState() {
    return this._uniformState
  }
  get depthTexture() {
    return this._depthTexture
  }
  get isSuppotedwebgl2() {
    return typeof WebGL2RenderingContext !== 'undefined'
  }
  get floatingPointTexture() {
    return this.isSuppotedwebgl2 || this._textureFloat
  }
  get halfFloatingPointTexture() {
    return this.isSuppotedwebgl2 || this._textureHalfFloat
  }
  get s3tc() {
    return this._s3tc
  }
  get pvrtc() {
    return this._pvrtc
  }
  get elementIndexUint() {
    return this._elementIndexUint || this.isSuppotedwebgl2
  }
  get instancedArrays() {
    return this._instancedArrays || this.isSuppotedwebgl2
  }
  get astc() {
    return this._astc
  }
  get etc() {
    return this._etc
  }
  get etc1() {
    return this._etc1
  }
  get bc7() {
    return this._bc7
  }
  get textureFilterAnisotropic() {
    return this._textureFilterAnisotropic
  }
  get textureFloatLinear() {
    return this._textureFloatLinear
  }
  get textureHalfFloatLinear() {
    return this._textureHalfFloatLinear
  }
  get defaultFramebuffer() {
    return this._defaultFramebufferMarker
  }
  get drawingBufferWidth() {
    return this.gl.drawingBufferWidth
  }
  get drawingBufferHeight() {
    return this.gl.drawingBufferHeight
  }

  get defaultTexture() {
    if (this._defaultTexture === undefined) {
      this._defaultTexture = new Texture({
        context: this,
        source: {
          width: 1,
          height: 1,
          arrayBufferView: new Uint8Array([255, 255, 255, 255])
        },
        flipY: false
      })
    }

    return this._defaultTexture
  }
  get allowTextureFilterAnisotropic() {
    return this._allowTextureFilterAnisotropic
  }

  constructor(options: ContextOptions) {
    this._canvas = options.canvas
    this._useGPU = options.isUseGPU
    this._allowTextureFilterAnisotropic = DefaultValue(
      options.allowTextureFilterAnisotropic,
      true
    )

    const gl = this._initContext()
    this._initialFunctions()
    this.gl = gl

    this._uniformState = new UniformState({
      gl: this.gl
    })

    this._depthTexture = !!getExtension(this.gl, [
      'WEBGL_depth_texture',
      'WEBKIT_WEBGL_depth_texture'
    ])

    this._pickObjects = {}
    this._nextPickColor = new Uint32Array(1)
    this._defaultFramebufferMarker = undefined

    ContextLimits._maximumVertexAttributes = gl.getParameter(
      gl.MAX_VERTEX_ATTRIBS
    ) // min: 8
    ContextLimits._maximumCubeMapSize = gl.getParameter(
      gl.MAX_CUBE_MAP_TEXTURE_SIZE
    ) // min: 16

    const maximumViewportDimensions = gl.getParameter(gl.MAX_VIEWPORT_DIMS)
    ContextLimits._maximumViewportWidth = maximumViewportDimensions[0]
    ContextLimits._maximumViewportHeight = maximumViewportDimensions[1]

    // Vertex attribute divisor state cache. Workaround for ANGLE (also look at VertexArray.setVertexAttribDivisor)
    this._vertexAttribDivisors = []
    this._previousDrawInstanced = false
    for (let i = 0; i < ContextLimits._maximumVertexAttributes; i++) {
      this._vertexAttribDivisors.push(0)
    }
  }

  private _initContext() {
    // if (this._useGPU) {
    //   const gpuAdapter = await isSuppotedGPU()
    //   if (!gpuAdapter) {
    //     throw new Error('The browser does not support WebGPU.')
    //   }
    //   const device = await gpuAdapter.requestDevice()

    //   this._gpuAdapter = gpuAdapter
    //   this._gpuDevice = device
    // }
    const contextType =
      this._gpuAdapter && this._useGPU
        ? 'webgpu'
        : this.isSuppotedwebgl2
          ? 'webgl2'
          : 'webgl'

    const gl = this._canvas.getContext(contextType) as ContextType

    if (!gl) {
      throw new Error('The browser supports WebGL, but initialization failed.')
    }
    if (gl instanceof GPUCanvasContext && this._gpuDevice) {
      gl.configure({
        device: this._gpuDevice,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'premultiplied'
      })
    }

    return gl
  }

  private _initialFunctions() {
    if (!this.gl) return
    ContextLimits.maximumTextureSize = this.gl.getParameter(
      this.gl.MAX_TEXTURE_SIZE
    )
    ContextLimits.maximumVertexTextureImageUnits = this.gl.getParameter(
      this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
    )
    ContextLimits.maximumColorAttachments =
      this.gl.getParameter(WebGL2RenderingContext.MAX_COLOR_ATTACHMENTS) || 1
    this._textureFloat = !!getExtension(this.gl, ['OES_texture_float'])
    this._textureHalfFloat = !!getExtension(this.gl, ['OES_texture_half_float'])
    this._s3tc = !!getExtension(this.gl, [
      'WEBGL_compressed_texture_s3tc',
      'MOZ_WEBGL_compressed_texture_s3tc',
      'WEBKIT_WEBGL_compressed_texture_s3tc'
    ])
    this._pvrtc = !!getExtension(this.gl, [
      'WEBGL_compressed_texture_pvrtc',
      'WEBKIT_WEBGL_compressed_texture_pvrtc'
    ])
    this._astc = !!getExtension(this.gl, ['WEBGL_compressed_texture_astc'])
    this._etc = !!getExtension(this.gl, ['WEBG_compressed_texture_etc'])
    this._etc1 = !!getExtension(this.gl, ['WEBGL_compressed_texture_etc1'])
    this._bc7 = !!getExtension(this.gl, ['EXT_texture_compression_bptc'])
    this._textureFilterAnisotropic = getExtension(this.gl, [
      'EXT_texture_filter_anisotropic',
      'WEBKIT_EXT_texture_filter_anisotropic'
    ])
    this._textureFloatLinear = !!getExtension(this.gl, [
      'OES_texture_float_linear'
    ])
    this._textureHalfFloatLinear = !!getExtension(this.gl, [
      'OES_texture_half_float_linear'
    ])
    this._elementIndexUint = !!getExtension(this.gl, ['OES_element_index_uint'])
    this._instancedArrays = !!getExtension(this.gl, ['ANGLE_instanced_arrays'])

    const textureFilterAnisotropic = this.allowTextureFilterAnisotropic
      ? getExtension(this.gl, [
          'EXT_texture_filter_anisotropic',
          'WEBKIT_EXT_texture_filter_anisotropic'
        ])
      : undefined
    this._textureFilterAnisotropic = textureFilterAnisotropic

    if (this.gl instanceof WebGL2RenderingContext) {
      const gl = this.gl as WebGL2RenderingContext
      this.glCreateVertexArray = gl.createVertexArray.bind(gl)
      this.glBindVertexArray = gl.bindVertexArray.bind(gl)
      this.glDeleteVertexArray = gl.deleteVertexArray.bind(gl)

      this.glVertexAttribDivisor = function (index: number, divisor: number) {
        gl.vertexAttribDivisor(index, divisor)
      }
    } else if (this.gl instanceof WebGLRenderingContext) {
      const gl = this.gl as WebGLRenderingContext
      const vertexArrayObject = getExtension(gl, ['OES_vertex_array_object'])
      if (vertexArrayObject) {
        this.glCreateVertexArray =
          vertexArrayObject.createVertexArray.bind(vertexArrayObject)
        this.glBindVertexArray =
          vertexArrayObject.bindVertexArray.bind(vertexArrayObject)
        this.glDeleteVertexArray =
          vertexArrayObject.deleteVertexArray.bind(vertexArrayObject)
      }
      this._vertexArrayObject = !!vertexArrayObject

      const instancedArrays = getExtension(gl, ['ANGLE_instanced_arrays'])
      if (instancedArrays) {
        this.glVertexAttribDivisor = function (index: number, divisor: number) {
          instancedArrays.vertexAttribDivisor(index, divisor)
        }
      }
    }
  }

  public createPickId(object: PickObject) {
    if (!Defined(object)) {
      throw new Error('object is required.')
    }

    ++this._nextPickColor[0]
    const key = this._nextPickColor[0]
    if (key === 0) {
      throw new Error('The maximum number of pick IDs has been reached.')
    }

    this._pickObjects[key] = object
    return new PickId(this._pickObjects, key, Color.fromRgba(key))
  }

  public draw({
    context,
    geometry,
    uniformState
  }: {
    context: Context
    geometry: Geometry
    uniformState?: UniformState
  }) {
    if (!context.gl) {
      throw new Error('Context is not initialized. ')
    }

    context.gl.clearColor(0, 0, 0, 0)
    context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT)
    context.gl.enable(context.gl.DEPTH_TEST)
    const shaderProgram = new ShaderProgram({
      gl: context.gl,
      vertexShaderSource: VertexShaderSource,
      fragmentShaderSource: FragmentShaderSource
    })
    shaderProgram.initialize()
    shaderProgram.bind()

    this._feedUniforms({ shaderProgram })
    this.shaderProgram = shaderProgram

    if (
      uniformState &&
      uniformState.uniformMap !== context._uniformState.uniformMap
    ) {
      context._uniformState.update(uniformState)
    }

    // const va = VertexArray.fromGeometry({
    //   gl: context.gl,
    //   geometry
    // })

    // context.glBindVertexArray!(va.vao)

    context.gl.viewport(
      0,
      0,
      context.gl.drawingBufferWidth,
      context.gl.drawingBufferHeight
    )

    const count = geometry.indices.length

    context.gl.drawElements(
      PrimitiveType.TRIANGLES,
      count,
      context.gl.UNSIGNED_SHORT,
      0
    )
  }
  private _feedUniforms({ shaderProgram }: { shaderProgram: ShaderProgram }) {
    for (const uniformName in shaderProgram.uniforms) {
      const uniform = shaderProgram.uniforms[uniformName]

      uniform.set(this._uniformState.uniformMap[uniformName])
    }
  }
}
