import { ComponentDatatype, PrimitiveType, SceneOptions } from '../../type'
import Context from '../Renderer/Context'
import Geometry from './Geometry'
import GeometryAttribute from './GeometryAttribute'

export default class Scene {
  canvas: HTMLCanvasElement
  isUseGPU: boolean

  context: Context

  get drawingBufferWidth() {
    return this.context.gl.drawingBufferWidth
  }

  get drawingBufferHeight() {
    return this.context.gl.drawingBufferHeight
  }

  constructor(options: SceneOptions) {
    this.canvas = options.canvas
    this.isUseGPU = options.isUseGPU

    this.context = new Context({
      canvas: this.canvas,
      isUseGPU: this.isUseGPU
    })
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
    this.context.draw({
      context: this.context,
      geometry
    })
  }
}
