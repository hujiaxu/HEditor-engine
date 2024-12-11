import { ComponentDatatype, PrimitiveType } from '../../type';
import Cartesian3 from '../Core/Cartesian3';
import defaultValue from '../Core/DefaultValue';
import Ellipsoid from '../Core/Ellipsoid';
import GeographicProjection from '../Core/GeographicProjection';
import Context from '../Renderer/Context';
import Camera from './Camera';
import FrameState from './FrameState';
import Geometry from './Geometry';
import GeometryAttribute from './GeometryAttribute';
import Globe from './Globe';
import ScreenSpaceCameraController from './ScreenSpaceCameraController';
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
    get screenSpaceCameraController() {
        return this._screenSpaceCameraController;
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
        this._screenSpaceCameraController = new ScreenSpaceCameraController(this);
    }
    pickPositionWorldCoordinates(windowPosition, result = new Cartesian3()) {
        return result;
    }
    draw() {
        const geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    componentsPerAttribute: 2,
                    componentDatatype: ComponentDatatype.FLOAT,
                    values: [0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5]
                }),
                color: new GeometryAttribute({
                    values: [
                        1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
                        0.0, 0.0, 1.0
                    ],
                    componentsPerAttribute: 4,
                    componentDatatype: ComponentDatatype.FLOAT
                })
            },
            indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
            primitiveType: PrimitiveType.TRIANGLES
        });
        const { uniformState } = this._context;
        uniformState.updateCamera(this.camera);
        this._context.draw({
            context: this._context,
            geometry
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQWdCLE1BQU0sWUFBWSxDQUFBO0FBRTNFLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8sb0JBQW9CLE1BQU0sOEJBQThCLENBQUE7QUFDL0QsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUE7QUFDekMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFBO0FBQzdCLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUE7QUFDakMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQTtBQUNuRCxPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDM0IsT0FBTywyQkFBMkIsTUFBTSwrQkFBK0IsQ0FBQTtBQUV2RSxNQUFNLENBQUMsT0FBTyxPQUFPLEtBQUs7SUFDeEIsTUFBTSxDQUFtQjtJQUN6QixRQUFRLENBQVM7SUFDakIsS0FBSyxDQUFPO0lBRUosUUFBUSxDQUFTO0lBQ2pCLFdBQVcsQ0FBWTtJQUN2QixVQUFVLENBQVc7SUFFN0IsTUFBTSxDQUFRO0lBQ04sY0FBYyxDQUFzQjtJQUNwQyxZQUFZLENBQW9CO0lBQ2hDLDRCQUE0QixDQUE2QjtJQUVqRSxJQUFJLDJCQUEyQjtRQUM3QixPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQTtJQUMxQyxDQUFDO0lBQ0QsSUFBSSxhQUFhO1FBQ2YsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFBO0lBQzVCLENBQUM7SUFDRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7SUFDeEIsQ0FB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