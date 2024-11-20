export const getExtension = (gl: WebGLRenderingContext, names: string[]) => {
  const length = names.length
  for (let i = 0; i < length; ++i) {
    const extension = gl.getExtension(names[i])
    if (extension) {
      return extension
    }
  }

  return undefined
}
