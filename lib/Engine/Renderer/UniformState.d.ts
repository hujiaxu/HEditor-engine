import { ContextType, UniformStateOptions } from '../../type';
export default class UniformState {
    gl: ContextType;
    uniformMap: {
        [key: string]: number[];
    };
    constructor({ gl }: UniformStateOptions);
    update(uniformState: UniformState): void;
}
