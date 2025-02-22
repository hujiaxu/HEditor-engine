import Context from './Context';
declare const PixelDatatype: {
    UNSIGNED_INT: 5125;
    UNSIGNED_BYTE: 5121;
    UNSIGNED_SHORT: 5123;
    FLOAT: 5126;
    HALF_FLOAT: 5131;
    UNSIGNED_INT_24_8: 34042;
    UNSIGNED_SHORT_4_4_4_4: 32819;
    UNSIGNED_SHORT_5_5_5_1: 32820;
    UNSIGNED_SHORT_5_6_5: 33635;
    toWebGLConstant: (pixelDatatype: number, context: Context) => 5126 | 5121 | 5123 | 5125 | 5131 | 34042 | 32819 | 32820 | 33635 | 36193 | undefined;
    validate: (pixelDatatype: number) => pixelDatatype is 5126 | 5121 | 5123 | 5125 | 5131 | 34042 | 32819 | 32820 | 33635;
    getTypedArrayConstructor: (pixelDatatype: number) => Float32ArrayConstructor | Uint8ArrayConstructor | Uint32ArrayConstructor | Uint16ArrayConstructor;
    sizeInBytes: (pixelDatatype: number) => 1 | 2 | 4 | undefined;
    isPacked: (pixelDatatype: number) => pixelDatatype is 34042 | 32819 | 32820 | 33635;
};
export default PixelDatatype;
