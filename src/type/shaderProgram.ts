import { ContextType } from './context'

export interface ShaderProgramOptions {
  vertexShaderSource: string
  fragmentShaderSource: string
  gl: ContextType
}
