export default class Rectangle {
    west: number;
    south: number;
    east: number;
    north: number;
    static fromDegrees: (west: number, south: number, east: number, north: number, result?: Rectangle | undefined) => Rectangle;
    constructor(west?: number, south?: number, east?: number, north?: number);
}
