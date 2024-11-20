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
    constructor({ gl }: UniformOptions);
    set(): void;
}
