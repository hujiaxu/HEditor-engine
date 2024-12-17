import { ContextType, UniformStateOptions } from '../../type'
// import HeadingPitchRoll from '../Core/HeadingPitchRoll'
// import Matrix3 from '../Core/Matrix3'
import Matrix4 from '../Core/Matrix4'
import Camera from '../Scene/Camera'

export default class UniformState {
  gl: ContextType

  uniformMap: {
    [key: string]: number[]
  } = {}
  constructor({ gl }: UniformStateOptions) {
    this.gl = gl
  }

  update(uniformState: UniformState) {
    this.gl = uniformState.gl
    this.uniformMap = uniformState.uniformMap
  }

  updateCamera(camera: Camera) {
    const projectionMatrix = camera.frustum.projectionMatrix
    const viewMatrix = camera.viewMatrix

    // const rotation = Matrix4.fromRotation(
    //   Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(0.01, 0.01, 0.01))
    // )
    // Matrix4.multiply(viewMatrix, rotation, viewMatrix)
    this.uniformMap['u_projectionMatrix'] = Matrix4.toArray(projectionMatrix)
    this.uniformMap['u_viewMatrix'] = Matrix4.toArray(viewMatrix)
    this.uniformMap['u_modelMatrix'] = Matrix4.toArray(Matrix4.IDENTITY)
  }
}
