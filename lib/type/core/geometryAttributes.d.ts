export declare enum ComponentDatatype {
    FLOAT,
    FLOAT_VEC2,
    FLOAT_VEC3,
    FLOAT_VEC4,
    INT,
    INT_VEC2,
    INT_VEC3,
    INT_VEC4,
    BOOL,
    BOOL_VEC2,
    BOOL_VEC3,
    BOOL_VEC4,
    FLOAT_MAT2,
    FLOAT_MAT3,
    FLOAT_MAT4,
    SAMPLER_2D,
    SAMPLER_CUBE
}
export interface GeometryAttributeOptions {
    componentDatatype: ComponentDatatype;
    componentsPerAttribute: number;
    values: number[];
}
