import GeographicProjection from '../../Engine/Core/GeographicProjection'
import Ellipsoid from '../../Engine/Core/Ellipsoid'

export interface SceneOptions {
  canvas: HTMLCanvasElement
  isUseGPU: boolean
  ellipsoid?: Ellipsoid
  mapProjection?: GeographicProjection
}
