import Matrix4 from '../../Engine/Core/Matrix4';
import HeadingPitchRoll from '../../Engine/Core/HeadingPitchRoll';
import Cartesian3 from '../../Engine/Core/Cartesian3';
import Rectangle from '../../Engine/Core/Rectangle';
export interface OrientationDirectionType {
    direction: Cartesian3;
    up: Cartesian3;
    right?: Cartesian3;
}
export interface CameraViewOptions {
    orientation?: HeadingPitchRoll | OrientationDirectionType;
    endTransform?: Matrix4;
    convert?: boolean;
    destination?: Cartesian3 | Rectangle;
}
