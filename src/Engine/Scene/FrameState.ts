import { FrameStateOptions } from '../../type'
import Context from '../Renderer/Context'

export default class FrameState {
  context: Context
  constructor({ context }: FrameStateOptions) {
    this.context = context
  }
}
