const TextureMagnificationFilter = {
  NEAREST: WebGL2RenderingContext.NEAREST,
  LINEAR: WebGL2RenderingContext.LINEAR,

  validate(textureMagnificationFilter: number) {
    return (
      textureMagnificationFilter === TextureMagnificationFilter.NEAREST ||
      textureMagnificationFilter === TextureMagnificationFilter.LINEAR
    )
  }
}

export default TextureMagnificationFilter
