import {
  VertexArrayOptions,
  ContextType,
  VertexArrayFromGeometryOptions,
  BufferUsage,
  ComponentDatatype,
  GeometryAttributeValuesType,
  VAAttributes
} from '../../type'
import Context from './Context'
import Buffer from './Buffer'
import Geometry from '../Core/Geometry'
import defaultValue from '../Core/DefaultValue'
import Defined from '../Core/Defined'
import GeometryAttributes from '../Core/GeometryAttributes'
import GeometryAttribute from '../Core/GeometryAttribute'
import HEditorMath from '../Core/Math'
import IndexDatatype from '../Core/IndexDatatype'
import { Check } from '..'
import DeveloperError from '../Core/DeveloperError'

export default class VertexArray {
  private _vao: WebGLVertexArrayObject | null
  private _numberOfVertices: number
  private _hasInstancedAttributes: boolean
  private _hasConstantAttributes: boolean
  private _context: Context
  private _gl: ContextType
  private _attributes: VAAttributes[]
  private _indexBuffer: Buffer | undefined

  get vao() {
    return this._vao
  }

  get numberOfVertexAttributes() {
    return this._attributes.length
  }

  get numberOfVertices() {
    return this._numberOfVertices
  }

  get hasInstancedAttributes() {
    return this._hasInstancedAttributes
  }

  get hasConstantAttributes() {
    return this._hasConstantAttributes
  }

  get attributes() {
    return this._attributes
  }

  get indexBuffer() {
    return this._indexBuffer
  }

  get context() {
    return this._context
  }

  get gl() {
    return this._gl
  }

  static fromGeometry: (options: VertexArrayFromGeometryOptions) => VertexArray

  constructor(options: VertexArrayOptions) {
    // this.context = context
    // this.geometry = geometry

    // const { gl, shaderProgram } = context

    // const { attributes, indices } = geometry
    // const numberOfVertexAttributes = gl!.getProgramParameter(
    //   shaderProgram!.program!,
    //   WebGL2RenderingContext.ACTIVE_ATTRIBUTES
    // ) as number
    // const vertexAttributes = this.getVertexAttributes({
    //   shaderProgram: shaderProgram!.program!,
    //   numberOfVertexAttributes,
    //   gl
    // })
    // this._vao = context.glCreateVertexArray!()
    // context.glBindVertexArray!(this._vao!)
    // for (const attributeName in vertexAttributes) {

    //   const { index, name } = vertexAttributes[attributeName]
    //   const { values, componentsPerAttribute, componentDatatype } =
    //     attributes[name]
    //   new Buffer({
    //     gl: this.context.gl!,
    //     data: new Float32Array(values),
    //     bufferTarget: BufferTargetType.ARRAY_BUFFER,
    //     bufferUsage: BufferUsageType.STATIC_DRAW
    //   })
    //   gl!.vertexAttribPointer(
    //     index,
    //     componentsPerAttribute,
    //     componentDatatype,
    //     false,
    //     0,
    //     0
    //   )
    //   gl!.enableVertexAttribArray(index)
    // }

    // if (indices) {
    //   const indexBuffer = new Buffer({
    //     data: indices,
    //     bufferTarget: BufferTargetType.ELEMENT_ARRAY_BUFFER,
    //     bufferUsage: BufferUsageType.STATIC_DRAW,
    //     // bufferType: this._gl!.UNSIGNED_SHORT,
    //     gl: this.context.gl!
    //   })

    //   gl!.bindBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer)

    //   this.indexBuffer = indexBuffer
    // }

    // context.glBindVertexArray!(null)

    // context.glBindVertexArray!(null)
    // >>includeStart('debug', pragmas.debug);
    Check.defined('options.context', options.context)
    Check.defined('options.attributes', options.attributes)
    // >>includeEnd('debug');

    this._context = options.context
    const context = options.context
    const gl = context.gl
    const attributes = options.attributes!
    const indexBuffer = options.indexBuffer

    let i
    const vaAttributes: VAAttributes[] = []
    let numberOfVertices = 1 // if every attribute is backed by a single value
    let hasInstancedAttributes = false
    let hasConstantAttributes = false

    let length = attributes.length
    for (i = 0; i < length; ++i) {
      this._addAttribute(vaAttributes, attributes[i], i, context)
    }

    length = vaAttributes.length
    for (i = 0; i < length; ++i) {
      const attribute = vaAttributes[i]

      if (Defined(attribute.vertexBuffer) && attribute.instanceDivisor === 0) {
        // This assumes that each vertex buffer in the vertex array has the same number of vertices.
        const bytes =
          attribute.strideInBytes ||
          attribute.componentsPerAttribute! *
            ComponentDatatype.getSizeInBytes(attribute.componentDatatype)
        numberOfVertices = attribute.vertexBuffer.sizeInBytes / bytes
        break
      }
    }

    for (i = 0; i < length; ++i) {
      if (vaAttributes[i].instanceDivisor! > 0) {
        hasInstancedAttributes = true
      }
      if (Defined(vaAttributes[i].value)) {
        hasConstantAttributes = true
      }
    }

    // >>includeStart('debug', pragmas.debug);
    // Verify all attribute names are unique
    const uniqueIndices: { [index: number]: boolean } = {}
    for (i = 0; i < length; ++i) {
      const index = vaAttributes[i].index
      if (uniqueIndices[index]) {
        throw new DeveloperError(
          `Index ${index} is used by more than one attribute.`
        )
      }
      uniqueIndices[index] = true
    }
    // >>includeEnd('debug');

    let vao: WebGLVertexArrayObject | null = null

    // Setup VAO if supported
    if (context.vertexArrayObject) {
      vao = context.glCreateVertexArray()
      context.glBindVertexArray(vao)
      this._bind(gl, vaAttributes, indexBuffer)
      context.glBindVertexArray(null)
    }

    this._numberOfVertices = numberOfVertices
    this._hasInstancedAttributes = hasInstancedAttributes
    this._hasConstantAttributes = hasConstantAttributes
    this._context = context
    this._gl = gl
    this._vao = vao
    this._attributes = vaAttributes
    this._indexBuffer = indexBuffer
  }

  private _bind(
    gl: ContextType,
    attributes: VAAttributes[],
    indexBuffer: Buffer | undefined
  ) {
    for (let i = 0; i < attributes.length; ++i) {
      const attribute = attributes[i]
      if (attribute.enabled) {
        attribute.vertexAttrib!(gl)
      }
    }
    if (Defined(indexBuffer)) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer)
    }
  }

  private _addAttribute(
    attributes: VAAttributes[],
    attribute: VAAttributes,
    index: number,
    context: Context
  ) {
    const hasVertexBuffer = Defined(attribute.vertexBuffer)
    const hasValue = Defined(attribute.value)
    const componentsPerAttribute = attribute.value
      ? attribute.value.length
      : attribute.componentsPerAttribute

    // >>includeStart('debug', pragmas.debug);
    if (!hasVertexBuffer && !hasValue) {
      throw new DeveloperError('attribute must have a vertexBuffer or a value.')
    }
    if (hasVertexBuffer && hasValue) {
      throw new DeveloperError(
        'attribute cannot have both a vertexBuffer and a value.  It must have either a vertexBuffer property defining per-vertex data or a value property defining data for all vertices.'
      )
    }
    if (
      componentsPerAttribute !== 1 &&
      componentsPerAttribute !== 2 &&
      componentsPerAttribute !== 3 &&
      componentsPerAttribute !== 4
    ) {
      if (hasValue) {
        throw new DeveloperError(
          'attribute.value.length must be in the range [1, 4].'
        )
      }

      throw new DeveloperError(
        'attribute.componentsPerAttribute must be in the range [1, 4].'
      )
    }
    if (
      Defined(attribute.componentDatatype) &&
      !ComponentDatatype.validate(attribute.componentDatatype)
    ) {
      throw new DeveloperError(
        'attribute must have a valid componentDatatype or not specify it.'
      )
    }
    if (Defined(attribute.strideInBytes) && attribute.strideInBytes > 255) {
      // WebGL limit.  Not in GL ES.
      throw new DeveloperError(
        'attribute must have a strideInBytes less than or equal to 255 or not specify it.'
      )
    }
    if (
      Defined(attribute.instanceDivisor) &&
      attribute.instanceDivisor > 0 &&
      !context.instancedArrays
    ) {
      throw new DeveloperError('instanced arrays is not supported')
    }
    if (Defined(attribute.instanceDivisor) && attribute.instanceDivisor < 0) {
      throw new DeveloperError(
        'attribute must have an instanceDivisor greater than or equal to zero'
      )
    }
    if (Defined(attribute.instanceDivisor) && hasValue) {
      throw new DeveloperError(
        'attribute cannot have have an instanceDivisor if it is not backed by a buffer'
      )
    }
    if (
      Defined(attribute.instanceDivisor) &&
      attribute.instanceDivisor > 0 &&
      attribute.index === 0
    ) {
      throw new DeveloperError(
        'attribute zero cannot have an instanceDivisor greater than 0'
      )
    }
    // >>includeEnd('debug');

    // Shallow copy the attribute; we do not want to copy the vertex buffer.
    const attr: VAAttributes = {
      index: defaultValue(attribute.index, index),
      enabled: defaultValue(attribute.enabled, true),
      vertexBuffer: attribute.vertexBuffer,
      value: hasValue ? attribute.value!.slice(0) : undefined,
      componentsPerAttribute: componentsPerAttribute,
      componentDatatype: defaultValue(
        attribute.componentDatatype,
        ComponentDatatype.FLOAT
      ),
      normalize: defaultValue(attribute.normalize, false),
      offsetInBytes: defaultValue(attribute.offsetInBytes, 0),
      strideInBytes: defaultValue(attribute.strideInBytes, 0),
      instanceDivisor: defaultValue(attribute.instanceDivisor, 0)
    }

    if (hasVertexBuffer) {
      // Common case: vertex buffer for per-vertex data
      attr.vertexAttrib = function (gl: ContextType) {
        const index = this.index
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer!.buffer)
        gl.vertexAttribPointer(
          index,
          this.componentsPerAttribute!,
          this.componentDatatype,
          this.normalize,
          this.strideInBytes!,
          this.offsetInBytes!
        )
        gl.enableVertexAttribArray(index)
        if (this.instanceDivisor! > 0) {
          context.glVertexAttribDivisor(index, this.instanceDivisor!)
          context._vertexAttribDivisors[index] = this.instanceDivisor!
          context._previousDrawInstanced = true
        }
      }

      attr.disableVertexAttribArray = function (gl: ContextType) {
        gl.disableVertexAttribArray(this.index)
        if (this.instanceDivisor! > 0) {
          context.glVertexAttribDivisor(index, 0)
        }
      }
    } else {
      // Less common case: value array for the same data for each vertex
      switch (attr.componentsPerAttribute) {
        case 1:
          attr.vertexAttrib = function (gl: ContextType) {
            gl.vertexAttrib1fv(this.index, this.value!)
          }
          break
        case 2:
          attr.vertexAttrib = function (gl: ContextType) {
            gl.vertexAttrib2fv(this.index, this.value!)
          }
          break
        case 3:
          attr.vertexAttrib = function (gl: ContextType) {
            gl.vertexAttrib3fv(this.index, this.value!)
          }
          break
        case 4:
          attr.vertexAttrib = function (gl: ContextType) {
            gl.vertexAttrib4fv(this.index, this.value!)
          }
          break
      }

      attr.disableVertexAttribArray = function (gl: ContextType) {
        gl.disableVertexAttribArray(this.index)
      }
    }

    attributes.push(attr)
  }

  public getVertexAttributes({
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

const computeNumberOfVertices = (attribute: GeometryAttribute) => {
  return attribute.values.length / attribute.componentsPerAttribute
}
const computeAttributeSizeInBytes = (attribute: GeometryAttribute) => {
  return (
    ComponentDatatype.getSizeInBytes(attribute.componentDatatype) *
    attribute.componentsPerAttribute
  )
}

interface View {
  pointer: GeometryAttributeValuesType
  index: number
  strideInComponentType: number
}
const interleaveAttributes = (attributes: GeometryAttributes) => {
  let j
  let name
  let attribute

  // Extract attribute names.
  const names: string[] = []

  for (name in attributes) {
    // Attribute needs to have per-vertex values; not a constant value for all vertices.
    if (Defined(attributes[name]) && Defined(attributes[name]!.values)) {
      names.push(name)

      if (attributes[name]?.componentDatatype === ComponentDatatype.DOUBLE) {
        attributes[name]!.componentDatatype = ComponentDatatype.FLOAT
        attributes[name]!.values = ComponentDatatype.createTypedArray(
          ComponentDatatype.FLOAT,
          attributes[name]!.values
        )
      }
    }
  }

  // Validation.  Compute number of vertices.
  let numberOfVertices
  const namesLength = names.length

  if (namesLength > 0) {
    numberOfVertices = computeNumberOfVertices(attributes[names[0]]!)

    for (j = 1; j < namesLength; ++j) {
      const currentNumberOfVertices = computeNumberOfVertices(
        attributes[names[j]]!
      )

      if (currentNumberOfVertices !== numberOfVertices) {
        throw new Error(
          `${
            'Each attribute list must have the same number of vertices.  ' +
            'Attribute '
          }${names[j]} has a different number of vertices ` +
            `(${currentNumberOfVertices.toString()})` +
            ` than attribute ${names[0]} (${numberOfVertices.toString()}).`
        )
      }
    }
  }

  // Sort attributes by the size of their components.  From left to right, a vertex stores floats, shorts, and then bytes.
  names.sort(function (left, right) {
    return (
      ComponentDatatype.getSizeInBytes(attributes[right]!.componentDatatype!) -
      ComponentDatatype.getSizeInBytes(attributes[left]!.componentDatatype!)
    )
  })

  // Compute sizes and strides.
  let vertexSizeInBytes = 0
  const offsetsInBytes: { [key: string]: number } = {}

  for (j = 0; j < namesLength; ++j) {
    name = names[j]
    attribute = attributes[name]

    offsetsInBytes[name] = vertexSizeInBytes
    vertexSizeInBytes += computeAttributeSizeInBytes(attribute!)
  }

  if (vertexSizeInBytes > 0) {
    // Pad each vertex to be a multiple of the largest component datatype so each
    // attribute can be addressed using typed arrays.
    const maxComponentSizeInBytes = ComponentDatatype.getSizeInBytes(
      attributes[names[0]]!.componentDatatype
    ) // Sorted large to small
    const remainder = vertexSizeInBytes % maxComponentSizeInBytes
    if (remainder !== 0) {
      vertexSizeInBytes += maxComponentSizeInBytes - remainder
    }

    // Total vertex buffer size in bytes, including per-vertex padding.
    const vertexBufferSizeInBytes = numberOfVertices! * vertexSizeInBytes

    // Create array for interleaved vertices.  Each attribute has a different view (pointer) into the array.
    const buffer = new ArrayBuffer(vertexBufferSizeInBytes)
    const views: { [key: string]: View } = {}

    for (j = 0; j < namesLength; ++j) {
      name = names[j]
      const sizeInBytes = ComponentDatatype.getSizeInBytes(
        attributes[name]!.componentDatatype
      )

      views[name] = {
        pointer: ComponentDatatype.createTypedArray(
          attributes[name]!.componentDatatype,
          buffer
        ),
        index: offsetsInBytes[name] / sizeInBytes, // Offset in ComponentType
        strideInComponentType: vertexSizeInBytes / sizeInBytes
      }
    }

    // Copy attributes into one interleaved array.
    // PERFORMANCE_IDEA:  Can we optimize these loops?
    for (j = 0; j < numberOfVertices!; ++j) {
      for (let n = 0; n < namesLength; ++n) {
        name = names[n]
        attribute = attributes[name]
        const values = attribute!.values
        const view = views[name]
        const pointer = view.pointer

        const numberOfComponents = attribute!.componentsPerAttribute
        for (let k = 0; k < numberOfComponents; ++k) {
          pointer[view.index + k] = values[j * numberOfComponents + k]
        }

        view.index += view.strideInComponentType
      }
    }

    return {
      buffer: buffer,
      offsetsInBytes: offsetsInBytes,
      vertexSizeInBytes: vertexSizeInBytes
    }
  }

  // No attributes to interleave.
  return undefined
}

VertexArray.fromGeometry = (options: VertexArrayFromGeometryOptions) => {
  const context = options.context
  const geometry = options.geometry
  const bufferUsage = defaultValue(
    options.bufferUsage,
    BufferUsage.DYNAMIC_DRAW
  )

  const attributeLocations = options.attributeLocations
  const interleave = defaultValue(options.interleave, false)
  const createdVAAttributes = options.vertexArrayAttributes

  let name
  let attribute
  let vertexBuffer
  const vaAttributes = Defined(createdVAAttributes) ? createdVAAttributes : []
  const attributes = geometry.attributes
  if (interleave) {
    // Use a single vertex buffer with interleaved vertices.
    const interleavedAttributes = interleaveAttributes(attributes)
    if (Defined(interleavedAttributes)) {
      vertexBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: interleavedAttributes.buffer,
        usage: bufferUsage
      })
      const offsetsInBytes = interleavedAttributes.offsetsInBytes
      const strideInBytes = interleavedAttributes.vertexSizeInBytes

      for (name in attributes) {
        if (Defined(attributes[name])) {
          attribute = attributes[name]!

          if (Defined(attribute!.values)) {
            // Common case: per-vertex attributes
            vaAttributes.push({
              index: attributeLocations[name],
              vertexBuffer: vertexBuffer,
              componentDatatype: attribute.componentDatatype,
              componentsPerAttribute: attribute!.componentsPerAttribute,
              normalize: attribute.normalize,
              offsetInBytes: offsetsInBytes[name],
              strideInBytes: strideInBytes
            })
          } else {
            // Constant attribute for all vertices
            vaAttributes.push({
              index: attributeLocations[name],
              // value: attribute.value,
              value: [],
              componentDatatype: attribute.componentDatatype,
              normalize: attribute.normalize
            })
          }
        }
      }
    }
  } else {
    // One vertex buffer per attribute.
    for (name in attributes) {
      if (Defined(attributes[name])) {
        attribute = attributes[name]!

        let componentDatatype = attribute.componentDatatype
        if (componentDatatype === ComponentDatatype.DOUBLE) {
          componentDatatype = ComponentDatatype.FLOAT
        }
        vertexBuffer = undefined

        if (Defined(attribute.values)) {
          vertexBuffer = Buffer.createVertexBuffer({
            context: context,
            typedArray: ComponentDatatype.createTypedArray(
              componentDatatype,
              attribute.values
            ),
            usage: bufferUsage
          })
        }

        vaAttributes.push({
          index: attributeLocations[name],
          vertexBuffer: vertexBuffer,
          // value: attribute.value,
          value: [],
          componentDatatype: componentDatatype,
          componentsPerAttribute: attribute.componentsPerAttribute,
          normalize: attribute.normalize
        })
      }
    }
  }

  let indexBuffer
  const indices = geometry.indices
  if (Defined(indices)) {
    if (
      Geometry.computeNumberOfVertices(geometry) >=
        HEditorMath.SIXTY_FOUR_KILOBYTES &&
      context.elementIndexUint
    ) {
      indexBuffer = Buffer.createIndexBuffer({
        context: context,
        typedArray: new Uint32Array(indices),
        usage: bufferUsage,
        indexDatatype: IndexDatatype.UNSIGNED_INT
      })
    }
  }

  return new VertexArray({
    context: context,
    attributes: vaAttributes,
    indexBuffer: indexBuffer
  })
}
