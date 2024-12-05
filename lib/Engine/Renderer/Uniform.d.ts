import { ContextType, UniformOptions, UniformType } from '../../type';
export default class Uniform {
    private _location;
    private _value;
    private _type;
    get location(): WebGLUniformLocation;
    set location(location: WebGLUniformLocation);
    get value(): number[];
    set value(value: number[]);
    get type(): UniformType;
    set type(type: UniformType);
    gl: ContextType;
    /**
     * Constructs a new Uniform instance.
     *
     * @param {UniformOptions} options - The options for initializing the uniform.
     * @param {ContextType} options.gl - The WebGL context used for rendering.
     * @param {number} options.location - The location of the uniform in the shader program.
     * @param {UniformType} options.type - The data type of the uniform.
     */
    constructor({ gl, location, type }: UniformOptions);
    set(value: number[]): void;
}
