import { AppearanceOptions } from '../../type'
import clone from '../Core/Clone'
import defaultValue from '../Core/DefaultValue'
import Defined from '../Core/Defined'
import BlendingState from './BlendingState'
import Material from './Material'

export default class Appearance {
  public pixelSize: number | undefined
  public material: Material
  public translucent: boolean

  private _vertexShaderSource: string | undefined
  private _fragmentShaderSource: string | undefined
  private _renderState: object | undefined
  private _closed: boolean

  public get closed() {
    return this._closed
  }
  public get vertexShaderSource() {
    return this._vertexShaderSource
  }
  public get fragmentShaderSource() {
    return this._fragmentShaderSource
  }
  public get renderState() {
    return this._renderState
  }
  constructor(options: AppearanceOptions) {
    this.material = options.material

    /**
     * When <code>true</code>, the geometry is expected to appear translucent.
     *
     * @type {boolean}
     *
     * @default true
     */
    this.translucent = defaultValue(options.translucent, true)

    this._vertexShaderSource = options.vertexShaderSource
    this._fragmentShaderSource = options.fragmentShaderSource
    this._renderState = options.renderState
    this._closed = defaultValue(options.closed, false)
  }

  public isTranslucent() {
    return (
      (Defined(this.material) && this.material.isTranslucent()) ||
      (!Defined(this.material) && this.translucent)
    )
  }

  /**
   * Creates a render state.  This is not the final render state instance; instead,
   * it can contain a subset of render state properties identical to the render state
   * created in the context.
   *
   * @returns {object} The render state.
   */
  public getRenderState() {
    const translucent = this.isTranslucent()
    const rs = clone(this.renderState!, false)
    if (translucent) {
      rs.depthMask = false
      rs.blending = BlendingState.ALPHA_BLEND
    } else {
      rs.depthMask = true
    }
    return rs
  }
}
