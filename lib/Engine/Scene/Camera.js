import Cartesian3 from '../Core/Cartesian3';
import HEditorMath from '../Core/Math';
import PerspectiveFrustum from './PerspectiveFrustum';
export default class Camera {
    _position = new Cartesian3();
    _rotation = new Cartesian3();
    _direction = new Cartesian3(0, 0, 1);
    _up = new Cartesian3(0, 1, 0);
    _right = new Cartesian3(1, 0, 0);
    scene;
    perspectiveFrustum;
    constructor(scene) {
        this.scene = scene;
        const aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight;
        const fov = HEditorMath.toRadians(45);
        const near = 0.1;
        const far = 1000;
        this.perspectiveFrustum = new PerspectiveFrustum({
            fov,
            aspect: aspectRatio,
            near,
            far
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtZXJhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9DYW1lcmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sa0JBQWtCLE1BQU0sc0JBQXNCLENBQUE7QUFHckQsTUFBTSxDQUFDLE9BQU8sT0FBTyxNQUFNO0lBQ2pCLFNBQVMsR0FBZSxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBQ3hDLFNBQVMsR0FBZSxJQUFJLFVBQVUsRUFBRSxDQUFBO0lBQ3hDLFVBQVUsR0FBZSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2hELEdBQUcsR0FBZSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sR0FBZSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRXBELEtBQUssQ0FBTztJQUNaLGtCQUFrQixDQUFvQjtJQUV0QyxZQUFZLEtBQVk7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7UUFFbEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQTtRQUN4RSxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQTtRQUNoQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUE7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksa0JBQWtCLENBQUM7WUFDL0MsR0FBRztZQUNILE1BQU0sRUFBRSxXQUFXO1lBQ25CLElBQUk7WUFDSixHQUFHO1NBQ0osQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGIn0=