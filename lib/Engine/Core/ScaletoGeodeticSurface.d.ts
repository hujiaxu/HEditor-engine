import Cartesian3 from './Cartesian3';
declare const scaleToGeodeticSurface: (cartesian: Cartesian3, oneOverRadii: Cartesian3, oneOverRadiiSquared: Cartesian3, centerToleranceSquared: number, result?: Cartesian3) => Cartesian3 | undefined;
export default scaleToGeodeticSurface;
