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

  constructor({ gl }: UniformOptions) {
    this.gl = gl
  }

  set() {
    switch (this._type) {
      case UniformType.FLOAT:
        this.gl.uniform1f(this.location, this.value[0])
        break
      case UniformType.FLOAT_VEC2:
        this.gl.uniform2f(this.location, this.value[0], this.value[1])
        break
      case UniformType.FLOAT_VEC3:
        this.gl.uniform3f(
          this.location,
          this.value[0],
          this.value[1],
          this.value[2]
        )
        break
      case UniformType.FLOAT_VEC4:
        this.gl.uniform4f(
          this.location,
          this.value[0],
          this.value[1],
          this.value[2],
          this.value[3]
        )
        break
    }
  }
}
