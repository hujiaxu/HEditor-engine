export default class AssociativeArray<T> {
    private _array;
    private _hash;
    get values(): T[];
    get length(): number;
    contains(key: string | number): boolean;
    set(key: string | number, value: T): void;
    get(key: string | number): T;
    remove(key: string | number): boolean;
    removeAll(): void;
}
