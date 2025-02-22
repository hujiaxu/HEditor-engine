export default class Color {
    static floatToByte: (f: number) => number;
    red: number;
    green: number;
    blue: number;
    alpha: number;
    static byteToFloat: (b: number) => number;
    static fromBytes: (r: number, g: number, b: number, a: number, result?: Color) => Color;
    static fromRgba: (rgba: number, result?: Color) => Color;
    constructor(red?: number, green?: number, blue?: number, alpha?: number);
}
