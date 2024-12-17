import { ComponentDatatype, PrimitiveType, SceneOptions } from '../../type'
import Cartesian2 from '../Core/Cartesian2'
import Cartesian3 from '../Core/Cartesian3'
import defaultValue from '../Core/DefaultValue'
import Ellipsoid from '../Core/Ellipsoid'
import GeographicProjection from '../Core/GeographicProjection'
import Matrix4 from '../Core/Matrix4'
// import HeadingPitchRoll from '../Core/HeadingPitchRoll'
// import Matrix3 from '../Core/Matrix3'
// import Matrix4 from '../Core/Matrix4'
import Context from '../Renderer/Context'
import Camera from './Camera'
import FrameState from './FrameState'
import Geometry from '../Core/Geometry'
import GeometryAttribute from '../Core/GeometryAttribute'
import Globe from './Globe'
import ScreenSpaceCameraController from './ScreenSpaceCameraController'
import ScreenSpaceCameraControllerForEditor from './ScreenSpaceCameraControllerForEditor'

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
  private _screenSpaceCameraControllerForEditor: ScreenSpaceCameraControllerForEditor

  get screenSpaceCameraController() {
    return this._screenSpaceCameraController
  }
  get screenSpaceCameraControllerForEditor() {
    return this._screenSpaceCameraControllerForEditor
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

    // const scale = Matrix4.fromScale(new Cartesian3(0.5, 0.5, 0.5))
    // const scratchMatrix = Matrix4.multiply(scale, this.camera.viewMatrix)
    // const rotation = Matrix4.fromRotation(
    //   Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(0, 0.0, 0.0))
    // )
    // Matrix4.multiply(scratchMatrix, rotation, scratchMatrix)
    // const translation = Matrix4.fromTranslation(new Cartesian3(0.3, 0.3, 0.0))
    // Matrix4.multiply(translation, scratchMatrix, this.camera.viewMatrix)
    // console.log(this.camera.viewMatrix.values, 'this.camera.viewMatrix')
    this._screenSpaceCameraController = new ScreenSpaceCameraController(this)
    this._screenSpaceCameraControllerForEditor =
      new ScreenSpaceCameraControllerForEditor(this)
  }

  public pickPositionWorldCoordinates(
    windowPosition: Cartesian2,
    result: Cartesian3 = new Cartesian3()
  ) {
    return result
  }

  draw() {
    this._screenSpaceCameraControllerForEditor.update()
    const geometry = new Geometry({
      attributes: {
        position: new GeometryAttribute({
          componentsPerAttribute: 3,
          componentDatatype: ComponentDatatype.FLOAT,
          values: [
            // Front face
            // v1
            -0.5, -0.5, 0.5,
            // v2
            0.5, -0.5, 0.5,
            // v3
            0.5, 0.5, 0.5,
            // v4
            -0.5, 0.5, 0.5,

            // Back face
            // v5
            -0.5, -0.5, -0.5,
            // v6
            0.5, -0.5, -0.5,
            // v7
            0.5, 0.5, -0.5,
            // v8
            -0.5, 0.5, -0.5,

            // Left face
            -0.5, -0.5, -0.5,
            // v9
            -0.5, -0.5, 0.5,
            // v10
            -0.5, 0.5, 0.5,
            // v11
            -0.5, 0.5, -0.5,

            // Right face
            // v12
            0.5, -0.5, -0.5,
            // v13
            0.5, -0.5, 0.5,
            // v14
            0.5, 0.5, 0.5,
            // v15
            0.5, 0.5, -0.5,

            // Top face
            // v16
            -0.5, 0.5, -0.5,
            // v17
            0.5, 0.5, -0.5,
            // v18
            0.5, 0.5, 0.5,
            // v19
            -0.5, 0.5, 0.5,

            // Bottom face
            // v20
            -0.5, -0.5, -0.5,
            // v21
            0.5, -0.5, -0.5,
            // v22
            0.5, -0.5, 0.5,
            // v23
            -0.5, -0.5, 0.5
          ]
        }),
        color: new GeometryAttribute({
          values: [
            1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,

            1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,

            1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,

            1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,

            1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,

            1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0
          ],
          componentsPerAttribute: 4,
          componentDatatype: ComponentDatatype.FLOAT
        })
      },
      indices: new Uint16Array([
        // Front face
        4, 5, 6, 4, 6, 7,

        // Back face
        0, 3, 2, 0, 2, 1,

        // Left face
        0, 7, 3, 0, 4, 7,

        // Right face
        1, 2, 6, 1, 6, 5,

        // Top face
        3, 2, 6, 3, 6, 7,

        // Bottom face
        0, 1, 5, 0, 5, 4
      ]),
      primitiveType: PrimitiveType.TRIANGLES,
      modelMatrix: Matrix4.IDENTITY
    })
    this.camera.update(this.mode)
    const { uniformState } = this._context
    uniformState.updateCamera(this.camera)
    this._context.draw({
      context: this._context,
      geometry
    })
  }
}
