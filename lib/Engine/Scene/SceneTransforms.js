import { SceneMode } from '../../type';
import BoundingRectangle from '../Core/BoundingRectangle';
import Cartesian2 from '../Core/Cartesian2';
import Cartesian3 from '../Core/Cartesian3';
import Cartesian4 from '../Core/Cartesian4';
import defined from '../Core/Defined';
import Matrix4 from '../Core/Matrix4';
import OrthographicFrustum from '../Core/OrthographicFrustum';
import OrthographicOffCenterFrustum from '../Core/OrthographicOffCenterFrustum';
const worldToClip = (position, eyeOffset, camera, result) => {
    const viewMatrix = camera.viewMatrix;
    const positionEC = Matrix4.multiplyByVector(viewMatrix, Cartesian4.fromElements(position.x, position.y, position.z, 1.0));
    const zEyeOffset = Cartesian3.multiplyComponents(eyeOffset, Cartesian3.normalize(positionEC, new Cartesian3()));
    positionEC.x += eyeOffset.x + zEyeOffset.x;
    positionEC.y += eyeOffset.y + zEyeOffset.y;
    positionEC.z += zEyeOffset.z;
    return Matrix4.multiplyByVector(camera.frustum.projectionMatrix, positionEC, result);
};
export default class SceneTransforms {
    static computeActualEllipsoidPosition;
    static clipToGLWindowCoordinates;
    static worldWithEyeOffsetToWindowCoordinates;
    static worldToWindowCoordinates;
}
SceneTransforms.computeActualEllipsoidPosition = function (frameState, position, result) {
    const mode = frameState.mode;
    if (mode === SceneMode.SCENE3D) {
        return Cartesian3.clone(position, result);
    }
};
SceneTransforms.clipToGLWindowCoordinates = function (viewport, position, result) {
    Cartesian3.divideByScalar(position, position.w, position);
    const viewportTransform = Matrix4.computeViewportTransformation(viewport, 0.0, 1.0);
    const positionWC = Matrix4.multiplyByPoint(viewportTransform, new Cartesian3());
    return Cartesian2.fromCartesian3(positionWC, result);
};
SceneTransforms.worldWithEyeOffsetToWindowCoordinates = function (scene, position, eyeOffset, result = new Cartesian2()) {
    if (!defined(scene)) {
        throw new Error('scene is required');
    }
    if (!defined(position)) {
        throw new Error('position is required');
    }
    const frameState = scene.frameState;
    const actualPosition = SceneTransforms.computeActualEllipsoidPosition(frameState, position);
    if (!defined(actualPosition)) {
        return undefined;
    }
    const canvas = scene.canvas;
    const viewport = new BoundingRectangle();
    viewport.x = 0;
    viewport.y = 0;
    viewport.width = canvas.clientWidth;
    viewport.height = canvas.clientHeight;
    const camera = scene.camera;
    const cameraCentered = false;
    if (frameState.mode !== SceneMode.SCENE2D || cameraCentered) {
        const positionCC = worldToClip(actualPosition, eyeOffset, camera);
        if (positionCC.z < 0 &&
            !(camera.frustum instanceof OrthographicFrustum) &&
            !(camera.frustum instanceof OrthographicOffCenterFrustum)) {
            return undefined;
        }
        result = SceneTransforms.clipToGLWindowCoordinates(viewport, positionCC, result);
    }
    return result;
};
SceneTransforms.worldToWindowCoordinates = function (scene, position, result) {
    return SceneTransforms.worldWithEyeOffsetToWindowCoordinates(scene, position, Cartesian3.ZERO, result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVUcmFuc2Zvcm1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9TY2VuZVRyYW5zZm9ybXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUN0QyxPQUFPLGlCQUFpQixNQUFNLDJCQUEyQixDQUFBO0FBQ3pELE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sbUJBQW1CLE1BQU0sNkJBQTZCLENBQUE7QUFDN0QsT0FBTyw0QkFBNEIsTUFBTSxzQ0FBc0MsQ0FBQTtBQU0vRSxNQUFNLFdBQVcsR0FBRyxDQUNsQixRQUFvQixFQUNwQixTQUFxQixFQUNyQixNQUFjLEVBQ2QsTUFBbUIsRUFDbkIsRUFBRTtJQUNGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUE7SUFFcEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUN6QyxVQUFVLEVBQ1YsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FDakUsQ0FBQTtJQUVELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FDOUMsU0FBUyxFQUNULFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksVUFBVSxFQUFFLENBQUMsQ0FDbkQsQ0FBQTtJQUNELFVBQVUsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFB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