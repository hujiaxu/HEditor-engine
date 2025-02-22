declare const TextureMagnificationFilter: {
    NEAREST: 9728;
    LINEAR: 9729;
    validate(textureMagnificationFilter: number): textureMagnificationFilter is 9728 | 9729;
};
export default TextureMagnificationFilter;
