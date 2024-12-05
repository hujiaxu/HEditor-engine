import { ViewerOptions } from '../type'
import Scene from './Scene/Scene'

export default class Viewer {
  canvas: HTMLCanvasElement

  scene: Scene

  constructor({
    container,
    canvasHeight,
    canvasWidth,
    useGPU = false
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
  }

  draw() {
    this.scene.draw()
  }
}
