import { getExtension, isSuppotedGPU } from '../../utils'
import { ContextOptions, ContextType, PrimitiveType } from '../../type'
import ShaderProgram from './ShaderProgram'
import VertexShaderSource from '../../Shaders/vertex'
import FragmentShaderSource from '../../Shaders/fragment'
import VertexArray from './VertexArray'
import Geometry from '../Scene/Geometry'

export default class Context {
  canvas: HTMLCanvasElement

  private _useGPU: boolean = false

  gl: ContextType | undefined

  private _gpuAdapter: GPUAdapter | undefined
  private _gpuDevice: GPUDevice | undefined

  shaderProgram: ShaderProgram | undefined

  glCreateVertexArray: (() => WebGLVertexArrayObject | null) | undefined
  glBindVertexArray:
    | ((vertexArray: WebGLVertexArrayObject | null) => void)
    | undefined
  glDeleteVertexArray:
    | ((vertexArray: WebGLVertexArrayObject) => void)
    | undefined

  constructor(options: ContextOptions) {
    this.canvas = options.canvas
    this._useGPU = options.isUseGPU

    this.initContext()
  }

  async initContext() {
    if (this._useGPU) {
      const gpuAdapter = await isSuppotedGPU()
      if (!gpuAdapter) {
        throw new Error('The browser does not support WebGPU.')
      }
      const device = await gpuAdapter.requestDevice()

      this._gpuAdapter = gpuAdapter
      this._gpuDevice = device
    }
    const isSuppotedwebgl2 = typeof WebGL2RenderingContext !== 'undefined'
    const contextType =
      this._gpuAdapter && this._useGPU
        ? 'webgpu'
        : isSuppotedwebgl2
          ? 'webgl2'
          : 'webgl'

    const context = this.canvas.getContext(contextType) as ContextType

    if (!context) {
      throw new Error('The browser supports WebGL, but initialization failed.')
    }
    if (context instanceof GPUCanvasContext && this._gpuDevice) {
      context.configure({
        device: this._gpuDevice,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'premultiplied'
      })
    }
    this.gl = context

    this._initialFunctions()
    return this.gl
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

  draw({ context, geometry }: { context: Context; geometry: Geometry }) {
    if (!context.gl) {
      throw new Error('Context is not initialized.')
    }

    context.gl.clearColor(0, 0, 0, 0)
    context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT)

    const shaderProgram = new ShaderProgram({
      gl: context.gl,
      vertexShaderSource: VertexShaderSource,
      fragmentShaderSource: FragmentShaderSource
    })
    this.shaderProgram = shaderProgram

    const va = new VertexArray({
      context,
      geometry
    })

    console.log(va)
    context.glBindVertexArray!(va.vao)

    context.gl.drawElements(
      PrimitiveType.TRIANGLES,
      6,
      context.gl.UNSIGNED_SHORT,
      0
    )
  }
}
