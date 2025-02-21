import { FrameStateOptions, SceneMode } from '../../type'
import GeographicProjection from '../Core/GeographicProjection'
import Context from '../Renderer/Context'
import Camera from './Camera'

export default class FrameState {
  context: Context
  pixelRatio: number
  mode: SceneMode
  camera: Camera | undefined
  public scene3DOnly: boolean = true
  public mapProjection: undefined | GeographicProjection
  public passes = {
    render: false,
    pick: false,
    pickVoxel: false,
    depth: false,
    postProcess: false,
    offscreen: false
  }
  public afterRender: (() => void)[] = []
  constructor({ context }: FrameStateOptions) {
    this.context = context

    this.camera = undefined

    this.pixelRatio = 1.0

    this.mode = SceneMode.SCENE3D
  }
}
