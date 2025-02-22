export default class DeveloperError {
    message: string;
    stack: string | undefined;
    readonly name: string;
    constructor(message: string);
    throwInstantiationError(): void;
}
