import BoundingRectangle from '../Core/BoundingRectangle';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import Cartesian4 from '../Core/Cartesian4';
import FrameState from './FrameState';
import Scene from './Scene';
export default class SceneTransforms {
    static computeActualEllipsoidPosition: (frameState: FrameState, position: Cartesian3, result?: Cartesian3) => Cartesian3 | undefined;
    static clipToGLWindowCoordinates: (viewport: BoundingRectangle, position: Cartesian4, result?: Cartesian2) => Cartesian2;
    static worldWithEyeOffsetToWindowCoordinates: (scene: Scene, position: Cartesian3, eyeOffset: Cartesian3, result?: Cartesian2) => Cartesian2 | undefined;
    static worldToWindowCoordinates: (scene: Scene, position: Cartesian3, result?: Cartesian2) => Cartesian2 | undefined;
}
