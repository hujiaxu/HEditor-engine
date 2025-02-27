import Defined from './Defined'

const context2DsByWidthAndHeight: {
  [key: number]: { [key: number]: CanvasRenderingContext2D | null }
} = {}

/**
 * Extract a pixel array from a loaded image.  Draws the image
 * into a canvas so it can read the pixels back.
 *
 * @function getImagePixels
 *
 * @param {HTMLImageElement|ImageBitmap} image The image to extract pixels from.
 * @param {number} width The width of the image. If not defined, then image.width is assigned.
 * @param {number} height The height of the image. If not defined, then image.height is assigned.
 * @returns {ImageData} The pixels of the image.
 */
const getImagePixels = (
  image: HTMLImageElement | ImageBitmap,
  width?: number,
  height?: number
): Uint8ClampedArray<ArrayBufferLike> => {
  if (!Defined(width)) {
    width = image.width
  }
  if (!Defined(height)) {
    height = image.height
  }

  let context2DsByHeight = context2DsByWidthAndHeight[width]
  if (!Defined(context2DsByHeight)) {
    context2DsByHeight = {}
    context2DsByWidthAndHeight[width] = context2DsByHeight
  }

  let context2d = context2DsByHeight[height]
  if (!Defined(context2d)) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    // Since we re-use contexts, use the willReadFrequently option – See https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
    context2d = canvas.getContext('2d', { willReadFrequently: true })
    context2d!.globalCompositeOperation = 'copy'
    context2DsByHeight[height] = context2d
  }
  context2d!.drawImage(image, 0, 0, width, height)
  return context2d!.getImageData(0, 0, width, height).data
}
export default getImagePixels
