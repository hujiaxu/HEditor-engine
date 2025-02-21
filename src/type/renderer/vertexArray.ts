import Geometry from '../../Engine/Core/Geometry'
import Context from '../../Engine/Renderer/Context'
import { Buffer } from '../../Engine'
import { ContextType } from './context'

export interface VertexArrayOptions {
  context: Context
  geometry?: Geometry
  attributes?: VAAttributes[]
  indexBuffer?: Buffer
}

export interface VertexArrayFromGeometryOptions {
  vertexArrayAttributes?: VAAttributes[]
  context: Context
  geometry: Geometry
  attributeLocations: { [key: string]: number }
  bufferUsage: number
  interleave: boolean
}

export interface VAAttributes {
  index: number
  enabled?: boolean
  vertexBuffer?: Buffer
  instanceDivisor?: number
  componentDatatype: number
  componentsPerAttribute?: number
  normalize: boolean
  offsetInBytes?: number
  strideInBytes?: number
  value?: number[]
  vertexAttrib?: (gl: ContextType) => void
  disableVertexAttribArray?: (gl: ContextType) => void
}
