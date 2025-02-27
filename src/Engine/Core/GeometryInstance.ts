import { GeometryInstanceOptions } from '../../type'
import defaultValue from '../Core/DefaultValue'
import Geometry from '../Core/Geometry'
import GeometryAttribute from './GeometryAttribute'
import Matrix4 from '../Core/Matrix4'
import Primitive from '../Scene/Primitive'
import { createGuid } from '../../utils'

export default class GeometryInstance {
  geometry: Geometry
  eastHemisphereGeometry: Geometry | undefined
  westHemisphereGeometry: Geometry | undefined
  id: string
  modelMatrix: Matrix4
  attributes: { [key: string]: GeometryAttribute } | undefined = undefined
  pickPrimitive: Primitive | undefined
  constructor(options: GeometryInstanceOptions) {
    this.geometry = options.geometry
    this.id = options.id || createGuid()
    this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY)
    this.attributes = options.attributes
    this.pickPrimitive = options.pickPrimitive || undefined
    this.eastHemisphereGeometry = options.eastHemisphereGeometry
    this.westHemisphereGeometry = options.westHemisphereGeometry
  }
}
