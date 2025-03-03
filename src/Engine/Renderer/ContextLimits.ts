const ContextLimits = {
  maximumTextureSize: 0,
  maximumVertexTextureImageUnits: 0,
  maximumColorAttachments: 0,
  _maximumVertexAttributes: 0,
  _maximumCubeMapSize: 0
}

Object.defineProperties(ContextLimits, {
  /**
   * The approximate maximum cube map width and height supported by this WebGL implementation.
   * The minimum is 16, but most desktop and laptop implementations will support much larger sizes like 8,192.
   * @memberof ContextLimits
   * @type {number}
   * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glGet.xml|glGet} with <code>MAX_CUBE_MAP_TEXTURE_SIZE</code>.
   */
  maximumCubeMapSize: {
    get: function () {
      return ContextLimits._maximumCubeMapSize
    }
  },
  maximumVertexTextureImageUnits: {
    get: function () {
      return ContextLimits._maximumVertexAttributes
    }
  }
})

export default ContextLimits
