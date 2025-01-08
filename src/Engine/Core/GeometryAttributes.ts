import { GeometryAttributesOptions } from '../../type'
import GeometryAttribute from './GeometryAttribute'

export default class GeometryAttributes {
  position: GeometryAttribute | undefined
  normal: GeometryAttribute | undefined
  st: GeometryAttribute | undefined
  binormal: GeometryAttribute | undefined
  tangent: GeometryAttribute | undefined
  bitangent: GeometryAttribute | undefined
  color: GeometryAttribute | undefined
  batchId: GeometryAttribute | undefined

  constructor(options?: GeometryAttributesOptions) {
    const { position, normal, st, binormal, tangent, color, bitangent, batchId } = options || {}

    this.position = position
    this.normal = normal
    this.st = st
    this.binormal = binormal
    this.tangent = tangent
    this.color = color

    this.bitangent = bitangent
    this.batchId = batchId
  }
}
