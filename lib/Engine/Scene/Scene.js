import { ComponentDatatype, PrimitiveType } from '../../type';
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
import Geometry from './Geometry';
import GeometryAttribute from './GeometryAttribute';
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
        const geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    componentsPerAttribute: 3,
                    componentDatatype: ComponentDatatype.FLOAT,
                    values: [
                        // Front face
                        // v1
                        -0.5, -0.5, 0.5,
                        // v2
                        0.5, -0.5, 0.5,
                        // v3
                        0.5, 0.5, 0.5,
                        // v4
                        -0.5, 0.5, 0.5,
                        // Back face
                        // v5
                        -0.5, -0.5, -0.5,
                        // v6
                        0.5, -0.5, -0.5,
                        // v7
                        0.5, 0.5, -0.5,
                        // v8
                        -0.5, 0.5, -0.5,
                        // Left face
                        -0.5, -0.5, -0.5,
                        // v9
                        -0.5, -0.5, 0.5,
                        // v10
                        -0.5, 0.5, 0.5,
                        // v11
                        -0.5, 0.5, -0.5,
                        // Right face
                        // v12
                        0.5, -0.5, -0.5,
                        // v13
                        0.5, -0.5, 0.5,
                        // v14
                        0.5, 0.5, 0.5,
                        // v15
                        0.5, 0.5, -0.5,
                        // Top face
                        // v16
                        -0.5, 0.5, -0.5,
                        // v17
                        0.5, 0.5, -0.5,
                        // v18
                        0.5, 0.5, 0.5,
                        // v19
                        -0.5, 0.5, 0.5,
                        // Bottom face
                        // v20
                        -0.5, -0.5, -0.5,
                        // v21
                        0.5, -0.5, -0.5,
                        // v22
                        0.5, -0.5, 0.5,
                        // v23
                        -0.5, -0.5, 0.5
                    ]
                }),
                color: new GeometryAttribute({
                    values: [
                        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
                        1.0, 0.0, 1.0,
                        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
                        1.0, 0.0, 1.0,
                        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
                        1.0, 0.0, 1.0,
                        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
                        1.0, 0.0, 1.0,
                        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
                        1.0, 0.0, 1.0,
                        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
                        1.0, 0.0, 1.0
                    ],
                    componentsPerAttribute: 4,
                    componentDatatype: ComponentDatatype.FLOAT
                })
            },
            indices: new Uint16Array([
                // Front face
                4, 5, 6, 4, 6, 7,
                // Back face
                0, 3, 2, 0, 2, 1,
                // Left face
                0, 7, 3, 0, 4, 7,
                // Right face
                1, 2, 6, 1, 6, 5,
                // Top face
                3, 2, 6, 3, 6, 7,
                // Bottom face
                0, 1, 5, 0, 5, 4
            ]),
            primitiveType: PrimitiveType.TRIANGLES
        });
        this.camera.update(this.mode);
        const { uniformState } = this._context;
        uniformState.updateCamera(this.camera);
        this._context.draw({
            context: this._context,
            geometry
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQWdCLE1BQU0sWUFBWSxDQUFBO0FBRTNFLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8sb0JBQW9CLE1BQU0sOEJBQThCLENBQUE7QUFDL0QsMERBQTBEO0FBQzFELHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUE7QUFDekMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFBO0FBQzdCLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUE7QUFDakMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQTtBQUNuRCxPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDM0IsT0FBTywyQkFBMkIsTUFBTSwrQkFBK0IsQ0FBQTtBQUN2RSxPQUFPLG9DQUFvQyxNQUFNLHdDQUF3QyxDQUFBO0FBRXpGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sS0FBSztJQUN4QixNQUFNLENBQW1CO0lBQ3pCLFFBQVEsQ0FBUztJQUNqQixLQUFLLENBQU87SUFFSixRQUFRLENBQVM7SUFDakIsV0FBVyxDQUFZO0lBQ3ZCLFVBQVUsQ0FBVztJQUU3QixNQUFNLENBQVE7SUFDTixjQUFjLENBQXNCO0lBQ3BDLFlBQVksQ0FBb0I7SUFDaEMsNEJBQTRCLENBQTZCO0lBQ3pELHFDQUFxQyxDQUFzQztJQUVuRixJQUFJLDJCQUEyQjtRQUM3QixPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQTtJQUMxQyxDQUFDO0lBQ0QsSUFBSSxvQ0FBb0M7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