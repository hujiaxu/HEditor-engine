import { ViewerOptions } from '../type'
import defaultValue from './Core/DefaultValue'
import Scene from './Scene/Scene'

export default class Viewer {
  public canvas: HTMLCanvasElement

  public scene: Scene
  public defaultRenderLoop: boolean

  constructor({
    container,
    canvasHeight,
    canvasWidth,
    useGPU = false,
    defaultRenderLoop
  }: ViewerOptions) {
    const element = document.getElementById(container)
    if (!element) {
      throw new Error(`can not find element with id ${container}`)
    }
    const canvas = document.createElement('canvas')
    element.appendChild(canvas)
    this.canvas = canvas

    canvas.height = canvasHeight || element.clientHeight
    canvas.width = canvasWidth || element.clientWidth

    canvas.oncontextmenu = () => {
      return false
    }
    canvas.onselectstart = () => {
      return false
    }

    this.scene = new Scene({
      canvas: this.canvas,
      isUseGPU: useGPU
    })
    this.defaultRenderLoop = defaultValue(defaultRenderLoop, true)

    this.draw()
  }

  draw() {
    if (this.defaultRenderLoop) {
      requestAnimationFrame(() => {
        this.draw()
      })
    }
    this.scene.draw()
  }
}
