import { ContextType, UniformStateOptions } from '../../type';
import Camera from '../Scene/Camera';
export default class UniformState {
    gl: ContextType;
    uniformMap: {
        [key: string]: number[];
    };
    constructor({ gl }: UniformStateOptions);
    update(uniformState: UniformState): void;
    updateCamera(camera: Camera): void;
}
