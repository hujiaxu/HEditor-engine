declare const TextureMinificationFilter: {
    NEAREST: 9728;
    LINEAR: 9729;
    NEAREST_MIPMAP_NEAREST: 9984;
    LINEAR_MIPMAP_NEAREST: 9985;
    NEAREST_MIPMAP_LINEAR: 9986;
    LINEAR_MIPMAP_LINEAR: 9987;
    validate(textureMinificationFilter: number): textureMinificationFilter is 9728 | 9729 | 9984 | 9985 | 9986 | 9987;
};
export default TextureMinificationFilter;
