export default class UniformState {
  gl: WebGLRenderingContext

  uniformMap: {
    [key: string]: WebGLUniformLocation
  } = {}
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
  }
}
