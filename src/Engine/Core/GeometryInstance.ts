import { GeometryInstanceOptions } from '../../type'
import defaultValue from './DefaultValue'
import Geometry from './Geometry'
import GeometryAttribute from './GeometryAttribute'
import Matrix4 from './Matrix4'

export default class GeometryInstance {
  geometry: Geometry
  id: string
  modelMatrix: Matrix4
  attributes: { [key: string]: GeometryAttribute } | undefined = undefined
  constructor(options: GeometryInstanceOptions) {
    this.geometry = options.geometry
    this.id = options.id
    this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY)
    this.attributes = options.attributes
  }
}
