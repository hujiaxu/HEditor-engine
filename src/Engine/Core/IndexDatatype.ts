import Defined from "./Defined";
import HEditorMath from "./Math";

export default class IndexDataType {
  static createTypedArray: (numberOfVertices: number, indicesLengthOrArray: number) => Uint32Array<ArrayBuffer> | Uint16Array<ArrayBuffer>;
}

IndexDataType.createTypedArray = (numberOfVertices: number, indicesLengthOrArray: number) => {

  //>>includeStart('debug', pragmas.debug);
  if (!Defined(numberOfVertices)) {
    throw new Error("numberOfVertices is required.");
  }
  //>>includeEnd('debug');


  if (numberOfVertices >= HEditorMath.SIXTY_FOUR_KILOBYTES) {
    return new Uint32Array(indicesLengthOrArray);
  }

  // 2^16 - 1
  return new Uint16Array(indicesLengthOrArray);
}