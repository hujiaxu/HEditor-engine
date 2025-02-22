import PixelDatatype from './PixelDatatype';
import Defined from '../Core/Defined';
import Sampler from './Sampler';
import PixelFormat from './PixelFormat';
import ContextLimits from './ContextLimits';
import { createGuid } from '../../utils';
import Cartesian2 from '../Core/Cartesian2';
import TextureMinificationFilter from './TextureMinificationFilter';
import TextureMagnificationFilter from './TextureMagnificationFilter';
export default class Texture {
    _id;
    _context;
    _sampler;
    _initialized;
    _flipY;
    _preMultiplyAlpha;
    _sizeInBytes;
    _textureFilterAnisotropic;
    _textureTarget;
    _texture;
    _internalFormat;
    _pixelFormat;
    _pixelDatatype;
    _width;
    _height;
    _dimensions;
    _hasMipmap;
    get internalFormat() {
        return this._internalFormat;
    }
    get textureTarget() {
        return this._textureTarget;
    }
    get pixelFormat() {
        return this._pixelFormat;
    }
    get pixelDatatype() {
        return this._pixelDatatype;
    }
    get id() {
        return this._id;
    }
    get sampler() {
        return this._sampler;
    }
    get initialized() {
        return this._initialized;
    }
    get flipY() {
        return this._flipY;
    }
    get preMultiplyAlpha() {
        return this._preMultiplyAlpha;
    }
    get sizeInBytes() {
        return this._sizeInBytes;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get dimensions() {
        return this._dimensions;
    }
    get hasMipmap() {
        return this._hasMipmap;
    }
    constructor(options) {
        const { context, source, pixelFormat = PixelFormat.RGBA, pixelDatatype = PixelDatatype.UNSIGNED_BYTE, flipY = true, skipColorSpaceConversion = false, sampler = new Sampler() } = options;
        let { width, height } = options;
        if (Defined(source)) {
            // Make sure we are using the element's intrinsic width and height where available
            if (!Defined(width)) {
                width = source.videoWidth ?? source.naturalWidth ?? source.width;
            }
            if (!Defined(height)) {
                height = source.videoHeight ?? source.naturalHeight ?? source.height;
            }
        }
        // Use premultiplied alpha for opaque textures should perform better on Chrome:
        // http://media.tojicode.com/webglCamp4/#20
        const preMultiplyAlpha = options.preMultiplyAlpha ||
            pixelFormat === PixelFormat.RGB ||
            pixelFormat === PixelFormat.LUMINANCE;
        const internalFormat = PixelFormat.toInternalFormat(pixelFormat, pixelDatatype, context);
        const isCompressed = PixelFormat.isCompressedFormat(internalFormat);
        if (!Defined(width) || !Defined(height)) {
            throw new Error('options requires a source field to create an initialized texture or width and height fields to create a blank texture.');
        }
        if (width > ContextLimits.maximumTextureSize) {
            throw new Error(`Width must be less than or equal to the maximum texture size (${ContextLimits.maximumTextureSize}).  Check maximumTextureSize.`);
        }
        if (height > ContextLimits.maximumTextureSize) {
            throw new Error(`Height must be less than or equal to the maximum texture size (${ContextLimits.maximumTextureSize}).  Check maximumTextureSize.`);
        }
        if (!PixelFormat.validate(pixelFormat)) {
            throw new Error('Invalid options.pixelFormat.');
        }
        if (!isCompressed && !PixelDatatype.validate(pixelDatatype)) {
            throw new Error('Invalid options.pixelDatatype.');
        }
        if (pixelFormat === PixelFormat.DEPTH_COMPONENT &&
            pixelDatatype !== PixelDatatype.UNSIGNED_SHORT &&
            pixelDatatype !== PixelDatatype.UNSIGNED_INT) {
            throw new Error('When options.pixelFormat is DEPTH_COMPONENT, options.pixelDatatype must be UNSIGNED_SHORT or UNSIGNED_INT.');
        }
        if (pixelFormat === PixelFormat.DEPTH_STENCIL &&
            pixelDatatype !== PixelDatatype.UNSIGNED_INT_24_8) {
            throw new Error('When options.pixelFormat is DEPTH_STENCIL, options.pixelDatatype must be UNSIGNED_INT_24_8.');
        }
        if (pixelDatatype === PixelDatatype.HALF_FLOAT &&
            !context.halfFloatingPointTexture) {
            throw new Error('When options.pixelDatatype is HALF_FLOAT, this WebGL implementation must support the OES_texture_half_float extension. Check context.halfFloatingPointTexture.');
        }
        if (PixelFormat.isDepthFormat(pixelFormat)) {
            if (Defined(source)) {
                throw new Error('When options.pixelFormat is DEPTH_COMPONENT or DEPTH_STENCIL, source cannot be provided.');
            }
            if (!context.depthTexture) {
                throw new Error('When options.pixelFormat is DEPTH_COMPONENT or DEPTH_STENCIL, this WebGL implementation must support WEBGL_depth_texture.  Check context.depthTexture.');
            }
        }
        if (isCompressed) {
            if (!Defined(source) || !Defined(source.arrayBufferView)) {
                throw new Error('When options.pixelFormat is compressed, options.source.arrayBufferView must be defined.');
            }
            if (PixelFormat.isDXTFormat(internalFormat) && !context.s3tc) {
                throw new Error('When options.pixelFormat is S3TC compressed, this WebGL implementation must support the WEBGL_compressed_texture_s3tc extension. Check context.s3tc.');
            }
            else if (PixelFormat.isPVRTCFormat(internalFormat) && !context.pvrtc) {
                throw new Error('When options.pixelFormat is PVRTC compressed, this WebGL implementation must support the WEBGL_compressed_texture_pvrtc extension. Check context.pvrtc.');
            }
            else if (PixelFormat.isASTCFormat(internalFormat) && !context.astc) {
                throw new Error('When options.pixelFormat is ASTC compressed, this WebGL implementation must support the WEBGL_compressed_texture_astc extension. Check context.astc.');
            }
            else if (PixelFormat.isETC2Format(internalFormat) && !context.etc) {
                throw new Error('When options.pixelFormat is ETC2 compressed, this WebGL implementation must support the WEBGL_compressed_texture_etc extension. Check context.etc.');
            }
            else if (PixelFormat.isETC1Format(internalFormat) && !context.etc1) {
                throw new Error('When options.pixelFormat is ETC1 compressed, this WebGL implementation must support the WEBGL_compressed_texture_etc1 extension. Check context.etc1.');
            }
            else if (PixelFormat.isBC7Format(internalFormat) && !context.bc7) {
                throw new Error('When options.pixelFormat is BC7 compressed, this WebGL implementation must support the EXT_texture_compression_bptc extension. Check context.bc7.');
            }
            if (PixelFormat.compressedTextureSizeInBytes(internalFormat, width, height) !== source.arrayBufferView.byteLength) {
                throw new Error('The byte length of the array buffer is invalid for the compressed texture with the given width and height.');
            }
            const gl = context.gl;
            const sizeInBytes = isCompressed
                ? PixelFormat.compressedTextureSizeInBytes(pixelFormat, width, height)
                : PixelFormat.textureSizeInBytes(pixelFormat, pixelDatatype, width, height);
            this._id = options.id || createGuid();
            this._context = context;
            this._textureFilterAnisotropic = context.textureFilterAnisotropic;
            this._textureTarget = gl.TEXTURE_2D;
            this._texture = gl.createTexture();
            this._internalFormat = internalFormat;
            this._pixelFormat = pixelFormat;
            this._pixelDatatype = pixelDatatype;
            this._width = width;
            this._height = height;
            this._dimensions = new Cartesian2(width, height);
            this._hasMipmap = false;
            this._sizeInBytes = sizeInBytes;
            this._preMultiplyAlpha = preMultiplyAlpha;
            this._flipY = flipY;
            this._initialized = false;
            this._sampler = undefined;
            this._sampler = sampler;
            this._setupSampler(this, sampler);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(this._textureTarget, this._texture);
            if (Defined(source)) {
                if (skipColorSpaceConversion) {
                    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
                }
                else {
                    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
                }
                if (Defined(source.arrayBufferView)) {
                    const isCompressed = PixelFormat.isCompressedFormat(internalFormat);
                    if (isCompressed) {
                        this._loadCompressedBufferSource(source);
                    }
                    else {
                        this._loadBufferSource(source);
                    }
                }
                else if (Defined(source.framebuffer)) {
                    this._loadFramebufferSource(source);
                }
                else {
                    this._loadImageSource(source);
                }
                this._initialized = true;
            }
            else {
                this._loadNull();
            }
            gl.bindTexture(this._textureTarget, null);
        }
    }
    _setupSampler(texture, sampler) {
        let { minificationFilter, magnificationFilter } = sampler;
        const mipmap = [
            TextureMinificationFilter.NEAREST_MIPMAP_NEAREST,
            TextureMinificationFilter.LINEAR_MIPMAP_NEAREST,
            TextureMinificationFilter.NEAREST_MIPMAP_LINEAR,
            TextureMinificationFilter.LINEAR_MIPMAP_LINEAR
        ].includes(minificationFilter);
        const context = texture._context;
        const pixelFormat = texture._pixelFormat;
        const pixelDatatype = texture._pixelDatatype;
        // float textures only support nearest filtering unless the linear extensions are supported
        if ((pixelDatatype === PixelDatatype.FLOAT && !context.textureFloatLinear) ||
            (pixelDatatype === PixelDatatype.HALF_FLOAT &&
                !context.textureHalfFloatLinear)) {
            // override the sampler's settings
            minificationFilter = mipmap
                ? TextureMinificationFilter.NEAREST_MIPMAP_NEAREST
                : TextureMinificationFilter.NEAREST;
            magnificationFilter = TextureMagnificationFilter.NEAREST;
        }
        // WebGL 2 depth texture only support nearest filtering. See section 3.8.13 OpenGL ES 3 spec
        if (context.isSuppotedwebgl2) {
            if (PixelFormat.isDepthFormat(pixelFormat)) {
                minificationFilter = TextureMinificationFilter.NEAREST;
                magnificationFilter = TextureMagnificationFilter.NEAREST;
            }
        }
        const gl = context.gl;
        const target = texture._textureTarget;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(target, texture._texture);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minificationFilter);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, magnificationFilter);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, sampler.wrapS);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, sampler.wrapT);
        if (Defined(texture._textureFilterAnisotropic)) {
            gl.texParameteri(target, texture._textureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, sampler.maximumAnisotropy);
        }
        gl.bindTexture(target, null);
    }
    _loadCompressedBufferSource(source) {
        const context = this._context;
        const gl = context.gl;
        const textureTartet = this._textureTarget;
        const internalFormat = this._internalFormat;
        const { width, height } = this;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.compressedTexImage2D(textureTartet, 0, internalFormat, width, height, 0, source.arrayBufferView);
        if (Defined(source.mipLevels)) {
            let mipWidth = width;
            let mipHeight = height;
            for (let i = 0; i < source.mipLevels.length; i++) {
                mipWidth = this._nextMipSize(mipWidth);
                mipHeight = this._nextMipSize(mipHeight);
                gl.compressedTexImage2D(textureTartet, i + 1, internalFormat, mipWidth, mipHeight, 0, source.mipLevels[i]);
            }
        }
    }
    _loadBufferSource(source) {
        const context = this._context;
        const gl = context.gl;
        const { textureTarget, internalFormat, width, height, pixelFormat, pixelDatatype, flipY } = this;
        const unpackAlignment = PixelFormat.alignmentInBytes(pixelFormat, pixelDatatype, width);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        let { arrayBufferView } = source;
        if (flipY) {
            arrayBufferView = PixelFormat.flipY(arrayBufferView, pixelFormat, pixelDatatype, width, height);
        }
        gl.texImage2D(textureTarget, 0, internalFormat, width, height, 0, pixelFormat, PixelDatatype.toWebGLConstant(pixelDatatype, context), arrayBufferView);
        if (Defined(source.mipLevels)) {
            let mipWidth = width;
            let mipHeight = height;
            for (let i = 0; i < source.mipLevels.length; ++i) {
                mipWidth = this._nextMipSize(mipWidth);
                mipHeight = this._nextMipSize(mipHeight);
                gl.texImage2D(textureTarget, i + 1, internalFormat, mipWidth, mipHeight, 0, pixelFormat, PixelDatatype.toWebGLConstant(pixelDatatype, context), source.mipLevels[i]);
            }
        }
    }
    _loadFramebufferSource(source) {
        const context = this._context;
        const gl = context.gl;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        if (source.framebuffer !== context.defaultFramebuffer) {
            source.framebuffer.bind();
        }
        gl.copyTexImage2D(this._textureTarget, 0, this._internalFormat, source.xOffset, source.yOffset, this.width, this.height, 0);
        if (source.framebuffer !== context.defaultFramebuffer) {
            source.framebuffer.unBind();
        }
    }
    _loadImageSource(source) {
        const context = this._context;
        const gl = context.gl;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.preMultiplyAlpha);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
        gl.texImage2D(this._textureTarget, 0, this._internalFormat, this.pixelFormat, PixelDatatype.toWebGLConstant(this.pixelDatatype, context), source.image);
    }
    _loadNull() {
        const context = this._context;
        const gl = context.gl;
        gl.texImage2D(this._textureTarget, 0, this._internalFormat, this.width, this.height, 0, this.pixelFormat, PixelDatatype.toWebGLConstant(this.pixelDatatype, context), null);
    }
    _nextMipSize(currentSize) {
        const nextSize = Math.floor(currentSize / 2) | 0;
        return Math.max(1, nextSize);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvVGV4dHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFBO0FBQ3ZDLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDeEMsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFFM0MsT0FBTyx5QkFBeUIsTUFBTSw2QkFBNkIsQ0FBQTtBQUNuRSxPQUFPLDBCQUEwQixNQUFNLDhCQUE4QixDQUFBO0FBRXJFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUNsQixHQUFHLENBQVM7SUFDWixRQUFRLENBQVU7SUFDbEIsUUFBUSxDQUFxQjtJQUM3QixZQUFZLENBQVU7SUFDdEIsTUFBTSxDQUFVO0lBQ2hCLGlCQUFpQixDQUFVO0lBQzNCLFlBQVksQ0FBUztJQUNyQix5QkFBeUIsQ0FBSztJQUM5QixjQUFjLENBQVM7SUFDdkIsUUFBUSxDQUFlO0lBQ3ZCLGVBQWUsQ0FBUztJQUN4QixZQUFZLENBQVM7SUFDckIsY0FBYyxDQUFTO0lBQ3ZCLE1BQU0sQ0FBUztJQUNmLE9BQU8sQ0FBUztJQUNoQixXQUFXLENBQWE7SUFDeEIsVUFBVSxDQUFVO0lBRTVCLElBQUksY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7SUFDN0IsQ0FBQztJQUNELElBQUksYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtJQUM1QixDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQzFC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