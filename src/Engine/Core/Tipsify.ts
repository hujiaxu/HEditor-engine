import { TipsifyOptions, VerticeType } from "../../type";
import defaultValue from "./DefaultValue";
import Defined from "./Defined";

export default class Tipsify {
  static tipsify: (options: TipsifyOptions) => 0 | number[];
}

Tipsify.tipsify = (options: TipsifyOptions) => {

  const indices = options.indices;
  const maximumIndex = options.maximumIndex;
  const cacheSize = defaultValue(options.cacheSize, 24);

  let cursor: number = 0;

  const skipDeadEnd = (vertices: any[], deadEnd: number[], indices: Uint16Array | number[], maximumIndexPlusOne: number) => {
    while (deadEnd.length >= 1) {
      // while the stack is not empty
      const d = deadEnd[deadEnd.length - 1]; // top of the stack
      deadEnd.splice(deadEnd.length - 1, 1); // pop the stack

      if (vertices[d].numLiveTriangles > 0) {
        return d;
      }
    }


    while (cursor < maximumIndexPlusOne) {
      if (vertices[cursor].numLiveTriangles > 0) {
        ++cursor;
        return cursor - 1;
      }
      ++cursor;
    }
    return -1;
  }

  const getNextVertex = (
    indices: Uint16Array | number[], 
    cacheSize: number,
    oneRing: number[],
    vertices: any[],
    s: number,
    deadEnd: number[],
    maximumIndexPlusOne: number
  ) => {
    
    let n = -1;
    let p;
    let m = -1;
    let itOneRing = 0;


    while (itOneRing < oneRing.length) {
      const index = oneRing[itOneRing];
      if (vertices[index].numLiveTriangles) {
        p = 0;
        if (
          s -
            vertices[index].timeStamp +
            2 * vertices[index].numLiveTriangles <=
          cacheSize
        ) {
          p = s - vertices[index].timeStamp;
        }
        if (p > m || m === -1) {
          m = p;
          n = index;
        }
      }
      ++itOneRing;
    }


    if (n === -1) {
      return skipDeadEnd(vertices, deadEnd, indices, maximumIndexPlusOne);
    }
    return n;
  }

  //>>includeStart('debug', pragmas.debug);
  if (!Defined(indices)) {
    throw new Error("indices is required.");
  }
  //>>includeEnd('debug');


  const numIndices = indices.length;

  //>>includeStart('debug', pragmas.debug);
  if (numIndices < 3 || numIndices % 3 !== 0) {
    throw new Error("indices length must be a multiple of three.");
  }
  if (maximumIndex <= 0) {
    throw new Error("maximumIndex must be greater than zero.");
  }
  if (cacheSize < 3) {
    throw new Error("cacheSize must be greater than two.");
  }
  //>>includeEnd('debug');


  // Determine maximum index
  let maximumIndexPlusOne = 0;
  let currentIndex = 0;
  let intoIndices = indices[currentIndex];
  const endIndex = numIndices;

  if (Defined(maximumIndex)) {
    maximumIndexPlusOne = maximumIndex + 1;
  } else {

    while (currentIndex < endIndex) {
      if (intoIndices > maximumIndexPlusOne) {
        maximumIndexPlusOne = intoIndices;
      }
      ++currentIndex;
      intoIndices = indices[currentIndex];
    }
    if (maximumIndexPlusOne === -1) {
      return 0;
    }    
    ++maximumIndexPlusOne;
  }


  // Vertices
  const vertices: VerticeType[] = [];
  let i;


  for (i = 0; i < maximumIndexPlusOne; i++) {
    vertices[i] = {
      numLiveTriangles: 0,
      timeStamp: 0,
      vertexTriangles: [],
    };
  }


  currentIndex = 0;
  let triangle = 0;


  while (currentIndex < endIndex) {
    vertices[indices[currentIndex]].vertexTriangles.push(triangle);
    ++vertices[indices[currentIndex]].numLiveTriangles;
    vertices[indices[currentIndex + 1]].vertexTriangles.push(triangle);
    ++vertices[indices[currentIndex + 1]].numLiveTriangles;
    vertices[indices[currentIndex + 2]].vertexTriangles.push(triangle);
    ++vertices[indices[currentIndex + 2]].numLiveTriangles;
    ++triangle;
    currentIndex += 3;
  }


  // Starting index
  let f = 0;

  // Time Stamp
  let s = cacheSize + 1;
  cursor = 1;

  // Process
  let oneRing = [];
  const deadEnd = []; //Stack
  let vertex;
  let intoVertices;
  let currentOutputIndex = 0;
  const outputIndices = [];
  const numTriangles = numIndices / 3;
  const triangleEmitted = [];
  for (i = 0; i < numTriangles; i++) {
    triangleEmitted[i] = false;
  }
  let index;
  let limit;

  while (f !== -1) {
    oneRing = [];
    intoVertices = vertices[f];
    limit = intoVertices.vertexTriangles.length;
    for (let k = 0; k < limit; ++k) {
      triangle = intoVertices.vertexTriangles[k];
      if (!triangleEmitted[triangle]) {
        triangleEmitted[triangle] = true;
        currentIndex = triangle + triangle + triangle;
        for (let j = 0; j < 3; ++j) {
          // Set this index as a possible next index
          index = indices[currentIndex];
          oneRing.push(index);
          deadEnd.push(index);

          // Output index
          outputIndices[currentOutputIndex] = index;
          ++currentOutputIndex;

          // Cache processing
          vertex = vertices[index];
          --vertex.numLiveTriangles;
          if (s - vertex.timeStamp > cacheSize) {
            vertex.timeStamp = s;
            ++s;
          }
          ++currentIndex;
        }
      }
    }
    f = getNextVertex(
      indices,
      cacheSize,
      oneRing,
      vertices,
      s,
      deadEnd,
      maximumIndexPlusOne,
    );
  }


  return outputIndices;
}