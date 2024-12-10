import { ComponentDatatype, PrimitiveType, SceneOptions } from '../../type'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import defaultValue from '../Core/DefaultValue'
import Ellipsoid from '../Core/Ellipsoid'
import GeographicProjection from '../Core/GeographicProjection'
import Context from '../Renderer/Context'
import Camera from './Camera'
import FrameState from './FrameState'
import Geometry from './Geometry'
import GeometryAttribute from './GeometryAttribute'
import Globe from './Globe'
import ScreenSpaceCameraController from './ScreenSpaceCameraController'

export default class Scene {
  canvas: HTMLCanvasElement
  isUseGPU: boolean
  globe: Globe

  private _context: Context
  private _frameState: FrameState
  private _ellipsoid: Ellipsoid

  camera: Camera
  private _mapProjection: GeographicProjection
  private _globeHeight: undefined | number
  private _screenSpaceCameraController: ScreenSpaceCameraController

  get screenSpaceCameraController() {
    return this._screenSpaceCameraController
  }
  get mapProjection() {
    return this._mapProjection
  }
  get ellipsoid() {
    return this._ellipsoid
  }
  get drawingBufferWidth() {
    return this._context.gl.drawingBufferWidth
  }

  get drawingBufferHeight() {
    return this._context.gl.drawingBufferHeight
  }
  get pixelRatio() {
    return this._frameState.pixelRatio
  }
  set pixelRatio(value: number) {
    this._frameState.pixelRatio = value
  }

  get pickPositionSupported() {
    return this._context.depthTexture
  }
  get globeHeight() {
    return this._globeHeight
  }
  get frameState() {
    return this._frameState
  }
  get mode() {
    return this._frameState.mode
  }

  constructor(options: SceneOptions) {
    this.canvas = options.canvas
    this.isUseGPU = options.isUseGPU

    this._context = new Context({
      canvas: this.canvas,
      isUseGPU: this.isUseGPU
    })

    this._frameState = new FrameState({
      context: this._context
    })
    this._ellipsoid = defaultValue<Ellipsoid>(
      options.ellipsoid,
      Ellipsoid.default
    )
    this._mapProjection = defaultValue<GeographicProjection>(
      options.mapProjection,
      new GeographicProjection(this._ellipsoid)
    )

    this.camera = new Camera(this)
    this.globe = new Globe(this._ellipsoid)

    this._screenSpaceCameraController = new ScreenSpaceCameraController(this)
  }

  public pickPositionWorldCoordinates(
    windowPosition: Cartesian2,
    result: Cartesian3 = new Cartesian3()
  ) {
    return result
  }

  draw() {
    const geometry = new Geometry({
      attributes: {
        position: new GeometryAttribute({
          componentsPerAttribute: 2,
          componentDatatype: ComponentDatatype.FLOAT,
          values: [0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5]
        }),
        color: new GeometryAttribute({
          values: [
            1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
            0.0, 0.0, 1.0
          ],
          componentsPerAttribute: 4,
          componentDatatype: ComponentDatatype.FLOAT
        })
      },
      indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
      primitiveType: PrimitiveType.TRIANGLES
    })

    const { uniformState } = this._context
    uniformState.updateCamera(this.camera)
    this._context.draw({
      context: this._context,
      geometry
    })
  }
}
