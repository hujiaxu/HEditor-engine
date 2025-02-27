import { AppearanceOptions } from '../../type'
import defaultValue from '../Core/DefaultValue'
import Defined from '../Core/Defined'
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

  isTranslucent() {
    return (
      (Defined(this.material) && this.material.isTranslucent()) ||
      (!Defined(this.material) && this.translucent)
    )
  }
}
