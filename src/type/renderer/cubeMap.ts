import { Context, Sampler } from '../../Engine'

export enum CubeFaceNames {
  POSITIVEX = 'positiveX',
  NEGATIVEX = 'negativeX',
  POSITIVEY = 'positiveY',
  NEGATIVEY = 'negativeY',
  POSITIVEZ = 'positiveZ',
  NEGATIVEZ = 'negativeZ'
}
export type CubeMapSourceType =
  | ImageData
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
export interface CubeMapSource {
  [CubeFaceNames.POSITIVEX]: CubeMapSourceType
  [CubeFaceNames.NEGATIVEX]: CubeMapSourceType
  [CubeFaceNames.POSITIVEY]: CubeMapSourceType
  [CubeFaceNames.NEGATIVEY]: CubeMapSourceType
  [CubeFaceNames.POSITIVEZ]: CubeMapSourceType
  [CubeFaceNames.NEGATIVEZ]: CubeMapSourceType
}
export interface CubeMapOptions {
  context: Context
  source: CubeMapSource
  pixelFormat?: number
  pixelDatatype?: number
  flipY?: boolean
  skipColorSpaceConversion?: boolean
  sampler: Sampler
  width?: number
  height?: number
  preMultiplyAlpha?: boolean
}
