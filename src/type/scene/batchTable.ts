import { ComponentDatatype } from '../core/geometryAttributes'

export interface BatchTableAttribute {
  functionName: string
  componentDatatype: ComponentDatatype
  componentsPerAttribute: number
  normalize: boolean
}
