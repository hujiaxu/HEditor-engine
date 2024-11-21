import { PerspectiveFrustumOptions } from '../../type';
export default class PerspectiveFrustum {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    constructor({ fov, aspect, near, far }: PerspectiveFrustumOptions);
}
