const TextureMinificationFilter = {
  NEAREST: WebGL2RenderingContext.NEAREST,
  LINEAR: WebGL2RenderingContext.LINEAR,
  NEAREST_MIPMAP_NEAREST: WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST,
  LINEAR_MIPMAP_NEAREST: WebGL2RenderingContext.LINEAR_MIPMAP_NEAREST,
  NEAREST_MIPMAP_LINEAR: WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR,
  LINEAR_MIPMAP_LINEAR: WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR,

  validate(textureMinificationFilter: number) {
    return (
      textureMinificationFilter === TextureMinificationFilter.NEAREST ||
      textureMinificationFilter === TextureMinificationFilter.LINEAR ||
      textureMinificationFilter ===
        TextureMinificationFilter.NEAREST_MIPMAP_NEAREST ||
      textureMinificationFilter ===
        TextureMinificationFilter.LINEAR_MIPMAP_NEAREST ||
      textureMinificationFilter ===
        TextureMinificationFilter.NEAREST_MIPMAP_LINEAR ||
      textureMinificationFilter ===
        TextureMinificationFilter.LINEAR_MIPMAP_LINEAR
    )
  }
}
export default TextureMinificationFilter
