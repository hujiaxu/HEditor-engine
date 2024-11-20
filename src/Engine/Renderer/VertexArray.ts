import {
  VertexArrayOptions,
  BufferTargetType,
  BufferUsageType,
  ContextType
} from '../../type'
import Context from './Context'
import Buffer from './Buffer'
import Geometry from '../Scene/Geometry'

export default class VertexArray {
  context: Context
  geometry: Geometry

  indexBuffer: Buffer | undefined

  _vao: WebGLVertexArrayObject | null

  get vao() {
    return this._vao
  }

  // va: []

  constructor({ context, geometry }: VertexArrayOptions) {
    this.context = context
    this.geometry = geometry

    const { gl, shaderProgram } = context

    const { attributes, indices } = geometry
    const numberOfVertexAttributes = gl!.getProgramParameter(
      shaderProgram!.program!,
      WebGL2RenderingContext.ACTIVE_ATTRIBUTES
    ) as number
    const vertexAttributes = this.getVertexAttributes({
      shaderProgram: shaderProgram!.program!,
      numberOfVertexAttributes,
      gl
    })

    this._vao = context.glCreateVertexArray!()
    context.glBindVertexArray!(this._vao!)
    for (const attributeName in vertexAttributes) {
      const { index, name } = vertexAttributes[attributeName]
      const { values, componentsPerAttribute, componentDatatype } =
        attributes[name]
      new Buffer({
        gl: this.context.gl!,
        data: new Float32Array(values),
        bufferTarget: BufferTargetType.ARRAY_BUFFER,
        bufferUsage: BufferUsageType.STATIC_DRAW
      })
      gl!.vertexAttribPointer(
        index,
        componentsPerAttribute,
        componentDatatype,
        false,
        0,
        0
      )
      gl!.enableVertexAttribArray(index)
    }

    // this.va = va

    if (indices) {
      const indexBuffer = new Buffer({
        data: indices,
        bufferTarget: BufferTargetType.ELEMENT_ARRAY_BUFFER,
        bufferUsage: BufferUsageType.STATIC_DRAW,
        // bufferType: this._gl!.UNSIGNED_SHORT,
        gl: this.context.gl!
      })

      gl!.bindBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer)

      this.indexBuffer = indexBuffer
    }

    context.glBindVertexArray!(null)
  }

  getVertexAttributes({
    gl,
    shaderProgram,
    numberOfVertexAttributes
  }: {
    gl: ContextType | undefined
    shaderProgram: WebGLProgram | undefined
    numberOfVertexAttributes: number
  }) {
    const attributes: {
      [key: string]: {
        name: string
        type: number
        index: number
      }
    } = {}

    for (let i = 0; i < numberOfVertexAttributes; i++) {
      const attribute = gl!.getActiveAttrib(shaderProgram!, i)
      const location = gl!.getAttribLocation(shaderProgram!, attribute!.name)

      attributes[attribute!.name] = {
        index: location,
        type: attribute!.type,
        name: attribute!.name.split('_')[1]
      }
    }

    return attributes
  }
}
