import { ComponentDatatype, GeometryAttributeOptions } from '../../type'

export default class GeometryAttribute {
  componentDatatype: number
  values: ArrayLike<number>
  componentsPerAttribute: number
  normalize: boolean

  constructor(options?: GeometryAttributeOptions) {
    const { componentsPerAttribute, componentDatatype, values, normalize } =
      options || {}
    this.componentDatatype = componentDatatype || ComponentDatatype.FLOAT
    this.values = values || []
    this.componentsPerAttribute = componentsPerAttribute || 1
    this.normalize = normalize || false
  }
}
