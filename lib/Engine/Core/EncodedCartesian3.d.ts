import Cartesian3 from './Cartesian3';
interface EncodeResult {
    high: number;
    low: number;
}
export default class EncodedCartesian3 {
    high: Cartesian3;
    low: Cartesian3;
    static fromCartesian: (cartesian: Cartesian3, result?: EncodedCartesian3) => EncodedCartesian3;
    constructor(high?: Cartesian3, low?: Cartesian3);
    static encode: (value: number, result?: EncodeResult) => EncodeResult;
}
export {};
