import { SceneMode } from '../../type'
import BoundingRectangle from '../Core/BoundingRectangle'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import Cartesian4 from '../Core/Cartesian4'
import { defined } from '../Core/Defined'
import Matrix4 from '../Core/Matrix4'
import OrthographicFrustum from '../Core/OrthographicFrustum'
import OrthographicOffCenterFrustum from '../Core/OrthographicOffCenterFrustum'
import PerspectiveFrustum from '../Core/PerspectiveFrustum'
import Camera from './Camera'
import FrameState from './FrameState'
import Scene from './Scene'

const worldToClip = (
  position: Cartesian3,
  eyeOffset: Cartesian3,
  camera: Camera,
  result?: Cartesian4
) => {
  const viewMatrix = camera.viewMatrix

  const positionEC = Matrix4.multiplyByVector(
    viewMatrix,
    Cartesian4.fromElements(position.x, position.y, position.z, 1.0)
  )

  const zEyeOffset = Cartesian3.multiplyComponents(
    eyeOffset,
    Cartesian3.normalize(positionEC, new Cartesian3())
  )
  positionEC.x += eyeOffset.x + zEyeOffset.x
  positionEC.y += eyeOffset.y + zEyeOffset.y
  positionEC.z += zEyeOffset.z

  return Matrix4.multiplyByVector(
    (camera.frustum as PerspectiveFrustum).projectionMatrix,
    positionEC,
    result
  )
}
export default class SceneTransforms {
  static computeActualEllipsoidPosition: (
    frameState: FrameState,
    position: Cartesian3,
    result?: Cartesian3
  ) => Cartesian3 | undefined
  static clipToGLWindowCoordinates: (
    viewport: BoundingRectangle,
    position: Cartesian4,
    result?: Cartesian2
  ) => Cartesian2
  static worldWithEyeOffsetToWindowCoordinates: (
    scene: Scene,
    position: Cartesian3,
    eyeOffset: Cartesian3,
    result?: Cartesian2
  ) => Cartesian2 | undefined
  static worldToWindowCoordinates: (
    scene: Scene,
    position: Cartesian3,
    result?: Cartesian2
  ) => Cartesian2 | undefined
}

SceneTransforms.computeActualEllipsoidPosition = function (
  frameState: FrameState,
  position: Cartesian3,
  result?: Cartesian3
) {
  const mode = frameState.mode

  if (mode === SceneMode.SCENE3D) {
    return Cartesian3.clone(position, result)
  }
}
SceneTransforms.clipToGLWindowCoordinates = function (
  viewport: BoundingRectangle,
  position: Cartesian4,
  result?: Cartesian2
) {
  Cartesian3.divideByScalar(position, position.w, position)

  const viewportTransform = Matrix4.computeViewportTransformation(
    viewport,
    0.0,
    1.0
  )
  const positionWC = Matrix4.multiplyByPoint(
    viewportTransform,
    new Cartesian3()
  )

  return Cartesian2.fromCartesian3(positionWC, result)
}
SceneTransforms.worldWithEyeOffsetToWindowCoordinates = function (
  scene: Scene,
  position: Cartesian3,
  eyeOffset: Cartesian3,
  result: Cartesian2 = new Cartesian2()
) {
  if (!defined(scene)) {
    throw new Error('scene is required')
  }

  if (!defined(position)) {
    throw new Error('position is required')
  }

  const frameState = scene.frameState
  const actualPosition = SceneTransforms.computeActualEllipsoidPosition(
    frameState,
    position
  )

  if (!defined(actualPosition)) {
    return undefined
  }

  const canvas = scene.canvas
  const viewport = new BoundingRectangle()

  viewport.x = 0
  viewport.y = 0
  viewport.width = canvas.clientWidth
  viewport.height = canvas.clientHeight

  const camera = scene.camera
  const cameraCentered = false

  if (frameState.mode !== SceneMode.SCENE2D || cameraCentered) {
    const positionCC = worldToClip(actualPosition, eyeOffset, camera)
    if (
      positionCC.z < 0 &&
      !(camera.frustum instanceof OrthographicFrustum) &&
      !(camera.frustum instanceof OrthographicOffCenterFrustum)
    ) {
      return undefined
    }

    result = SceneTransforms.clipToGLWindowCoordinates(
      viewport,
      positionCC,
      result
    )
  }

  return result
}
SceneTransforms.worldToWindowCoordinates = function (
  scene: Scene,
  position: Cartesian3,
  result?: Cartesian2
) {
  return SceneTransforms.worldWithEyeOffsetToWindowCoordinates(
    scene,
    position,
    Cartesian3.ZERO,
    result
  )
}
