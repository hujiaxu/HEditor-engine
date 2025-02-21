import { GeometryAttribute, Geometry, Matrix4, Primitive } from '../../Engine'

export interface GeometryInstanceOptions {
  modelMatrix?: Matrix4
  geometry: Geometry
  eastHemisphereGeometry?: Geometry
  westHemisphereGeometry?: Geometry
  id: string
  pickPrimitive: Primitive
  attributes?: {
    [key: string]: GeometryAttribute
  }
}

export enum InstanceGeometryType {
  GEOMETRY = 'geometry'
}
