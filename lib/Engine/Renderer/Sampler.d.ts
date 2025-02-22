import { SamplerOptions } from '../../type';
export default class Sampler {
    private _wrapS;
    private _wrapT;
    private _minificationFilter;
    private _magnificationFilter;
    private _maximumAnisotropy;
    static NEAREST: Sampler;
    get wrapS(): number;
    get wrapT(): number;
    get minificationFilter(): number;
    get magnificationFilter(): number;
    get maximumAnisotropy(): number;
    constructor(options?: SamplerOptions);
}
