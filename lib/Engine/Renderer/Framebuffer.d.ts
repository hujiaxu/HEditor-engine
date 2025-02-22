import { FramebufferOptions } from '../../type';
export default class Framebuffer {
    private _gl;
    private _framebuffer;
    constructor(options: FramebufferOptions);
    bind(): void;
    unBind(): void;
}
