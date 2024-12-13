import {
  ContextType,
  ShaderProgramOptions,
  VertexAttributesType
} from '../../type'
import Uniform from './Uniform'

export default class ShaderProgram {
  private _gl: ContextType
  private _program: WebGLProgram | undefined

  private _vertexShaderSource: string
  private _fragmentShaderSource: string

  // private _numberOfVertexAttributes: number = 0

  private _vertexAttributes: VertexAttributesType = {}
  private _uniforms: { [key: string]: Uniform } = {}

  get program() {
    return this._program
  }
  get vertexAttributes() {
    return this._vertexAttributes
  }
  get uniforms() {
    return this._uniforms
  }
  constructor({
    gl,
    vertexShaderSource,
    fragmentShaderSource
  }: ShaderProgramOptions) {
    this._gl = gl
    this._vertexShaderSource = vertexShaderSource
    this._fragmentShaderSource = fragmentShaderSource
  }

  initialize() {
    if (this._program) {
      return
    }

    this.reinitialize()
  }

  reinitialize() {
    const oldProgram = this._program

    const gl = this._gl

    const program = this.createAndLinkProgram()
    this._program = program

    this._vertexAttributes = this.getVertexAttributes({
      program,
      gl
    })
    this._uniforms = this.getUniforms({
      program,
      gl
    })

    if (oldProgram) {
      gl.deleteProgram(oldProgram)
    }
  }

  bind() {
    if (!this._program) return
    const gl = this._gl
    gl.useProgram(this._program)
  }

  createAndLinkProgram() {
    const gl = this._gl

    const vertexShader = this.createShader(
      gl.VERTEX_SHADER,
      this._vertexShaderSource
    )
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      this._fragmentShaderSource
    )
    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shader.')
    }

    const program = gl.createProgram()
    if (!program) {
      throw new Error('Failed to create shader program.')
    }
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return program
    }
    gl!.deleteProgram(program)

    let errorMessage = ''
    let log: string | null = ''
    const consolePrefix = 'HEditor-engine: '
    const vsSource = this._vertexShaderSource
    const fsSource = this._fragmentShaderSource
    if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      log = gl.getShaderInfoLog(fragmentShader)
      console.error(`${consolePrefix}Fragment shader compile log: ${log}`)
      console.error(`${consolePrefix} Fragment shader source:\n${fsSource}`)
      errorMessage = `Fragment shader failed to compile.  Compile log: ${log}`
    } else if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      log = gl.getShaderInfoLog(vertexShader)
      console.error(`${consolePrefix}Vertex shader compile log: ${log}`)
      console.error(`${consolePrefix} Vertex shader source:\n${vsSource}`)
      errorMessage = `Vertex shader failed to compile.  Compile log: ${log}`
    } else {
      log = gl.getProgramInfoLog(program)
      console.error(`${consolePrefix}Shader program link log: ${log}`)
      // logTranslatedSource(vertexShader, "vertex");
      // logTranslatedSource(fragmentShader, "fragment");
      errorMessage = `Program failed to link.  Link log: ${log}`
    }
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    gl.deleteProgram(program)
    throw new Error(errorMessage)
  }

  getVertexAttributes({
    program,
    gl
  }: {
    program: WebGLProgram
    gl: ContextType
  }) {
    const numberOfVertexAttributes = gl.getProgramParameter(
      program,
      gl.ACTIVE_ATTRIBUTES
    ) as number

    const vertexAttributes: VertexAttributesType = {}
    for (let index = 0; index < numberOfVertexAttributes; index++) {
      const { name, type } = gl.getActiveAttrib(program, index)!
      vertexAttributes[name] = { location: index, name, type }
    }
    return vertexAttributes
  }

  getUniforms({ program, gl }: { program: WebGLProgram; gl: ContextType }) {
    const numberOfUniforms = gl.getProgramParameter(
      program,
      gl.ACTIVE_UNIFORMS
    ) as number

    const uniforms: { [key: string]: Uniform } = {}
    for (let index = 0; index < numberOfUniforms; index++) {
      const { name, type } = gl.getActiveUniform(program, index)!
      const location = gl.getUniformLocation(program, name)!
      uniforms[name] = new Uniform({
        gl,
        location,
        type
      })
    }

    return uniforms
  }

  createShader(type: number, source: string) {
    const shader = this._gl!.createShader(type)

    if (!shader) {
      throw new Error('Failed to create shader. ')
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
