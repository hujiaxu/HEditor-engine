export type HEditorMathOptions = {
    PI: number;
    cos: (radians: number) => number;
    sin: (radians: number) => number;
    toRadians: (degrees: number) => number;
    toDegrees: (radians: number) => number;
    RADIANS_PER_DEGREE: number;
    DEGREES_PER_RADIAN: number;
    EPSILON2: number;
};
