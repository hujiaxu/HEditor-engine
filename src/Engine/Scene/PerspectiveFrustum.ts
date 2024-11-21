import { PerspectiveFrustumOptions } from '../../type'
import Matrix4 from '../Core/Matrix4'

export default class PerspectiveFrustum {
  fov: number
  aspect: number
  near: number
  far: number

  constructor({ fov, aspect, near, far }: PerspectiveFrustumOptions) {
    this.fov = fov
    this.aspect = aspect
    this.near = near
    this.far = far

    const matrix4 = Matrix4.toArray()
    console.log('matrix4: ', matrix4)
  }
}
