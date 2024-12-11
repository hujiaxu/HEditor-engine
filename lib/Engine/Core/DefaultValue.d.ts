declare const defaultValue: {
    <T>(a: T | undefined, b: T): T;
    EMPTY_OBJECT: Readonly<{}>;
};
export default defaultValue;
