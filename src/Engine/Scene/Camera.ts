import Cartesian3 from '../Core/Cartesian3'
import HEditorMath from '../Core/Math'
import PerspectiveFrustum from './PerspectiveFrustum'
import Scene from './Scene'

export default class Camera {
  private _position: Cartesian3 = new Cartesian3()
  private _rotation: Cartesian3 = new Cartesian3()
  private _direction: Cartesian3 = new Cartesian3(0, 0, 1)
  private _up: Cartesian3 = new Cartesian3(0, 1, 0)
  private _right: Cartesian3 = new Cartesian3(1, 0, 0)

  scene: Scene
  perspectiveFrustum: PerspectiveFrustum

  constructor(scene: Scene) {
    this.scene = scene

    const aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight
    const fov = HEditorMath.toRadians(45)
    const near = 0.1
    const far = 1000
    this.perspectiveFrustum = new PerspectiveFrustum({
      fov,
      aspect: aspectRatio,
      near,
      far
    })
  }
}
