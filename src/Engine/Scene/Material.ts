import { createGuid } from '../../utils'
import {
  Fabric,
  MaterialOptions,
  SourceType,
  TranslucentType
} from '../../type'
import clone from '../Core/Clone'
import defaultValue from '../Core/DefaultValue'
import Defined from '../Core/Defined'
import TextureMagnificationFilter from '../Renderer/TextureMagnificationFilter'
import TextureMinificationFilter from '../Renderer/TextureMinificationFilter'
import Context from '../Renderer/Context'
import Texture from '../Renderer/Texture'
import combine from '../Core/Combine'
import Resource from '../Core/Resource'
import DeveloperError from '../Core/DeveloperError'
import Sampler from '../Renderer/Sampler'
import loadKTX2 from '../Core/LoadKTX2'
import CubeMap from '../Renderer/CubeMap'
import Color from '../Core/Color'

const ktx2Regex = /\.ktx2$/i

function checkForValidProperties(
  object: { hasOwnProperty: (arg0: string) => any },
  properties: string | string[],
  result: {
    (property: string, properties: string[]): void
    (arg0: string, arg1: any): void
  },
  throwNotFound: boolean
) {
  if (Defined(object)) {
    for (const property in object) {
      if (object.hasOwnProperty(property)) {
        const hasProperty = properties.indexOf(property) !== -1
        if (
          (throwNotFound && !hasProperty) ||
          (!throwNotFound && hasProperty)
        ) {
          result(property, properties)
        }
      }
    }
  }
}
function invalidNameError(property: string, properties: string[]) {
  // >>includeStart('debug', pragmas.debug);
  let errorString = `fabric: property name '${property}' is not valid. It should be `
  for (let i = 0; i < properties.length; i++) {
    const propertyName = `'${properties[i]}'`
    errorString +=
      i === properties.length - 1 ? `or ${propertyName}.` : `${propertyName}, `
  }
  throw new Error(errorString)
  // >>includeEnd('debug');
}
function duplicateNameError(property: string) {
  // >>includeStart('debug', pragmas.debug);
  const errorString = `fabric: uniforms and materials cannot share the same property '${property}'`
  throw new Error(errorString)
  // >>includeEnd('debug');
}
const templateProperties = [
  'type',
  'materials',
  'uniforms',
  'components',
  'source'
]
const componentProperties = [
  'diffuse',
  'specular',
  'shininess',
  'normal',
  'emission',
  'alpha'
]

// Determines the uniform type based on the uniform in the template.
function getUniformType(uniformValue: any) {
  let uniformType = uniformValue.type
  if (!Defined(uniformType)) {
    const type = typeof uniformValue
    if (type === 'number') {
      uniformType = 'float'
    } else if (type === 'boolean') {
      uniformType = 'bool'
    } else if (
      type === 'string' ||
      uniformValue instanceof Resource ||
      uniformValue instanceof HTMLCanvasElement ||
      uniformValue instanceof HTMLImageElement
    ) {
      if (/^([rgba]){1,4}$/i.test(uniformValue)) {
        uniformType = 'channels'
      } else if (uniformValue === Material.DefaultCubeMapId) {
        uniformType = 'samplerCube'
      } else {
        uniformType = 'sampler2D'
      }
    } else if (type === 'object') {
      if (Array.isArray(uniformValue)) {
        if (
          uniformValue.length === 4 ||
          uniformValue.length === 9 ||
          uniformValue.length === 16
        ) {
          uniformType = `mat${Math.sqrt(uniformValue.length)}`
        }
      } else {
        let numAttributes = 0
        for (const attribute in uniformValue) {
          if (uniformValue.hasOwnProperty(attribute)) {
            numAttributes += 1
          }
        }
        if (numAttributes >= 2 && numAttributes <= 4) {
          uniformType = `vec${numAttributes}`
        } else if (numAttributes === 6) {
          uniformType = 'samplerCube'
        }
      }
    }
  }
  return uniformType
}

// Used for searching or replacing a token in a material's shader source with something else.
// If excludePeriod is true, do not accept tokens that are preceded by periods.
// http://stackoverflow.com/questions/641407/javascript-negative-lookbehind-equivalent
function replaceToken(
  material: Material,
  token: string,
  newToken: string,
  excludePeriod: boolean = false
) {
  excludePeriod = defaultValue(excludePeriod, true)
  let count = 0
  const suffixChars = '([\\w])?'
  const prefixChars = `([\\w${excludePeriod ? '.' : ''}])?`
  const regExp = new RegExp(prefixChars + token + suffixChars, 'g')
  material.shaderSource = material.shaderSource.replace(
    regExp,
    function ($0, $1, $2) {
      if ($1 || $2) {
        return $0
      }
      count += 1
      return newToken
    }
  )
  return count
}

function getNumberOfTokens(
  material: Material,
  token: string,
  excludePeriod: boolean = false
) {
  return replaceToken(material, token, token, excludePeriod)
}

export default class Material {
  private _minificationFilter: number
  private _magnificationFilter: number
  private _strict: boolean
  private _count: number
  private _template: Fabric
  private _uniforms: any
  uniforms: any
  private _translucentFunctions: TranslucentType[]

  public translucent!: TranslucentType
  public type: string
  public shaderSource: string
  public materials: { [key: string]: Material }
  private _defaultTexture!: Texture
  private _loadedImages!: { id: string; image: SourceType }[]
  static _materialCache: {
    _materials: { [type: string]: any }
    addMaterial: (type: string, materialTemplate: any) => void
    getMaterial: (type: string) => any
  }
  static DefaultImageId: string
  static DefaultCubeMapId: string
  private _textures: any
  private _updateFunctions: Function[] = []
  private _texturePaths: any
  private _loadedCubeMaps: any
  static ColorType: string

  constructor(options: MaterialOptions) {
    this._minificationFilter = defaultValue(
      options.minificationFilter,
      TextureMinificationFilter.LINEAR
    )
    this._magnificationFilter = defaultValue(
      options.magnificationFilter,
      TextureMagnificationFilter.LINEAR
    )
    this._strict = defaultValue(options.strict, false)
    this._count = defaultValue(options.count, 0)

    this._template = clone(
      defaultValue(options.fabric, defaultValue.EMPTY_OBJECT)
    )
    this._template.uniforms = clone(
      defaultValue(this._template.uniforms, defaultValue.EMPTY_OBJECT)
    )
    this._template.materials = clone(
      defaultValue(this._template.materials, defaultValue.EMPTY_OBJECT)
    )
    this.type = Defined(this._template.type)
      ? this._template.type
      : createGuid()

    this.shaderSource = ''
    this.materials = {}
    this.uniforms = {}
    this._uniforms = {}
    this._translucentFunctions = []

    let translucent: ((result: Material) => void) | boolean | undefined

    // If the cache contains this material type, build the material template off of the stored template.
    const cachedMaterial = Material._materialCache.getMaterial(this.type)
    if (Defined(cachedMaterial)) {
      const template = clone(cachedMaterial.fabric, true)
      this._template = combine(this._template, template, true)
      translucent = cachedMaterial.translucent
    }

    // Make sure the template has no obvious errors. More error checking happens later.
    this._checkForTemplateErrors(this)

    // If the material has a new type, add it to the cache.
    if (!Defined(cachedMaterial)) {
      Material._materialCache.addMaterial(this.type, this)
    }

    this._createMethodDefinition(this)
    this._createUniforms(this)
    this._createSubMaterials(this)

    const defaultTranslucent =
      this._translucentFunctions.length === 0 ? true : undefined
    translucent = defaultValue(translucent, defaultTranslucent)
    translucent = defaultValue(options.translucent, translucent)

    if (Defined(translucent)) {
      if (typeof translucent === 'function') {
        const wrappedTranslucent = () => {
          return translucent(this)
        }
        this._translucentFunctions.push(wrappedTranslucent)
      } else {
        this._translucentFunctions.push(translucent)
      }
    }
  }

  // Create all sub-materials by combining source and uniforms together.
  private _createSubMaterials(material: Material) {
    const strict = material._strict
    const subMaterialTemplates = material._template.materials
    for (const subMaterialId in subMaterialTemplates) {
      // Construct the sub-material.
      const subMaterial = new Material({
        strict: strict,
        fabric: subMaterialTemplates[subMaterialId],
        count: material._count
      })
      material._count = subMaterial._count
      material._uniforms = combine(
        material._uniforms,
        subMaterial._uniforms,
        true
      )
      material.materials[subMaterialId] = subMaterial
      material._translucentFunctions = material._translucentFunctions.concat(
        subMaterial._translucentFunctions
      )

      // Make the material's czm_getMaterial unique by appending the sub-material type.
      const originalMethodName = 'czm_getMaterial'
      const newMethodName = `${originalMethodName}_${material._count++}`
      replaceToken(subMaterial, originalMethodName, newMethodName)
      material.shaderSource = subMaterial.shaderSource + material.shaderSource

      // Replace each material id with an czm_getMaterial method call.
      const materialMethodCall = `${newMethodName}(materialInput)`
      const tokensReplacedCount = replaceToken(
        material,
        subMaterialId,
        materialMethodCall
      )

      // >>includeStart('debug', pragmas.debug);
      if (tokensReplacedCount === 0 && strict) {
        throw new DeveloperError(
          `strict: shader source does not use material '${subMaterialId}'.`
        )
      }
      // >>includeEnd('debug');
    }
  }

  private _createUniforms(material: Material) {
    const uniforms = material._template.uniforms
    for (const uniformId in uniforms) {
      if (uniforms.hasOwnProperty(uniformId)) {
        this._createUniform(material, uniformId)
      }
    }
  }

  private _createUniform(material: Material, uniformId: string) {
    const strict = material._strict
    const materialUniforms = material._template.uniforms!
    const uniformValue = materialUniforms[uniformId]
    const uniformType = getUniformType(uniformValue)

    // >>includeStart('debug', pragmas.debug);
    if (!Defined(uniformType)) {
      throw new Error(`fabric: uniform '${uniformId}' has invalid type.`)
    }
    // >>includeEnd('debug');

    let replacedTokenCount
    if (uniformType === 'channels') {
      replacedTokenCount = replaceToken(
        material,
        uniformId,
        uniformValue as string,
        false
      )
      // >>includeStart('debug', pragmas.debug);
      if (replacedTokenCount === 0 && strict) {
        throw new Error(
          `strict: shader source does not use channels '${uniformId}'.`
        )
      }
      // >>includeEnd('debug');
    } else {
      // Since webgl doesn't allow texture dimension queries in glsl, create a uniform to do it.
      // Check if the shader source actually uses texture dimensions before creating the uniform.
      if (uniformType === 'sampler2D') {
        const imageDimensionsUniformName = `${uniformId}Dimensions`
        if (getNumberOfTokens(material, imageDimensionsUniformName) > 0) {
          materialUniforms[imageDimensionsUniformName] = {
            type: 'ivec3',
            x: 1,
            y: 1
          }
          this._createUniform(material, imageDimensionsUniformName)
        }
      }

      // Add uniform declaration to source code.
      const uniformDeclarationRegex = new RegExp(
        `uniform\\s+${uniformType}\\s+${uniformId}\\s*;`
      )
      if (!uniformDeclarationRegex.test(material.shaderSource)) {
        const uniformDeclaration = `uniform ${uniformType} ${uniformId};`
        material.shaderSource = uniformDeclaration + material.shaderSource
      }

      const newUniformId = `${uniformId}_${material._count++}`
      replacedTokenCount = replaceToken(material, uniformId, newUniformId)
      // >>includeStart('debug', pragmas.debug);
      if (replacedTokenCount === 1 && strict) {
        throw new DeveloperError(
          `strict: shader source does not use uniform '${uniformId}'.`
        )
      }
      // >>includeEnd('debug');

      // Set uniform value
      material.uniforms[uniformId] = uniformValue
      if (uniformType === 'sampler2D') {
        material._uniforms[newUniformId] = function () {
          return material._textures[uniformId]
        }
        material._updateFunctions.push(
          this._createTexture2DUpdateFunction(uniformId)
        )
      }
    }
  }
  private _createTexture2DUpdateFunction(uniformId: string) {
    let oldUniformValue: any

    return function (material: Material, context: Context) {
      const uniforms = material.uniforms
      const uniformValue = uniforms[uniformId]
      const uniformChanged = oldUniformValue !== uniformValue

      const uniformValueIsDefaultImage =
        !Defined(uniformValue) || uniformValue === Material.DefaultImageId
      oldUniformValue = uniformValue

      let texture = material._textures[uniformId]
      let uniformDimensionsName
      let uniformDimensions

      if (uniformValue instanceof HTMLVideoElement) {
        // HTMLVideoElement.readyState >=2 means we have enough data for the current frame.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
        if (uniformValue.readyState >= 2) {
          if (uniformChanged && Defined(texture)) {
            if (texture !== context.defaultTexture) {
              texture.destroy()
            }
            texture = undefined
          }

          if (!Defined(texture) || texture === context.defaultTexture) {
            const sampler = new Sampler({
              minificationFilter: material._minificationFilter,
              magnificationFilter: material._magnificationFilter
            })
            texture = new Texture({
              context: context,
              source: uniformValue,
              sampler: sampler
            })
            material._textures[uniformId] = texture
            return
          }

          texture.copyFrom({
            source: uniformValue
          })
        } else if (!Defined(texture)) {
          material._textures[uniformId] = context.defaultTexture
        }
        return
      }
      if (uniformValue instanceof Texture && uniformValue !== texture) {
        material._texturePaths[uniformId] = undefined
        const tmp = material._textures[uniformId]

        if (Defined(tmp) && tmp !== material._defaultTexture) {
          tmp.destroy()
        }
        material._textures[uniformId] = uniformValue
        uniformDimensionsName = `${uniformId}Dimensions`
        if (uniforms.hasOwnProperty(uniformDimensionsName)) {
          uniformDimensions = uniforms[uniformDimensionsName]
          uniformDimensions.x = uniformValue.width
          uniformDimensions.y = uniformValue.height
        }

        return
      }

      if (uniformChanged && Defined(texture) && uniformValueIsDefaultImage) {
        // If the newly-assigned texture is the default texture,
        // we don't need to wait for a new image to load before destroying
        // the old texture.
        if (texture !== material._defaultTexture) {
          texture.destroy()
        }
        texture = undefined
      }
      if (!Defined(texture)) {
        material._texturePaths[uniformId] = undefined
        texture = material._textures[uniformId] = material._defaultTexture

        uniformDimensionsName = `${uniformId}Dimensions`
        if (uniforms.hasOwnProperty(uniformDimensionsName)) {
          uniformDimensions = uniforms[uniformDimensionsName]
          uniformDimensions.x = texture._width
          uniformDimensions.y = texture._height
        }
      }
      if (uniformValueIsDefaultImage) {
        return
      }

      // When using the entity layer, the Resource objects get recreated on getValue because
      //  they are clonable. That's why we check the url property for Resources
      //  because the instances aren't the same and we keep trying to load the same
      //  image if it fails to load.
      const isResource = uniformValue instanceof Resource
      if (
        !Defined(material._texturePaths[uniformId]) ||
        (isResource &&
          uniformValue.url !== material._texturePaths[uniformId].url) ||
        (!isResource && uniformValue !== material._texturePaths[uniformId])
      ) {
        if (typeof uniformValue === 'string' || isResource) {
          const resource = isResource
            ? uniformValue
            : Resource.createIfNeeded(uniformValue)

          let promise
          if (ktx2Regex.test(resource.url as string)) {
            promise = loadKTX2(resource.url)
          } else {
            promise = resource.fetchImage()
          }

          Promise.resolve(promise)
            .then(function (image) {
              material._loadedImages.push({
                id: uniformId,
                image: image
              })
            })
            .catch(function () {
              if (Defined(texture) && texture !== material._defaultTexture) {
                texture.destroy()
              }
              material._textures[uniformId] = material._defaultTexture
            })
        }
      } else if (
        uniformValue instanceof HTMLCanvasElement ||
        uniformValue instanceof HTMLImageElement
      ) {
        material._loadedImages.push({
          id: uniformId,
          image: uniformValue
        })
      }

      material._texturePaths[uniformId] = uniformValue
    }
  }
  private _createMethodDefinition(material: Material) {
    const components = material._template.components
    const source = material._template.source

    if (Defined(source)) {
      material.shaderSource += `${source}\n`
    } else {
      material.shaderSource +=
        'czm_material czm_getMaterial(czm_materialInput materialInput)\n{\n'
      material.shaderSource +=
        'czm_material material = czm_getDefaultMaterial(materialInput);\n'

      if (Defined(components)) {
        const isMultiMaterial =
          Object.keys(material._template.materials!).length > 0

        for (const component in components) {
          if (components.hasOwnProperty(component)) {
            if (component === 'diffuse' || component === 'emission') {
              const isFusion =
                isMultiMaterial &&
                this._isMaterialFused(
                  components[component as 'diffuse' | 'emission']!,
                  material
                )
              const componentSource = isFusion
                ? components[component]
                : `czm_gammaCorrect(${components[component]})`
              material.shaderSource += `material.${component} = ${componentSource}; \n`
            } else if (component === 'alpha') {
              material.shaderSource += `material.alpha = ${components.alpha}; \n`
            } else {
              material.shaderSource += `material.${component} = ${components[component as 'specular' | 'shininess' | 'normal']};\n`
            }
          }
        }
      }
    }
  }

  private _isMaterialFused(shaderComponent: string, material: Material) {
    const materials = material._template.materials
    for (const subMaterialId in materials) {
      if (materials.hasOwnProperty(subMaterialId)) {
        if (shaderComponent.indexOf(subMaterialId) > -1) {
          return true
        }
      }
    }

    return false
  }
  private _checkForTemplateErrors(material: Material) {
    const template = material._template
    const uniforms = template.uniforms
    const materials = template.materials
    const components = template.components

    // Make sure source and components do not exist in the same template.
    // >>includeStart('debug', pragmas.debug);
    if (Defined(components) && Defined(template.source)) {
      throw new Error(
        'fabric: cannot have source and components in the same template.'
      )
    }
    // >>includeEnd('debug');

    // Make sure all template and components properties are valid.
    checkForValidProperties(
      template,
      templateProperties,
      invalidNameError,
      true
    )
    checkForValidProperties(
      components!,
      componentProperties,
      invalidNameError,
      true
    )

    // Make sure uniforms and materials do not share any of the same names.
    const materialNames = []
    for (const property in materials) {
      if (materials.hasOwnProperty(property)) {
        materialNames.push(property)
      }
    }
    checkForValidProperties(uniforms!, materialNames, duplicateNameError, false)
  }
  public update(context: Context) {
    this._defaultTexture = context.defaultTexture

    let i
    let uniformId

    const loadedImages = this._loadedImages
    let length = loadedImages.length
    for (i = 0; i < length; ++i) {
      const loadedImage = loadedImages[i]
      uniformId = loadedImage.id
      let image = loadedImage.image

      // Images transcoded from KTX2 can contain multiple mip levels:
      // https://github.khronos.org/KTX-Specification/#_mip_level_array
      let mipLevels
      if (Array.isArray(image)) {
        // highest detail mip should be level 0
        mipLevels = image.slice(1, image.length).map(function (mipLevel) {
          return mipLevel.bufferView
        })
        image = image[0]
      }

      const sampler = new Sampler({
        minificationFilter: this._minificationFilter,
        magnificationFilter: this._magnificationFilter
      })

      let texture

      if (Defined(image.internalFormat)) {
        texture = new Texture({
          context: context,
          pixelFormat: image.internalFormat,
          width: image.width,
          height: image.height,
          source: {
            arrayBufferView: image.bufferView,
            mipLevels: mipLevels
          },
          sampler: sampler
        })
      } else {
        texture = new Texture({
          context: context,
          source: image,
          sampler: sampler
        })
      }

      // The material destroys its old texture only after the new one has been loaded.
      // This will ensure a smooth swap of textures and prevent the default texture
      // from appearing for a few frames.
      const oldTexture = this._textures[uniformId]
      if (Defined(oldTexture) && oldTexture !== this._defaultTexture) {
        oldTexture.destroy()
      }
      this._textures[uniformId] = texture

      const uniformDimensionsName = `${uniformId}Dimensions`
      if (this.uniforms.hasOwnProperty(uniformDimensionsName)) {
        const uniformDimensions = this.uniforms[uniformDimensionsName]
        uniformDimensions.x = texture.width
        uniformDimensions.y = texture.height
      }
    }

    loadedImages.length = 0

    const loadedCubeMaps = this._loadedCubeMaps
    length = loadedCubeMaps.length

    for (i = 0; i < length; ++i) {
      const loadedCubeMap = loadedCubeMaps[i]
      uniformId = loadedCubeMap.id
      const images = loadedCubeMap.images

      const cubeMap = new CubeMap({
        context: context,
        source: {
          positiveX: images[0],
          negativeX: images[1],
          positiveY: images[2],
          negativeY: images[3],
          positiveZ: images[4],
          negativeZ: images[5]
        },
        sampler: new Sampler({
          minificationFilter: this._minificationFilter,
          magnificationFilter: this._magnificationFilter
        })
      })

      this._textures[uniformId] = cubeMap
    }

    loadedCubeMaps.length = 0
    const updateFunctions = this._updateFunctions
    length = updateFunctions.length
    for (i = 0; i < length; ++i) {
      updateFunctions[i](this, context)
    }
    const subMaterials = this.materials
    for (const name in subMaterials) {
      if (subMaterials.hasOwnProperty(name)) {
        subMaterials[name].update(context)
      }
    }
  }
  public isTranslucent() {
    if (Defined(this.translucent)) {
      if (typeof this.translucent === 'function') {
        return this.translucent()
      }

      return this.translucent
    }
  }
}
Material._materialCache = {
  _materials: {},
  addMaterial: function (type: string, materialTemplate: any) {
    this._materials[type] = materialTemplate
  },
  getMaterial: function (type: string) {
    return this._materials[type]
  }
}

/**
 * Gets or sets the default texture uniform value.
 * @type {string}
 */
Material.DefaultImageId = 'czm_defaultImage'

/**
 * Gets or sets the default cube map texture uniform value.
 * @type {string}
 */
Material.DefaultCubeMapId = 'czm_defaultCubeMap'

/**
 * Gets the name of the color material.
 * @type {string}
 * @readonly
 */
Material.ColorType = 'Color'
Material._materialCache.addMaterial(Material.ColorType, {
  fabric: {
    type: Material.ColorType,
    uniforms: {
      color: new Color(1.0, 0.0, 0.0, 0.5)
    },
    components: {
      diffuse: 'color.rgb',
      alpha: 'color.a'
    }
  },
  translucent: function (material: Material) {
    return material.uniforms.color.alpha < 1.0
  }
})
