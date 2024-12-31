import { FrameStateOptions, SceneMode } from '../../type'
import Context from '../Renderer/Context'

export default class FrameState {
  context: Context
  pixelRatio: number
  mode: SceneMode
  public scene3DOnly: boolean = true
  public passes = {
    render: false,
    pick: false,
    pickVoxel: false,
    depth: false,
    postProcess: false,
    offscreen: false
  }
  constructor({ context }: FrameStateOptions) {
    this.context = context

    this.pixelRatio = 1.0

    this.mode = SceneMode.SCENE3D
  }
}
