import { ComponentDatatype, GeometryAttributeOptions } from '../../type'

export default class GeometryAttribute {
  componentDatatype: ComponentDatatype
  values: number[]
  componentsPerAttribute: number
  normalize: boolean

  constructor({
    componentsPerAttribute,
    componentDatatype,
    values,
    normalize
  }: GeometryAttributeOptions) {
    this.componentDatatype = componentDatatype
    this.values = values
    this.componentsPerAttribute = componentsPerAttribute
    this.normalize = normalize || false
  }
}
