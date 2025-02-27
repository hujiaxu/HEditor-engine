import { InitWebAssemblyOptions } from '../../type'
import Defined from './Defined'
import * as Uri from 'urijs'
import isCrossOriginUrl from './isCrossOriginUrl'
import buildModuleUrl from './buildModuleUrl'
import Event from './Event'
import RuntimeError from './RuntimeError'
import FeatureDetection from './FeatureDetection'
import Resource from './Resource'
import DeveloperError from './DeveloperError'
// import defaultValue from "./DefaultValue";

const CESIUM_WORKERS = ''

function canTransferArrayBuffer() {
  if (!Defined(TaskProcessor._canTransferArrayBuffer)) {
    const worker = createWorker('transferTypedArrayTest')
    // worker.postMessage = defaultValue(
    //   worker.webkitPostMessage,
    //   worker.postMessage,
    // );

    const value = 99
    const array = new Int8Array([value])

    try {
      // postMessage might fail with a DataCloneError
      // if transferring array buffers is not supported.
      worker.postMessage(
        {
          array: array
        },
        [array.buffer]
      )
    } catch (e) {
      TaskProcessor._canTransferArrayBuffer = false
      return TaskProcessor._canTransferArrayBuffer
    }

    TaskProcessor._canTransferArrayBuffer = new Promise((resolve) => {
      worker.onmessage = function (event) {
        const array = event.data.array

        // some versions of Firefox silently fail to transfer typed arrays.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=841904
        // Check to make sure the value round-trips successfully.
        const result = Defined(array) && array[0] === value
        resolve(result)

        worker.terminate()

        TaskProcessor._canTransferArrayBuffer = result
      }
    })
  }

  return TaskProcessor._canTransferArrayBuffer
}
const taskCompletedEvent = new Event()

function urlFromScript(script: string) {
  let blob
  try {
    blob = new Blob([script], {
      type: 'application/javascript'
    })
  } catch (e) {
    const BlobBuilder =
      // @ts-expect-error global
      window.BlobBuilder ||
      // @ts-expect-error global
      window.WebKitBlobBuilder ||
      // @ts-expect-error global
      window.MozBlobBuilder ||
      // @ts-expect-error global
      window.MSBlobBuilder
    const blobBuilder = new BlobBuilder()
    blobBuilder.append(script)
    blob = blobBuilder.getBlob('application/javascript')
  }

  const URL = window.URL || window.webkitURL
  return URL.createObjectURL(blob)
}
function createWorker(url: string) {
  const uri = new Uri(url)
  const isUri = uri.scheme().length !== 0 && uri.fragment().length === 0
  const moduleID = url.replace(/\.js$/, '')

  const options: WorkerOptions = {}
  let workerPath
  let crossOriginUrl

  // If we are provided a fully resolved URL, check it is cross-origin
  // Or if provided a module ID, check the full absolute URL instead.
  if (isCrossOriginUrl(url)) {
    crossOriginUrl = url
  } else if (!isUri) {
    const moduleAbsoluteUrl = buildModuleUrl(
      `${TaskProcessor._workerModulePrefix}/${moduleID}.js`
    )

    if (isCrossOriginUrl(moduleAbsoluteUrl)) {
      crossOriginUrl = moduleAbsoluteUrl
    }
  }

  if (crossOriginUrl) {
    // To load cross-origin, create a shim worker from a blob URL
    const script = `import "${crossOriginUrl}";`
    workerPath = urlFromScript(script)
    options.type = 'module'
    return new Worker(workerPath, options)
  }

  /* global CESIUM_WORKERS */
  if (!isUri && typeof CESIUM_WORKERS !== 'undefined') {
    // If the workers are embedded, create a shim worker from the embedded script data
    const script = `
      importScripts("${urlFromScript(CESIUM_WORKERS)}");
      CesiumWorkers["${moduleID}"]();
    `
    workerPath = urlFromScript(script)
    return new Worker(workerPath, options)
  }

  workerPath = url

  if (!isUri) {
    workerPath = buildModuleUrl(
      `${TaskProcessor._workerModulePrefix + moduleID}.js`
    )
  }

  if (!FeatureDetection.supportsEsmWebWorkers()) {
    throw new RuntimeError(
      'This browser is not supported. Please update your browser to continue.'
    )
  }
  options.type = 'module'

  return new Worker(workerPath, options)
}

async function getWebAssemblyLoaderConfig(
  processor: TaskProcessor,
  wasmOptions: InitWebAssemblyOptions
) {
  const config = {
    modulePath: undefined,
    wasmBinaryFile: undefined,
    wasmBinary: undefined
  }
  // Web assembly not supported, use fallback js module if provided
  if (!FeatureDetection.supportsWebAssembly()) {
    if (!Defined(wasmOptions.fallbackModulePath)) {
      throw new RuntimeError(
        `This browser does not support Web Assembly, and no backup module was provided for ${processor.workerPath}`
      )
    }

    config.modulePath = buildModuleUrl(wasmOptions.fallbackModulePath)
    return config
  }

  config.wasmBinaryFile = buildModuleUrl(wasmOptions.wasmBinaryFile)

  const arrayBuffer = await Resource.fetchArrayBuffer({
    url: config.wasmBinaryFile!
  })

  config.wasmBinary = arrayBuffer
  return config
}

const emptyTransferableObjectArray: object[] = []

const createOnmessageHandler = (
  worker: Worker,
  id: number,
  resolve: Function,
  reject: Function
): Function => {
  const listener = (event: MessageEvent) => {
    const data = event.data

    if (data.id !== id) {
      return
    }

    if (Defined(data.error)) {
      let error = data.error
      if (error.name === 'RuntimeError') {
        error = new RuntimeError(error.message)
        error.stack = data.error.stack
      } else if (error.name === 'DeveloperError') {
        error = new DeveloperError(error.message)
        error.stack = data.error.stack
      } else if (error.name === 'Error') {
        error = new Error(error.message)
        error.stack = data.error.stack
      }
      taskCompletedEvent.raiseEvent(error)
      reject(error)
    } else {
      taskCompletedEvent.raiseEvent()
      resolve(data.result)
    }

    worker.removeEventListener('message', listener)
  }

  return listener
}

/**
 * A wrapper around a web worker that allows scheduling tasks for a given worker,
 * returning results asynchronously via a promise.
 *
 * The Worker is not constructed until a task is scheduled.
 *
 * @alias TaskProcessor
 * @constructor
 *
 * @param {string} workerPath The Url to the worker. This can either be an absolute path or relative to the Cesium Workers folder.
 * @param {number} [maximumActiveTasks=Number.POSITIVE_INFINITY] The maximum number of active tasks.  Once exceeded,
 *                                        scheduleTask will not queue any more tasks, allowing
 *                                        work to be rescheduled in future frames.
 */
export default class TaskProcessor {
  private _workerPath: string
  private _maximumActiveTasks: number
  private _activeTasks: number
  private _nextID: number
  private _webAssemblyPromise: Promise<any> | undefined
  private _worker: any

  static taskCompletedEvent: Event
  static _defaultWorkerModulePrefix: string
  static _workerModulePrefix: string
  static _canTransferArrayBuffer: any

  public get workerPath() {
    return this._workerPath
  }
  public get maximumActiveTasks() {
    return this._maximumActiveTasks
  }
  public get activeTasks() {
    return this._activeTasks
  }
  public get nextID() {
    return this._nextID
  }
  constructor(
    workerPath: string,
    maximumActiveTasks: number = Number.POSITIVE_INFINITY
  ) {
    this._workerPath = workerPath
    this._maximumActiveTasks = maximumActiveTasks
    this._activeTasks = 0
    this._nextID = 0
    this._webAssemblyPromise = undefined
  }

  /**
   * Posts a message to a web worker with configuration to initialize loading
   * and compiling a web assembly module asynchronously, as well as an optional
   * fallback JavaScript module to use if Web Assembly is not supported.
   *
   * @param {object} [webAssemblyOptions] An object with the following properties:
   * @param {string} [webAssemblyOptions.modulePath] The path of the web assembly JavaScript wrapper module.
   * @param {string} [webAssemblyOptions.wasmBinaryFile] The path of the web assembly binary file.
   * @param {string} [webAssemblyOptions.fallbackModulePath] The path of the fallback JavaScript module to use if web assembly is not supported.
   * @returns {Promise<*>} A promise that resolves to the result when the web worker has loaded and compiled the web assembly module and is ready to process tasks.
   *
   * @exception {RuntimeError} This browser does not support Web Assembly, and no backup module was provided
   */
  public initWebAssemblyModule(webAssemblyOptions: InitWebAssemblyOptions) {
    if (Defined(this._webAssemblyPromise)) {
      return this._webAssemblyPromise
    }

    const init = async () => {
      const worker = (this._worker = createWorker(this._workerPath))
      const wasmConfig = await getWebAssemblyLoaderConfig(
        this,
        webAssemblyOptions
      )
      const canTransfer = await Promise.resolve(canTransferArrayBuffer())
      let transferableObjects
      const binary = wasmConfig.wasmBinary
      if (Defined(binary) && canTransfer) {
        transferableObjects = [binary as ArrayBuffer]
      }

      const promise = new Promise((resolve, reject) => {
        worker.onmessage = function ({ data }) {
          if (Defined(data)) {
            resolve(data.result)
          } else {
            reject(new RuntimeError('Could not configure wasm module'))
          }
        }
      })

      worker.postMessage(
        {
          canTransferArrayBuffer: canTransfer,
          parameters: { webAssemblyConfig: wasmConfig }
        },
        transferableObjects as ArrayBuffer[]
      )

      return promise
    }

    this._webAssemblyPromise = init()
    return this._webAssemblyPromise
  }

  /**
   * Schedule a task to be processed by the web worker asynchronously.  If there are currently more
   * tasks active than the maximum set by the constructor, will immediately return undefined.
   * Otherwise, returns a promise that will resolve to the result posted back by the worker when
   * finished.
   *
   * @param {object} parameters Any input data that will be posted to the worker.
   * @param {Object[]} [transferableObjects] An array of objects contained in parameters that should be
   *                                      transferred to the worker instead of copied.
   * @returns {Promise<object>|undefined} Either a promise that will resolve to the result when available, or undefined
   *                    if there are too many active tasks,
   *
   * @example
   * const taskProcessor = new Cesium.TaskProcessor('myWorkerPath');
   * const promise = taskProcessor.scheduleTask({
   *     someParameter : true,
   *     another : 'hello'
   * });
   * if (!Cesium.defined(promise)) {
   *     // too many active tasks - try again later
   * } else {
   *     promise.then(function(result) {
   *         // use the result of the task
   *     });
   * }
   */
  public scheduleTask(
    parameters: object,
    transferableObjects: object[] = []
  ): Promise<any> | undefined {
    if (!Defined(this._worker)) {
      this._worker = createWorker(this._workerPath)
    }
    if (this._activeTasks >= this._maximumActiveTasks) {
      return undefined
    }
    return this._scheduleTask(this, parameters, transferableObjects)
  }

  private async _scheduleTask(
    processor: TaskProcessor,
    parameters: object,
    transferableObjects: object[]
  ): Promise<object> {
    ++processor._activeTasks

    try {
      const result = await this._runTask(
        processor,
        parameters,
        transferableObjects
      )
      --processor._activeTasks
      return result
    } catch (error) {
      --processor._activeTasks
      throw error
    }
  }

  private async _runTask(
    processor: TaskProcessor,
    parameters: object,
    transferableObjects: object[]
  ): Promise<object> {
    const canTransfer = await Promise.resolve(canTransferArrayBuffer())
    if (!Defined(transferableObjects)) {
      transferableObjects = emptyTransferableObjectArray
    } else if (!canTransfer) {
      transferableObjects.length = 0
    }

    const id = processor._nextID++
    const promise = new Promise((resolve, reject) => {
      processor._worker.addEventListener(
        'message',
        createOnmessageHandler(processor._worker, id, resolve, reject)
      )
    }) as Promise<object>

    processor._worker.postMessage(
      {
        id: id,
        baseUrl: buildModuleUrl.getCesiumBaseUrl().url,
        parameters: parameters,
        canTransferArrayBuffer: canTransfer
      },
      transferableObjects
    )

    return promise
  }
}

/**
 * An event that's raised when a task is completed successfully.  Event handlers are passed
 * the error object is a task fails.
 *
 * @type {Event}
 *
 * @private
 */
TaskProcessor.taskCompletedEvent = taskCompletedEvent

// exposed for testing purposes
TaskProcessor._defaultWorkerModulePrefix = 'Workers/'
TaskProcessor._workerModulePrefix = TaskProcessor._defaultWorkerModulePrefix
