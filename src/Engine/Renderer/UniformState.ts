import { ContextType, UniformStateOptions } from '../../type'
import Matrix4 from '../Core/Matrix4'
import Camera from '../Scene/Camera'

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

  updateCamera(camera: Camera) {
    const projectionMatrix = camera.frustum.projectionMatrix
    const viewMatrix = camera.viewMatrix

    this.uniformMap['u_projectionMatrix'] = Matrix4.toArray(projectionMatrix)
    this.uniformMap['u_viewMatrix'] = Matrix4.toArray(viewMatrix)
  }
}
