import { getExtension } from '../../utils'
import { ContextOptions, ContextType, PrimitiveType } from '../../type'
import ShaderProgram from './ShaderProgram'
import VertexShaderSource from '../../Shaders/vertex'
import FragmentShaderSource from '../../Shaders/fragment'
import VertexArray from './VertexArray'
import Geometry from '../Scene/Geometry'
import UniformState from './UniformState'

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

  get uniformState() {
    return this._uniformState
  }
  get depthTexture() {
    return this._depthTexture
  }

  constructor(options: ContextOptions) {
    this._canvas = options.canvas
    this._useGPU = options.isUseGPU

    this.gl = this._initContext()
    this._initialFunctions()

    this._uniformState = new UniformState({
      gl: this.gl
    })

    this._depthTexture = !!getExtension(this.gl, [
      'WEBGL_depth_texture',
      'WEBKIT_WEBGL_depth_texture'
    ])
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
    const isSuppotedwebgl2 = typeof WebGL2RenderingContext !== 'undefined'
    const contextType =
      this._gpuAdapter && this._useGPU
        ? 'webgpu'
        : isSuppotedwebgl2
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
    if (this.gl instanceof WebGL2RenderingContext) {
      this.glCreateVertexArray = this.gl.createVertexArray.bind(this.gl)
      this.glBindVertexArray = this.gl.bindVertexArray.bind(this.gl)
      this.glDeleteVertexArray = this.gl.deleteVertexArray.bind(this.gl)
    } else if (this.gl instanceof WebGLRenderingContext) {
      const vertexArrayObject = getExtension(this.gl, [
        'OES_vertex_array_object'
      ])
      if (vertexArrayObject) {
        this.glCreateVertexArray =
          vertexArrayObject.createVertexArray.bind(vertexArrayObject)
        this.glBindVertexArray =
          vertexArrayObject.bindVertexArray.bind(vertexArrayObject)
        this.glDeleteVertexArray =
          vertexArrayObject.deleteVertexArray.bind(vertexArrayObject)
      }
    }
  }

  draw({
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

    const shaderProgram = new ShaderProgram({
      gl: context.gl,
      vertexShaderSource: VertexShaderSource,
      fragmentShaderSource: FragmentShaderSource
    })
    shaderProgram.initialize()
    shaderProgram.bind()

    this.feedUniforms({ shaderProgram })
    this.shaderProgram = shaderProgram

    if (
      uniformState &&
      uniformState.uniformMap !== context._uniformState.uniformMap
    ) {
      context._uniformState.update(uniformState)
    }

    const va = new VertexArray({
      context,
      geometry
    })

    context.glBindVertexArray!(va.vao)

    context.gl.viewport(
      0,
      0,
      context.gl.drawingBufferWidth,
      context.gl.drawingBufferHeight
    )

    context.gl.drawElements(
      PrimitiveType.TRIANGLES,
      6,
      context.gl.UNSIGNED_SHORT,
      0
    )
  }
  feedUniforms({ shaderProgram }: { shaderProgram: ShaderProgram }) {
    for (const uniformName in shaderProgram.uniforms) {
      const uniform = shaderProgram.uniforms[uniformName]

      uniform.set(this._uniformState.uniformMap[uniformName])
    }
  }
}
