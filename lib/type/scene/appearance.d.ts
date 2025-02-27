import { Material } from '../../Engine';
export interface AppearanceOptions {
    material: Material;
    translucent?: boolean;
    vertexShaderSource?: string;
    fragmentShaderSource?: string;
    renderState?: object;
    closed?: boolean;
}
