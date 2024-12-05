import { ContextType, UniformOptions, UniformType } from '../../type'

export default class Uniform {
  private _location: WebGLUniformLocation | undefined
  private _value: number[] = []
  private _type: UniformType = UniformType.FLOAT

  get location() {
    return this._location!
  }

  set location(location: WebGLUniformLocation) {
    this._location = location
  }

  get value() {
    return this._value
  }
  set value(value: number[]) {
    this._value = value
  }

  get type() {
    return this._type
  }
  set type(type: UniformType) {
    this._type = type
  }

  gl: ContextType

  /**
   * Constructs a new Uniform instance.
   *
   * @param {UniformOptions} options - The options for initializing the uniform.
   * @param {ContextType} options.gl - The WebGL context used for rendering.
   * @param {number} options.location - The location of the uniform in the shader program.
   * @param {UniformType} options.type - The data type of the uniform.
   */
  constructor({ gl, location, type }: UniformOptions) {
    this.gl = gl
    this._location = location
    this._type = type
  }

  set(value: number[]) {
    if (!value) return
    this.value = value
    switch (this._type) {
      case UniformType.FLOAT:
      case UniformType.INT:
        this.gl.uniform1f(this.location, this.value[0])
        break
      case UniformType.FLOAT_VEC2:
      case UniformType.INT_VEC2:
        this.gl.uniform2f(this.location, this.value[0], this.value[1])
        break
      case UniformType.FLOAT_VEC3:
      case UniformType.INT_VEC3:
        this.gl.uniform3f(
          this.location,
          this.value[0],
          this.value[1],
          this.value[2]
        )
        break
      case UniformType.FLOAT_VEC4:
      case UniformType.INT_VEC4:
        this.gl.uniform4f(
          this.location,
          this.value[0],
          this.value[1],
          this.value[2],
          this.value[3]
        )
        break
      case UniformType.FLOAT_MAT2:
        this.gl.uniformMatrix2fv(this.location, false, this.value)
        break
      case UniformType.FLOAT_MAT3:
        this.gl.uniformMatrix3fv(this.location, false, this.value)
        break
      case UniformType.FLOAT_MAT4:
        this.gl.uniformMatrix4fv(this.location, false, this.value)
        break
    }
  }
}
