import Cartesian3 from '../Core/Cartesian3';
import defaultValue from '../Core/DefaultValue';
import Ellipsoid from '../Core/Ellipsoid';
import GeographicProjection from '../Core/GeographicProjection';
// import HeadingPitchRoll from '../Core/HeadingPitchRoll'
// import Matrix3 from '../Core/Matrix3'
// import Matrix4 from '../Core/Matrix4'
import Context from '../Renderer/Context';
import Camera from './Camera';
import FrameState from './FrameState';
import Globe from './Globe';
import ScreenSpaceCameraController from './ScreenSpaceCameraController';
import ScreenSpaceCameraControllerForEditor from './ScreenSpaceCameraControllerForEditor';
export default class Scene {
    canvas;
    isUseGPU;
    globe;
    _context;
    _frameState;
    _ellipsoid;
    camera;
    _mapProjection;
    _globeHeight;
    _screenSpaceCameraController;
    _screenSpaceCameraControllerForEditor;
    get screenSpaceCameraController() {
        return this._screenSpaceCameraController;
    }
    get screenSpaceCameraControllerForEditor() {
        return this._screenSpaceCameraControllerForEditor;
    }
    get mapProjection() {
        return this._mapProjection;
    }
    get ellipsoid() {
        return this._ellipsoid;
    }
    get drawingBufferWidth() {
        return this._context.gl.drawingBufferWidth;
    }
    get drawingBufferHeight() {
        return this._context.gl.drawingBufferHeight;
    }
    get pixelRatio() {
        return this._frameState.pixelRatio;
    }
    set pixelRatio(value) {
        this._frameState.pixelRatio = value;
    }
    get pickPositionSupported() {
        return this._context.depthTexture;
    }
    get globeHeight() {
        return this._globeHeight;
    }
    get frameState() {
        return this._frameState;
    }
    get mode() {
        return this._frameState.mode;
    }
    constructor(options) {
        this.canvas = options.canvas;
        this.isUseGPU = options.isUseGPU;
        this._context = new Context({
            canvas: this.canvas,
            isUseGPU: this.isUseGPU
        });
        this._frameState = new FrameState({
            context: this._context
        });
        this._ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.default);
        this._mapProjection = defaultValue(options.mapProjection, new GeographicProjection(this._ellipsoid));
        this.camera = new Camera(this);
        this.globe = new Globe(this._ellipsoid);
        // const scale = Matrix4.fromScale(new Cartesian3(0.5, 0.5, 0.5))
        // const scratchMatrix = Matrix4.multiply(scale, this.camera.viewMatrix)
        // const rotation = Matrix4.fromRotation(
        //   Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(0, 0.0, 0.0))
        // )
        // Matrix4.multiply(scratchMatrix, rotation, scratchMatrix)
        // const translation = Matrix4.fromTranslation(new Cartesian3(0.3, 0.3, 0.0))
        // Matrix4.multiply(translation, scratchMatrix, this.camera.viewMatrix)
        // console.log(this.camera.viewMatrix.values, 'this.camera.viewMatrix')
        this._screenSpaceCameraController = new ScreenSpaceCameraController(this);
        this._screenSpaceCameraControllerForEditor =
            new ScreenSpaceCameraControllerForEditor(this);
    }
    pickPositionWorldCoordinates(windowPosition, result = new Cartesian3()) {
        return result;
    }
    draw() {
        this._screenSpaceCameraControllerForEditor.update();
        this.camera.update(this.mode);
        const { uniformState } = this._context;
        uniformState.updateCamera(this.camera);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8sb0JBQW9CLE1BQU0sOEJBQThCLENBQUE7QUFDL0QsMERBQTBEO0FBQzFELHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUE7QUFDekMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFBO0FBQzdCLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDM0IsT0FBTywyQkFBMkIsTUFBTSwrQkFBK0IsQ0FBQTtBQUN2RSxPQUFPLG9DQUFvQyxNQUFNLHdDQUF3QyxDQUFBO0FBRXpGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sS0FBSztJQUN4QixNQUFNLENBQW1CO0lBQ3pCLFFBQVEsQ0FBUztJQUNqQixLQUFLLENBQU87SUFFSixRQUFRLENBQVM7SUFDakIsV0FBVyxDQUFZO0lBQ3ZCLFVBQVUsQ0FBVztJQUU3QixNQUFNLENBQVE7SUFDTixjQUFjLENBQXNCO0lBQ3BDLFlBQVksQ0FBb0I7SUFDaEMsNEJBQTRCLENBQTZCO0lBQ3pELHFDQUFxQyxDQUFzQztJQUVuRixJQUFJLDJCQUEyQjtRQUM3QixPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQTtJQUMxQyxDQUFDO0lBQ0QsSUFBSSxvQ0FBb0M7UUFDdEMsT0FBTyxJQUFJLENBQUMscUNBQXFDLENBQUE7SUFDbkQsQ0FBQztJQUNELElBQUksYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtJQUM1QixDQUFDO0lBQ0QsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBQ3hCLENBQUM7SUFDRCxJQUFJLGtCQUFrQjtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFBO0lBQzVDLENBQUM7SUFFRCxJQUFJLG1CQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFBO0lBQzdDLENBQUM7SUFDRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFBO0lBQ3BDLENBQUM7SUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFhO1FBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQTtJQUNyQyxDQUFDO0lBRUQsSUFBSSxxQkFBcUI7UUFDdkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQTtJQUNuQyxDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQzFCLENBQUM7SUFDRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7SUFDekIsQ0FBQztJQUNELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUE7SUFDOUIsQ0FBQztJQUVELFlBQVksT0FBcUI7UUFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFBO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQTtRQUVoQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksT0FBTyxDQUFDO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQztZQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDdkIsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQzVCLE9BQU8sQ0FBQyxTQUFTLEVBQ2pCLFNBQVMsQ0FBQyxPQUFPLENBQ2xCLENBQUE7UUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLFlBQVksQ0FDaEMsT0FBTyxDQUFDLGFBQWEsRUFDckIsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQzFDLENBQUE7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBRXZDLGlFQUFpRTtRQUNqRSx3RUFBd0U7UUFDeEUseUNBQXlDO1FBQ3pDLG9FQUFvRTtRQUNwRSxJQUFJO1FBQ0osMkRBQTJEO1FBQzNELDZFQUE2RTtRQUM3RSx1RUFBdUU7UUFDdkUsdUVBQXVFO1FBQ3ZFLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3pFLElBQUksQ0FBQyxxQ0FBcUM7WUFDeEMsSUFBSSxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsRCxDQUFDO0lBRU0sNEJBQTRCLENBQ2pDLGNBQTBCLEVBQzFCLFNBQXFCLElBQUksVUFBVSxFQUFFO1FBRXJDLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLENBQUMscUNBQXFDLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzdCLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO1FBQ3RDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3hDLENBQUM7Q0FDRiJ9