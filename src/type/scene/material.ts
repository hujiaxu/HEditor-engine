import { Cartesian2, Cartesian3, Cartesian4, Color } from '../../Engine'

export interface MaterialOptions {
  strict?: boolean
  translucent?: boolean
  minificationFilter?: number
  magnificationFilter?: number
  fabric?: Fabric
  count?: number
}

export interface Uniforms {
  [key: string]:
    | string
    | number
    | boolean
    | Color
    | Cartesian2
    | Cartesian3
    | Cartesian4
    | number[]
    | object
}

export interface FabricComponents {
  diffuse?: string
  specular?: string
  shininess?: string | number
  normal?: string
  emission?: string
  alpha?: number
}

export interface FabricMaterials {
  [key: string]: Fabric
}

export interface Fabric {
  uniforms?: Uniforms
  materials?: FabricMaterials
  type?: string
  source?: string
  components?: FabricComponents
}

export type TranslucentType = (() => void) | boolean
