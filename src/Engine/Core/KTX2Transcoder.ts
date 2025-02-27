import Check from './Check'
import CompressedTextureBuffer from './CompressedTextureBuffer'
import Defined from './Defined'
import RuntimeError from './RuntimeError'
import TaskProcessor from './TaskProcessor'

export default class KTX2Transcoder {
  static _transcodeTaskProcessor: TaskProcessor
  static _readyPromise: Promise<TaskProcessor> | undefined
  static transcode: (
    ktx2Buffer: ArrayBuffer,
    supportedTargetFormats: any
  ) => Promise<any> | undefined
}

KTX2Transcoder._transcodeTaskProcessor = new TaskProcessor(
  'transcodeKTX2',
  Number.POSITIVE_INFINITY // KTX2 transcoding is used in place of Resource.fetchImage, so it can't reject as "just soooo busy right now"
)

KTX2Transcoder._readyPromise = undefined

function makeReadyPromise() {
  const readyPromise = KTX2Transcoder._transcodeTaskProcessor
    .initWebAssemblyModule({
      wasmBinaryFile: 'ThirdParty/basis_transcoder.wasm'
    })
    .then(function (result) {
      if (result) {
        return KTX2Transcoder._transcodeTaskProcessor
      }

      throw new RuntimeError('KTX2 transcoder could not be initialized.')
    })
  KTX2Transcoder._readyPromise = readyPromise
}
KTX2Transcoder.transcode = (
  ktx2Buffer: ArrayBuffer,
  supportedTargetFormats: any
) => {
  // >>includeStart('debug', pragmas.debug);
  Check.defined('supportedTargetFormats', supportedTargetFormats)
  // >>includeEnd('debug');

  if (!Defined(KTX2Transcoder._readyPromise)) {
    makeReadyPromise()
  }

  return KTX2Transcoder._readyPromise
    ?.then(function (taskProcessor) {
      let bufferView: Uint8Array
      if (ktx2Buffer instanceof ArrayBuffer) {
        bufferView = new Uint8Array(ktx2Buffer)
      }
      const parameters = {
        supportedTargetFormats: supportedTargetFormats,
        ktx2Buffer: bufferView!
      }
      return taskProcessor.scheduleTask(parameters, [bufferView!.buffer])
    })
    .then(function (result) {
      const levelsLength = result.length
      const faceKeys = Object.keys(result[0])

      for (let i = 0; i < levelsLength; i++) {
        const faces = result[i]

        for (let j = 0; j < faceKeys.length; j++) {
          const face = faces[faceKeys[j]]
          faces[faceKeys[j]] = new CompressedTextureBuffer(
            face.internalFormat,
            face.datatype,
            face.width,
            face.height,
            face.levelBuffer
          )
        }

        // Cleaning up parsed result if it's a single image
        if (faceKeys.length === 1) {
          for (let i = 0; i < levelsLength; ++i) {
            result[i] = result[i][faceKeys[0]]
          }

          if (levelsLength === 1) {
            result = result[0]
          }
        }
        return result
      }
    })
    .catch(function (error) {
      throw error
    })
}
