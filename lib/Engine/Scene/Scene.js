import { ComponentDatatype, PrimitiveType } from '../../type';
import Cartesian3 from '../Core/Cartesian3';
import defaultValue from '../Core/DefaultValue';
import Ellipsoid from '../Core/Ellipsoid';
import GeographicProjection from '../Core/GeographicProjection';
import Matrix4 from '../Core/Matrix4';
// import HeadingPitchRoll from '../Core/HeadingPitchRoll'
// import Matrix3 from '../Core/Matrix3'
// import Matrix4 from '../Core/Matrix4'
import Context from '../Renderer/Context';
import Camera from './Camera';
import FrameState from './FrameState';
import Geometry from '../Core/Geometry';
import GeometryAttribute from '../Core/GeometryAttribute';
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
            primitiveType: PrimitiveType.TRIANGLES,
            modelMatrix: Matrix4.IDENTITY
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQWdCLE1BQU0sWUFBWSxDQUFBO0FBRTNFLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8sb0JBQW9CLE1BQU0sOEJBQThCLENBQUE7QUFDL0QsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFDckMsMERBQTBEO0FBQzFELHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUE7QUFDekMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFBO0FBQzdCLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFFBQVEsTUFBTSxrQkFBa0IsQ0FBQTtBQUN2QyxPQUFPLGlCQUFpQixNQUFNLDJCQUEyQixDQUFBO0FBQ3pELE9BQU8sS0FBSyxNQUFNLFNBQVMsQ0FBQTtBQUMzQixPQUFPLDJCQUEyQixNQUFNLCtCQUErQixDQUFBO0FBQ3ZFLE9BQU8sb0NBQW9DLE1BQU0sd0NBQXdDLENBQUE7QUFFekYsTUFBTSxDQUFDLE9BQU8sT0FBTyxLQUFLO0lBQ3hCLE1BQU0sQ0FBbUI7SUFDekIsUUFBUSxDQUFTO0lBQ2pCLEtBQUssQ0FBTztJQUVKLFFBQVEsQ0FBUztJQUNqQixXQUFXLENBQVk7SUFDdkIsVUFBVSxDQUFXO0lBRTdCLE1BQU0sQ0FBUTtJQUNOLGNBQWMsQ0FBc0I7SUFDcEMsWUFBWSxDQUFvQjtJQUNoQyw0QkFBNEIsQ0FBNkI7SUFDekQscUNBQXFDLENBQXNDO0lBRW5GLElBQUksMkJBQTJCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLDRCQUE0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