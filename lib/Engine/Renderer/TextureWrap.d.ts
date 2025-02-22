declare const TextureWrap: {
    CLAMP_TO_EDGE: 33071;
    REPEAT: 10497;
    MIRRORED_REPEAT: 33648;
    validate(textureWrap: number): textureWrap is 33071 | 10497 | 33648;
};
export default TextureWrap;
