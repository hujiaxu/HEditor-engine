import { ContextType, UniformStateOptions } from '../../type'

export default class UniformState {
  gl: ContextType

  uniformMap: {
    [key: string]: number[]
  } = {}
  constructor({ gl }: UniformStateOptions) {
    this.gl = gl

    const u_drawingBufferHeight = gl.drawingBufferHeight
    const u_drawingBufferWidth = gl.drawingBufferWidth

    // this.uniformMap['u_drawingBufferHeight'] = [u_drawingBufferHeight]
    // this.uniformMap['u_drawingBufferWidth'] = [u_drawingBufferWidth]
    const u_aspect = u_drawingBufferWidth / u_drawingBufferHeight
    this.uniformMap['u_aspect'] = [u_aspect]
  }

  update(uniformState: UniformState) {
    this.gl = uniformState.gl
    this.uniformMap = uniformState.uniformMap
  }
}
