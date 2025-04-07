import { ContextType } from './context'

export interface ShaderProgramOptions {
  vertexShaderSource: string
  fragmentShaderSource: string
  gl: ContextType

  vertexShaderText?: string
  fragmentShaderText?: string
  logShaderCompilation?: boolean
  debugShaders?: boolean
  attributeLocations?: { [key: string]: number }
}

export interface ShaderSourceCache {
  vertexShaderSource: string
  fragmentShaderSource: string
}

export type VertexAttributesType = Record<
  string,
  { location: number; name: string; type: number }
>
