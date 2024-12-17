export default class Cartographic {
    longitude: number;
    latitude: number;
    height: number;
    static clone: (cartographic: Cartographic, result?: Cartographic) => Cartographic;
    constructor(longitude?: number, latitude?: number, height?: number);
}
