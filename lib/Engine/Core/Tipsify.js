import defaultValue from './DefaultValue';
import Defined from './Defined';
export default class Tipsify {
    static tipsify;
}
Tipsify.tipsify = (options) => {
    const indices = options.indices;
    const maximumIndex = options.maximumIndex;
    const cacheSize = defaultValue(options.cacheSize, 24);
    let cursor = 0;
    const skipDeadEnd = (vertices, deadEnd, indices, maximumIndexPlusOne) => {
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
    };
    const getNextVertex = (indices, cacheSize, oneRing, vertices, s, deadEnd, maximumIndexPlusOne) => {
        let n = -1;
        let p;
        let m = -1;
        let itOneRing = 0;
        while (itOneRing < oneRing.length) {
            const index = oneRing[itOneRing];
            if (vertices[index].numLiveTriangles) {
                p = 0;
                if (s -
                    vertices[index].timeStamp +
                    2 * vertices[index].numLiveTriangles <=
                    cacheSize) {
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
    };
    // >>includeStart('debug', pragmas.debug);
    if (!Defined(indices)) {
        throw new Error('indices is required.');
    }
    // >>includeEnd('debug');
    const numIndices = indices.length;
    // >>includeStart('debug', pragmas.debug);
    if (numIndices < 3 || numIndices % 3 !== 0) {
        throw new Error('indices length must be a multiple of three.');
    }
    if (maximumIndex <= 0) {
        throw new Error('maximumIndex must be greater than zero.');
    }
    if (cacheSize < 3) {
        throw new Error('cacheSize must be greater than two.');
    }
    // >>includeEnd('debug');
    // Determine maximum index
    let maximumIndexPlusOne = 0;
    let currentIndex = 0;
    let intoIndices = indices[currentIndex];
    const endIndex = numIndices;
    if (Defined(maximumIndex)) {
        maximumIndexPlusOne = maximumIndex + 1;
    }
    else {
        while (currentIndex < endIndex) {
            if (intoIndices > maximumIndexPlusOne) {
                maximumIndexPlusOne = intoIndices;
            }
            ++currentIndex;
            intoIndices = indices[currentIndex];
        }
        if (maximumIndexPlusOne === -1) {
            return new Uint16Array(0);
        }
        ++maximumIndexPlusOne;
    }
    // Vertices
    const vertices = [];
    let i;
    for (i = 0; i < maximumIndexPlusOne; i++) {
        vertices[i] = {
            numLiveTriangles: 0,
            timeStamp: 0,
            vertexTriangles: []
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
    const deadEnd = []; // Stack
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
        f = getNextVertex(indices, cacheSize, oneRing, vertices, s, deadEnd, maximumIndexPlusOne);
    }
    return new Uint16Array(outputIndices);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlwc2lmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9UaXBzaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUUvQixNQUFNLENBQUMsT0FBTyxPQUFPLE9BQU87SUFDMUIsTUFBTSxDQUFDLE9BQU8sQ0FBa0Q7Q0FDakU7QUFFRCxPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsT0FBdUIsRUFBdUIsRUFBRTtJQUNqRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0lBQy9CLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUE7SUFDekMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFckQsSUFBSSxNQUFNLEdBQVcsQ0FBQyxDQUFBO0lBRXRCLE1BQU0sV0FBVyxHQUFHLENBQ2xCLFFBQWUsRUFDZixPQUFpQixFQUNqQixPQUE2QyxFQUM3QyxtQkFBMkIsRUFDM0IsRUFBRTtRQUNGLE9BQU8sT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQiwrQkFBK0I7WUFDL0IsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUEsQ0FBQyxtQkFBbUI7WUFDekQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxDQUFDLGdCQUFnQjtZQUV0RCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsT0FBTyxDQUFDLENBQUE7WUFDVixDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sTUFBTSxHQUFHLG1C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