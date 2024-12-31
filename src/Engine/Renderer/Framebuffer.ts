import { FramebufferOptions } from '../../type'

export default class Framebuffer {
  private _gl: WebGLRenderingContext
  private _framebuffer: WebGLFramebuffer
  constructor(options: FramebufferOptions) {
    const context = options.context

    const gl = context.gl

    this._gl = gl
    this._framebuffer = gl.createFramebuffer()
  }

  public bind() {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
  }
  public unBind() {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
}
