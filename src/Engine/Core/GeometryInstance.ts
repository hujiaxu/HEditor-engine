import { GeometryInstanceOptions } from '../../type'
import defaultValue from '../Core/DefaultValue'
import Geometry from '../Core/Geometry'
import GeometryAttribute from './GeometryAttribute'
import Matrix4 from '../Core/Matrix4'
import Primitive from '../Scene/Primitive'

export default class GeometryInstance {
  geometry: Geometry
  id: string
  modelMatrix: Matrix4
  attributes: { [key: string]: GeometryAttribute } | undefined = undefined
  pickPrimitive: Primitive
  constructor(options: GeometryInstanceOptions) {
    this.geometry = options.geometry
    this.id = options.id
    this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY)
    this.attributes = options.attributes
    this.pickPrimitive = options.pickPrimitive || undefined
  }
}
