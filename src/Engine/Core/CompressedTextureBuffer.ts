export default class CompressedTextureBuffer {
  private _datatype: number
  private _format: number
  private _width: number
  private _height: number
  private _buffer: Uint8Array

  get datatype() {
    return this._datatype
  }

  get format() {
    return this._format
  }

  get width() {
    return this._width
  }

  get height() {
    return this._height
  }

  get buffer() {
    return this._buffer
  }
  constructor(
    internalFormat: number,
    pixelDatatype: number,
    width: number,
    height: number,
    buffer: Uint8Array
  ) {
    this._format = internalFormat
    this._datatype = pixelDatatype
    this._width = width
    this._height = height
    this._buffer = buffer
  }
}
