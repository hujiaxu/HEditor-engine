interface ContextLimits {
  maximumTextureSize: number
  maximumVertexTextureImageUnits: number
  maximumColorAttachments: number
  _maximumVertexAttributes: number
  _maximumCubeMapSize: number
  _minimumAliasedLineWidth: number
  minimumAliasedLineWidth: number

  maximumAliasedLineWidth: number
  _maximumAliasedLineWidth: number

  maximumViewportWidth: number
  _maximumViewportWidth: number

  maximumViewportHeight: number
  _maximumViewportHeight: number
}

const ContextLimits: ContextLimits = {
  maximumTextureSize: 0,
  maximumVertexTextureImageUnits: 0,
  maximumColorAttachments: 0,
  _maximumVertexAttributes: 0,
  _maximumCubeMapSize: 0,
  _minimumAliasedLineWidth: 0,
  minimumAliasedLineWidth: 0,
  maximumAliasedLineWidth: 0,
  _maximumAliasedLineWidth: 0,
  maximumViewportWidth: 0,
  _maximumViewportWidth: 0,
  maximumViewportHeight: 0,
  _maximumViewportHeight: 0
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
  },
  minimumAliasedLineWidth: {
    get: function () {
      return ContextLimits._minimumAliasedLineWidth
    }
  },
  maximumAliasedLineWidth: {
    get: function () {
      return ContextLimits._maximumAliasedLineWidth
    }
  },
  maximumViewportWidth: {
    get: function () {
      return ContextLimits._maximumViewportWidth
    }
  },
  maximumViewportHeight: {
    get: function () {
      return ContextLimits._maximumViewportHeight
    }
  }
})

export default ContextLimits
