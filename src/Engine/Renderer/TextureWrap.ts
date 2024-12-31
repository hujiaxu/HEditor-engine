const TextureWrap = {
  CLAMP_TO_EDGE: WebGL2RenderingContext.CLAMP_TO_EDGE,
  REPEAT: WebGL2RenderingContext.REPEAT,
  MIRRORED_REPEAT: WebGL2RenderingContext.MIRRORED_REPEAT,

  validate(textureWrap: number) {
    return (
      textureWrap === TextureWrap.CLAMP_TO_EDGE ||
      textureWrap === TextureWrap.REPEAT ||
      textureWrap === TextureWrap.MIRRORED_REPEAT
    )
  }
}

export default TextureWrap
