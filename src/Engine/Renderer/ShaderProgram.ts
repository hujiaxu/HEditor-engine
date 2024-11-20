import { ContextType, ShaderProgramOptions } from '../../type'

export default class ShaderProgram {
  private _gl: ContextType | undefined
  private _program: WebGLProgram | undefined

  get program() {
    return this._program
  }
  constructor({
    gl,
    vertexShaderSource,
    fragmentShaderSource
  }: ShaderProgramOptions) {
    this._gl = gl
    if (!this._gl) {
      throw new Error('Failed to create shader. Context is not initialized.')
    }
    const program = this._gl?.createProgram()
    if (!program) {
      throw new Error('Failed to create shader program.')
    }
    this._program = program

    this.initializeProgram(
      this._program,
      vertexShaderSource,
      fragmentShaderSource
    )
  }

  initializeProgram(
    program: WebGLProgram,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    const vertexShader = this.createShader(
      this._gl!.VERTEX_SHADER,
      vertexShaderSource
    )
    const fragmentShader = this.createShader(
      this._gl!.FRAGMENT_SHADER,
      fragmentShaderSource
    )
    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shader.')
    }
    this._gl!.attachShader(program, vertexShader)
    this._gl!.attachShader(program, fragmentShader)
    this._gl!.linkProgram(program)
    const success = this._gl!.getProgramParameter(
      program,
      this._gl!.LINK_STATUS
    )
    if (success) {
      return this._gl!.useProgram(program)
    }
    console.log(this._gl!.getProgramInfoLog(program))
    this._gl!.deleteProgram(program)
  }

  createShader(type: number, source: string) {
    if (!this._gl) {
      throw new Error('Failed to create shader. Context is not initialized.')
    }
    const shader = this._gl!.createShader(type)
    if (!shader) {
      throw new Error('Failed to create shader.')
    }
    this._gl.shaderSource(shader, source)
    this._gl.compileShader(shader)
    const success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)
    if (success) {
      return shader
    }
    console.log(this._gl.getShaderInfoLog(shader))
    this._gl.deleteShader(shader)
  }
}
