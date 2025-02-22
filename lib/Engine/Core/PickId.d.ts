import { PickObject, PickObjects } from '../../type';
import Color from './Color';
export default class PickId {
    private _pickObjects;
    readonly key: number;
    readonly color: Color;
    get pickObject(): PickObject;
    set pickObject(pickObject: PickObject);
    constructor(pickObjects: PickObjects, key: number, color: Color);
}
