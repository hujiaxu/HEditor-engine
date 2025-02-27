import { AppearanceOptions } from '../../type';
import Material from './Material';
export default class Appearance {
    pixelSize: number | undefined;
    material: Material;
    translucent: boolean;
    private _vertexShaderSource;
    private _fragmentShaderSource;
    private _renderState;
    private _closed;
    get closed(): boolean;
    get vertexShaderSource(): string | undefined;
    get fragmentShaderSource(): string | undefined;
    get renderState(): object | undefined;
    constructor(options: AppearanceOptions);
    isTranslucent(): any;
}
