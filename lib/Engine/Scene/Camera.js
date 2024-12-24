import Cartesian3 from '../Core/Cartesian3';
import defined from '../Core/Defined';
import HEditorMath from '../Core/Math';
import Matrix4 from '../Core/Matrix4';
import Ray from '../Core/Ray';
import PerspectiveFrustum from '../Core/PerspectiveFrustum';
import OrthographicFrustum from '../Core/OrthographicFrustum';
import Cartographic from '../Core/Cartographic';
import Cartesian4 from '../Core/Cartesian4';
import defaultValue from '../Core/DefaultValue';
import Quaternion from '../Core/Quaternion';
import Matrix3 from '../Core/Matrix3';
import Ellipsoid from '../Core/Ellipsoid';
import IntersectionTests from '../Core/IntersectionTests';
import { SceneMode } from '../../type';
import HeadingPitchRoll from '../Core/HeadingPitchRoll';
import Rectangle from '../Core/Rectangle';
import Transforms from '../Core/Transforms';
import EllipsoidGeodesic from '../Core/EllipsoidGeodesic';
const defaultRF = {
    direction: new Cartesian3(),
    right: new Cartesian3(),
    up: new Cartesian3()
};
export default class Camera {
    position = new Cartesian3(0.0, 0.0, -10);
    direction = new Cartesian3(0.0, 0.0, 0.5);
    up = new Cartesian3(0.0, 0.5, 0.0);
    right = new Cartesian3(0.5, 0.0, 0.0);
    constrainedAxis;
    positionWC = new Cartesian3();
    directionWC = new Cartesian3();
    upWC = new Cartesian3();
    rightWC = new Cartesian3();
    _positionWC = new Cartesian3();
    _directionWC = new Cartesian3();
    _upWC = new Cartesian3();
    _rightWC = new Cartesian3();
    _position = new Cartesian3();
    _direction = new Cartesian3();
    _up = new Cartesian3();
    _right = new Cartesian3();
    _transform = new Matrix4();
    _transformChanged = false;
    _modeChanged = false;
    _defaultLookAmount = Math.PI / 60.0;
    _defaultRotateAmount = Math.PI / 3600.0;
    _defaultZoomAmount = 100000.0;
    _actualTransform = Matrix4.clone(Matrix4.IDENTITY);
    _actualInvTransform = Matrix4.clone(Matrix4.IDENTITY);
    _viewMatrix = Matrix4.clone(Matrix4.IDENTITY);
    _invViewMatrix = Matrix4.clone(Matrix4.IDENTITY);
    scene;
    _projection;
    _positionCartographic;
    _maxCoord;
    _mode;
    heading = 0.0;
    pitch = -HEditorMath.PI_OVER_TWO;
    roll = 0.0;
    static DEFAULT_VIEW_RECTANGLE;
    get viewMatrix() {
        this._updateMembers();
        return this._viewMatrix;
    }
    get transform() {
        return this._transform;
    }
    get positionCartographic() {
        this._updateMembers();
        return this._positionCartographic;
    }
    frustum;
    constructor(scene) {
        this.scene = scene;
        const aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight;
        const fov = HEditorMath.toRadians(65.0);
        const near = 0.1;
        const far = 10000;
        this.frustum = new PerspectiveFrustum({
            fov,
            aspectRatio,
            near,
            far
        });
        const projection = scene.mapProjection;
        this._projection = projection;
        this.updateViewMatrix(this);
        this._maxCoord = projection.project(new Cartographic(Math.PI, HEditorMath.PI_OVER_TWO));
        this._positionCartographic = new Cartographic();
        this._mode = SceneMode.SCENE3D;
        // this._rectangleCameraPosition3D(
        //   Camera.DEFAULT_VIEW_RECTANGLE,
        //   this.position,
        //   true
        // )
    }
    update(mode) {
        if (this._mode !== mode) {
            this._mode = mode;
        }
    }
    _updateMembers() {
        let position = this._position;
        const positionChanged = !Cartesian3.equals(this.position, position);
        if (positionChanged) {
            position = Cartesian3.clone(this.position, this._position);
        }
        let direction = this._direction;
        const directionChanged = !Cartesian3.equals(this.direction, direction);
        if (directionChanged) {
            Cartesian3.normalize(this.direction, this.direction);
            direction = Cartesian3.clone(this.direction, this._direction);
        }
        let up = this._up;
        const upChanged = !Cartesian3.equals(this.up, up);
        if (upChanged) {
            Cartesian3.normalize(this.up, this.up);
            up = Cartesian3.clone(this.up, this._up);
        }
        let right = this._right;
        const rightChanged = !Cartesian3.equals(this.right, right);
        if (rightChanged) {
            Cartesian3.normalize(this.right, this.right);
            right = Cartesian3.clone(this.right, this._right);
        }
        const transformChanged = this._transformChanged || this._modeChanged;
        this._transformChanged = false;
        if (transformChanged) {
            Matrix4.inverseTransformation(this._transform, this._actualInvTransform);
            Matrix4.clone(this._transform, this._actualTransform);
            Matrix4.inverseTransformation(this._actualTransform, this._actualInvTransform);
            this._modeChanged = false;
        }
        const transform = this._actualTransform;
        if (positionChanged || transformChanged) {
            this._positionWC = Matrix4.multiplyByPoint(transform, position, this._positionWC);
            this._positionCartographic =
                this._projection.ellipsoid.cartesianToCartographic(this._positionWC, this._positionCartographic);
        }
        if (directionChanged || upChanged || rightChanged) {
            const det = Cartesian3.dot(direction, Cartesian3.cross(up, right, new Cartesian3()));
            if (Math.abs(1.0 - det) > HEditorMath.EPSILON2) {
                const invUpMag = 1.0 / Cartesian3.magnitudeSquared(up);
                const scalar = Cartesian3.dot(up, direction) * invUpMag;
                const w0 = Cartesian3.multiplyByScalar(direction, scalar);
                up = Cartesian3.normalize(Cartesian3.subtract(up, w0, this._up), this._up);
                Cartesian3.clone(up, this.up);
                right = Cartesian3.cross(direction, up, this._right);
                Cartesian3.clone(right, this.right);
            }
        }
        if (directionChanged || transformChanged) {
            this._directionWC = Matrix4.multiplyByPointAsVector(transform, direction, this._directionWC);
            Cartesian3.normalize(this._directionWC, this._directionWC);
        }
        if (upChanged || transformChanged) {
            this._upWC = Matrix4.multiplyByPointAsVector(transform, up, this._upWC);
            Cartesian3.normalize(this._upWC, this._upWC);
        }
        if (rightChanged || transformChanged) {
            this._rightWC = Matrix4.multiplyByPointAsVector(transform, right, this._rightWC);
            Cartesian3.normalize(this._rightWC, this._rightWC);
        }
        if (positionChanged ||
            directionChanged ||
            upChanged ||
            rightChanged ||
            transformChanged) {
            this.updateViewMatrix(this);
        }
    }
    _calculateOrthographicFrustumWidth() {
        if (!Matrix4.equals(Matrix4.IDENTITY, this.transform)) {
            return Cartesian3.magnitude(this.position);
        }
        const scene = this.scene;
        const globe = scene.globe;
        console.log('globe: ', globe);
    }
    _adjustOrthographicFrustum(zooming) {
        if (!(this.frustum instanceof OrthographicFrustum))
            return;
        if (!zooming && this._positionCartographic.height < 150000.0) {
            return;
        }
        this.frustum.width =
            this._calculateOrthographicFrustumWidth() || this.frustum.width;
    }
    updateViewMatrix(camera) {
        Matrix4.computeView(camera._position, camera._direction, camera._up, camera._right, this._viewMatrix);
        Matrix4.multiply(this._viewMatrix, this._actualInvTransform, this._viewMatrix);
        Matrix4.inverseTransformation(this._viewMatrix, this._invViewMatrix);
    }
    getPickRay(windowPos, result) {
        if (!defined(windowPos)) {
            throw new Error('windowPos is required');
        }
        if (!defined(result)) {
            result = new Ray();
        }
        const canvas = this.scene.canvas;
        if (canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
            return new Ray();
        }
        const frustum = this.frustum;
        if (frustum instanceof PerspectiveFrustum &&
            defined(frustum.aspectRatio) &&
            defined(frustum.fov) &&
            defined(frustum.near)) {
            return this._getPickRayPerspective(this, windowPos, result);
        }
        return this._getPickRayOrthographic(this, windowPos, result);
    }
    _getPickRayPerspective(camera, windowPos, result) {
        const canvas = camera.scene.canvas;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const frustum = camera.frustum;
        const tanPhi = Math.tan(frustum.fovy * 0.5);
        const tanTheta = frustum.aspectRatio * tanPhi;
        const near = frustum.near;
        const x = (2.0 / width) * windowPos.x - 1.0;
        const y = (2.0 / height) * (height - windowPos.y) - 1.0;
        const position = camera.positionWC;
        Cartesian3.clone(position, result.origin);
        // 这里由于透视投影模拟了 物体远近对视觉的影响, 视场是有限的, 射线从相机位置出发, 并根据深度变化来确定方向
        // 从屏幕坐标映射到三维空间里的点, 投射到近裁剪面与其他的点投射到近裁剪面的点 不是平行的
        // 及屏幕坐标以相机形成的射线 必定与 相机的 近裁剪面形成交点, 这个交点会与相机的视线有左右的偏移
        // 而这个交点与相机的位置形成射线就是最终要的射线
        // nearCenter 可以看作是 屏幕中心 与 相机形成 射线的 交点, 并且以 nearCenter 为基准点
        // xDir 与 yDir 分别是 屏幕坐标 在近裁剪面相对于 nearCenter 的偏移量
        const nearCenter = Cartesian3.multiplyByScalar(camera.directionWC, near);
        Cartesian3.add(position, nearCenter, nearCenter);
        const xDir = Cartesian3.multiplyByScalar(camera.rightWC, x * near * tanTheta);
        const yDir = Cartesian3.multiplyByScalar(camera.upWC, y * near * tanPhi);
        const direction = Cartesian3.add(nearCenter, xDir, result.direction);
        Cartesian3.add(direction, yDir, direction);
        Cartesian3.subtract(direction, position, direction);
        Cartesian3.normalize(direction, direction);
        return result;
    }
    _getPickRayOrthographic(camera, windowPos, result) {
        const canvas = camera.scene.canvas;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        // 这里 正交投影 无需模拟物体远近对视觉的影响,
        // 从屏幕坐标映射到三维空间里的点, 投射到近裁剪面与其他的点投射到近裁剪面的点 是平行的, 且与相机的视线平行
        // 所以只需计算射线的起始点即可
        const frustum = camera.frustum;
        const offCenterFrustum = frustum.offCenterFrustum;
        let x = (2.0 / width) * windowPos.x - 1.0;
        let y = (2.0 / height) * (height - windowPos.y) - 1.0;
        x *= (offCenterFrustum.right - offCenterFrustum.left) * 0.5;
        y *= (offCenterFrustum.top - offCenterFrustum.bottom) * 0.5;
        const origin = result.origin;
        Cartesian3.clone(camera.position, origin);
        const xDir = Cartesian3.multiplyByScalar(camera.right, x);
        const yDir = Cartesian3.multiplyByScalar(camera.up, y);
        Cartesian3.add(xDir, origin, origin);
        Cartesian3.add(yDir, origin, origin);
        Cartesian3.clone(camera.directionWC, result.direction);
        return result;
    }
    setTransform(transform) {
        const position = Cartesian3.clone(this.positionWC);
        const up = Cartesian3.clone(this.upWC);
        const direction = Cartesian3.clone(this.directionWC);
        Matrix4.clone(transform, this._transform);
        this._transformChanged = true;
        this._updateMembers();
        const inverse = this._actualInvTransform;
        Matrix4.multiplyByPoint(inverse, position, this.position);
        Matrix4.multiplyByPointAsVector(inverse, direction, this.direction);
        Matrix4.multiplyByPointAsVector(inverse, up, this.up);
        Cartesian3.cross(this.direction, this.up, this.right);
        this._updateMembers();
    }
    worldToCameraCoordinates(cartesian, result) {
        if (!defined(cartesian)) {
            throw new Error('cartesian is required.');
        }
        if (!defined(result)) {
            result = new Cartesian4();
        }
        this._updateMembers();
        return Matrix4.multiplyByVector(this._actualInvTransform, cartesian, result);
    }
    worldToCameraCoordinatesPoint(cartesian, result) {
        if (!defined(cartesian)) {
            throw new Error('cartesian is required.');
        }
        if (!defined(result)) {
            result = new Cartesian3();
        }
        this._updateMembers();
        return Matrix4.multiplyByPoint(this._actualInvTransform, cartesian, result);
    }
    worldToCameraCoordinatesVector(cartesian, result) {
        if (!defined(cartesian)) {
            throw new Error('cartesian is required.');
        }
        if (!defined(result)) {
            result = new Cartesian3();
        }
        this._updateMembers();
        return Matrix4.multiplyByPointAsVector(this._actualInvTransform, cartesian, result);
    }
    cameraToWorldCoordinates(cartesian, result) {
        if (!defined(cartesian)) {
            throw new Error('cartesian is required.');
        }
        if (!defined(result)) {
            result = new Cartesian4();
        }
        this._updateMembers();
        return Matrix4.multiplyByVector(this._actualTransform, cartesian, result);
    }
    cameraToWorldCoordinatesPoint(cartesian, result) {
        if (!defined(cartesian)) {
            throw new Error('cartesian is required.');
        }
        if (!defined(result)) {
            result = new Cartesian3();
        }
        this._updateMembers();
        return Matrix4.multiplyByPoint(this._actualTransform, cartesian, result);
    }
    cameraToWorldCoordinatesVector(cartesian, result) {
        if (!defined(cartesian)) {
            throw new Error('cartesian is required.');
        }
        if (!defined(result)) {
            result = new Cartesian3();
        }
        this._updateMembers();
        return Matrix4.multiplyByPointAsVector(this._actualTransform, cartesian, result);
    }
    _pickEllipsoid3D(windowPosition, ellipsoid, result) {
        ellipsoid = defaultValue(ellipsoid, Ellipsoid.default);
        const ray = this.getPickRay(windowPosition);
        const intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid);
        if (!defined(intersection)) {
            return undefined;
        }
        const t = intersection.start > 0.0 ? intersection.start : intersection.stop;
        return Ray.getPoint(ray, t, result);
    }
    pickEllipsoid(windowPosition, ellipsoid, result) {
        if (!defined(windowPosition)) {
            throw new Error('windowPosition is required.');
        }
        const canvas = this.scene.canvas;
        if (canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
            return undefined;
        }
        ellipsoid = defaultValue(ellipsoid, Ellipsoid.default);
        result = this._pickEllipsoid3D(windowPosition, ellipsoid, result);
        return result;
    }
    setView(options) {
        let orientation = defaultValue(options.orientation, new HeadingPitchRoll());
        const mode = this._mode;
        if (mode === SceneMode.MORPHING) {
            return;
        }
        if (defined(options.endTransform)) {
            this.setTransform(options.endTransform);
        }
        let convert = defaultValue(options.convert, true);
        let destination = defaultValue(options.destination, Cartesian3.clone(this.positionWC));
        if (defined(destination) && defined(destination.west)) {
            destination = this.getRectangleCameraCoordinates(destination);
            if (isNaN(destination.x) || isNaN(destination.y)) {
                throw new Error('destination has a NaN component.');
            }
            convert = false;
            console.log('convert: ', convert);
        }
        if (defined(orientation.direction)) {
            orientation = this._directionUpToHeadingPitchRoll(destination, orientation);
        }
        const scratchHpr = new HeadingPitchRoll();
        scratchHpr.heading = defaultValue(orientation.heading, 0.0);
        scratchHpr.pitch = defaultValue(orientation.pitch, -HEditorMath.PI_OVER_TWO);
        scratchHpr.roll = defaultValue(orientation.roll, 0.0);
        if (mode === SceneMode.SCENE3D) {
            this._setView3D(destination, scratchHpr);
        }
    }
    getRectangleCameraCoordinates(rectangle, result = new Cartesian3()) {
        if (!defined(rectangle)) {
            throw new Error('rectangle is required.');
        }
        const mode = this._mode;
        if (mode === SceneMode.SCENE3D) {
            return this._rectangleCameraPosition3D(rectangle, result);
        }
    }
    _rectangleCameraPosition3D(rectangle, result = new Cartesian3(), updateCamera = false) {
        const ellipsoid = this._projection.ellipsoid;
        const cameraRF = updateCamera ? this : defaultRF;
        const north = rectangle.north;
        const south = rectangle.south;
        let east = rectangle.east;
        const west = rectangle.west;
        // 处理国际日期限的跨越
        if (west > east) {
            east += HEditorMath.TWO_PI;
        }
        // 计算矩形的中心经纬度
        const longitude = (west + east) * 0.5;
        let latitude;
        if (south < -HEditorMath.PI_OVER_TWO + HEditorMath.RADIANS_PER_DEGREE &&
            north > HEditorMath.PI_OVER_TWO - HEditorMath.RADIANS_PER_DEGREE) {
            latitude = 0.0;
        }
        else {
            const northCartographic = new Cartographic();
            northCartographic.longitude = longitude;
            northCartographic.latitude = north;
            northCartographic.height = 0.0;
            const southCartographic = new Cartographic();
            southCartographic.longitude = longitude;
            southCartographic.latitude = south;
            southCartographic.height = 0.0;
            let ellipsoidGeodesic;
            if (!defined(ellipsoidGeodesic) ||
                ellipsoidGeodesic.ellipsoid !== ellipsoid) {
                ellipsoidGeodesic = new EllipsoidGeodesic(undefined, undefined, ellipsoid);
            }
            ellipsoidGeodesic.setEndPoints(northCartographic, southCartographic);
            latitude = ellipsoidGeodesic.interpolateUsingFraction(0.5).latitude;
        }
        // 计算矩形中心点的笛卡尔坐标
        const centerCartographic = new Cartographic();
        centerCartographic.longitude = longitude;
        centerCartographic.latitude = latitude;
        centerCartographic.height = 0.0;
        const center = ellipsoid.cartographicToCartesian(centerCartographic);
        // 计算角点: 计算矩形四个角(东北, 北西, 南东, 南西)的笛卡尔坐标
        const cart = new Cartographic();
        cart.longitude = east;
        cart.latitude = north;
        const northEast = ellipsoid.cartographicToCartesian(cart);
        cart.longitude = west;
        const northWest = ellipsoid.cartographicToCartesian(cart);
        cart.latitude = longitude;
        const northCenter = ellipsoid.cartographicToCartesian(cart);
        cart.longitude = south;
        const southCenter = ellipsoid.cartographicToCartesian(cart);
        cart.longitude = east;
        const southEast = ellipsoid.cartographicToCartesian(cart);
        cart.longitude = west;
        const southWest = ellipsoid.cartographicToCartesian(cart);
        Cartesian3.subtract(northWest, center, northWest);
        Cartesian3.subtract(southEast, center, southEast);
        Cartesian3.subtract(northEast, center, northEast);
        Cartesian3.subtract(southWest, center, southWest);
        Cartesian3.subtract(northCenter, center, northCenter);
        Cartesian3.subtract(southCenter, center, southCenter);
        // 计算相机方向, 右向量和上向量
        const direction = ellipsoid.geodeticSurfaceNormal(center, cameraRF.direction);
        Cartesian3.negate(direction, direction);
        const right = Cartesian3.cross(direction, Cartesian3.UNIT_Z, cameraRF.right);
        Cartesian3.normalize(right, right);
        const up = Cartesian3.cross(right, direction, cameraRF.up);
        let d;
        if (this.frustum instanceof OrthographicFrustum) {
            // 计算正交视锥体中的相机位置
            const width = Math.max(Cartesian3.distance(northWest, southEast), Cartesian3.distance(southEast, southWest));
            const height = Math.max(Cartesian3.distance(northEast, southEast), Cartesian3.distance(northWest, northWest));
            let rightScalar, topScalar;
            const offCenterFrustum = this.frustum.offCenterFrustum;
            const ratio = offCenterFrustum.right / offCenterFrustum.top;
            const heightRatio = height * ratio;
            if (width > heightRatio) {
                rightScalar = width;
                topScalar = rightScalar / ratio;
            }
            else {
                topScalar = height;
                rightScalar = heightRatio;
            }
            d = Math.max(rightScalar, topScalar);
        }
        else {
            // 计算透视视锥体中的相机位置
            const tanPhi = Math.tan(this.frustum.fovy * 0.5);
            const tanTheta = this.frustum.aspectRatio * tanPhi;
            d = Math.max(this._computeD(direction, up, northWest, tanPhi), this._computeD(direction, up, southEast, tanPhi), this._computeD(direction, up, northEast, tanPhi), this._computeD(direction, up, southWest, tanPhi), this._computeD(direction, up, northCenter, tanPhi), this._computeD(direction, up, southCenter, tanPhi), this._computeD(direction, right, northWest, tanTheta), this._computeD(direction, right, southEast, tanTheta), this._computeD(direction, right, northEast, tanTheta), this._computeD(direction, right, southWest, tanTheta), this._computeD(direction, right, northCenter, tanTheta), this._computeD(direction, right, southCenter, tanTheta));
            if (south < 0 && north > 0) {
                const equatorCartographic = new Cartographic();
                equatorCartographic.longitude = west;
                equatorCartographic.latitude = 0.0;
                equatorCartographic.height = 0.0;
                let equatorPosition = ellipsoid.cartographicToCartesian(equatorCartographic);
                Cartesian3.subtract(equatorPosition, center, equatorPosition);
                d = Math.max(d, this._computeD(direction, up, equatorPosition, tanPhi), this._computeD(direction, right, equatorPosition, tanTheta));
                equatorCartographic.longitude = east;
                equatorPosition = ellipsoid.cartographicToCartesian(equatorCartographic);
                Cartesian3.subtract(equatorPosition, center, equatorPosition);
                d = Math.max(d, this._computeD(direction, up, equatorPosition, tanPhi), this._computeD(direction, right, equatorPosition, tanTheta));
            }
        }
        return Cartesian3.add(center, Cartesian3.multiplyByScalar(direction, -d), result);
    }
    _computeD(direction, upOrRight, corner, tanThetaOrPhi) {
        const opposite = Math.abs(Cartesian3.dot(upOrRight, corner));
        return opposite / tanThetaOrPhi - Cartesian3.dot(direction, corner);
    }
    _directionUpToHeadingPitchRoll(position, orientation, result = new HeadingPitchRoll()) {
        const direction = Cartesian3.clone(orientation.direction);
        const up = Cartesian3.clone(orientation.up);
        if (this._mode === SceneMode.SCENE3D) {
            const ellipsoid = this.scene.ellipsoid;
            const transform = Transforms.eastNorthUpToFixedFrame(position, ellipsoid);
            const invTransform = Matrix4.inverseTransformation(transform);
            Matrix4.multiplyByPointAsVector(invTransform, direction, direction);
            Matrix4.multiplyByPointAsVector(invTransform, up, up);
        }
        const right = Cartesian3.cross(direction, up);
        result.heading = this._getHeading(direction, up);
        result.pitch = this._getPitch(direction);
        result.roll = this._getRoll(direction, up, right);
        return result;
    }
    _setView3D(position, hpr) {
        if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)) {
            throw new Error('position is required');
        }
        const currentTransform = Matrix4.clone(this.transform);
        const localTransform = Transforms.eastNorthUpToFixedFrame(position, this._projection.ellipsoid);
        this.setTransform(localTransform);
        Cartesian3.clone(Cartesian3.ZERO, this.position);
        hpr.heading = hpr.heading - HEditorMath.PI_OVER_TWO;
        const rotQuat = Quaternion.fromHeadingPitchRoll(hpr);
        const rotMat = Matrix3.fromQuaternion(rotQuat);
        Matrix3.getColumn(rotMat, 0, this.direction);
        Matrix3.getColumn(rotMat, 2, this.up);
        Cartesian3.cross(this.direction, this.up, this.right);
        this.setTransform(currentTransform);
        this._adjustOrthographicFrustum(true);
    }
    _getHeading(direction, up) {
        let heading;
        if (!HEditorMath.equalsEpsilon(Math.abs(direction.z), 1.0, HEditorMath.EPSILON3)) {
            heading = Math.atan2(direction.y, direction.x) - HEditorMath.PI_OVER_TWO;
        }
        else {
            heading = Math.atan2(up.y, up.x) - HEditorMath.PI_OVER_TWO;
        }
        return HEditorMath.TWO_PI - HEditorMath.zeroToTwoPi(heading);
    }
    _getPitch(direction) {
        return HEditorMath.PI_OVER_TWO - HEditorMath.acosClamped(direction.z);
    }
    _getRoll(direction, up, right) {
        let roll = 0.0;
        if (!HEditorMath.equalsEpsilon(Math.abs(direction.z), 1.0, HEditorMath.EPSILON3)) {
            roll = Math.atan2(-right.z, up.z);
            roll = HEditorMath.zeroToTwoPi(roll + HEditorMath.TWO_PI);
        }
        return roll;
    }
    _clampMove2D(position) {
        const maxProjectedX = this._maxCoord.x;
        const maxProjectedY = this._maxCoord.y;
        const maxX = position.x - maxProjectedX * 2.0;
        const minX = position.x + maxProjectedX * 2.0;
        if (position.x > maxProjectedX) {
            position.x = maxX;
        }
        if (position.x < -maxProjectedX) {
            position.x = minX;
        }
        if (position.y > maxProjectedY) {
            position.y = maxProjectedY;
        }
        if (position.y < -maxProjectedY) {
            position.y = -maxProjectedY;
        }
    }
    look(axis, angle) {
        if (!defined(axis)) {
            throw new Error('axis is required.');
        }
        const turnAngle = defaultValue(angle, this._defaultLookAmount);
        const quaternion = Quaternion.fromAxisAngle(axis, -turnAngle);
        const rotation = Matrix3.fromQuaternion(quaternion);
        const direction = this.direction;
        const right = this.right;
        const up = this.up;
        Matrix3.multiplyByVector(rotation, direction, direction);
        Matrix3.multiplyByVector(rotation, up, up);
        Matrix3.multiplyByVector(rotation, right, right);
    }
    lookDown(amount) {
        amount = defaultValue(amount, this._defaultLookAmount);
        this.look(this.right, amount);
    }
    lookUp(amount) {
        amount = defaultValue(amount, this._defaultLookAmount);
        this.look(this.right, -amount);
    }
    lookRight(amount) {
        amount = defaultValue(amount, this._defaultLookAmount);
        this.look(this.up, amount);
    }
    lookLeft(amount) {
        amount = defaultValue(amount, this._defaultLookAmount);
        this.look(this.up, -amount);
    }
    move(direction, amount) {
        if (!defined(direction)) {
            throw new Error('direction is required.');
        }
        const cameraPosition = this.position;
        const moveScratch = Cartesian3.multiplyByScalar(direction, amount);
        Cartesian3.add(cameraPosition, moveScratch, cameraPosition);
        this._clampMove2D(cameraPosition);
        this._adjustOrthographicFrustum(true);
    }
    moveForward(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this.move(this.direction, amount);
    }
    moveBackward(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this.move(this.direction, -amount);
    }
    moveRight(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this.move(this.right, amount);
    }
    moveLeft(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this.move(this.right, -amount);
    }
    moveUp(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this.move(this.up, amount);
    }
    moveDown(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this.move(this.up, -amount);
    }
    _rotateVertical(angle) {
        const position = this.position;
        if (defined(this.constrainedAxis) &&
            !Cartesian3.equalsEpsilon(this.position, Cartesian3.ZERO, HEditorMath.EPSILON2)) {
            const p = Cartesian3.normalize(position);
            const northParallel = Cartesian3.equalsEpsilon(p, this.constrainedAxis, HEditorMath.EPSILON2);
            const southParallel = Cartesian3.equalsEpsilon(p, Cartesian3.negate(this.constrainedAxis, new Cartesian3()), HEditorMath.EPSILON2);
            if (!northParallel && !southParallel) {
                const constrainedAxis = Cartesian3.normalize(this.constrainedAxis);
                let dot = Cartesian3.dot(p, constrainedAxis);
                let angleToAxis = HEditorMath.acosClamped(dot);
                if (angle > 0 && angle > angleToAxis) {
                    angle = angleToAxis - HEditorMath.EPSILON4;
                }
                dot = Cartesian3.dot(p, Cartesian3.negate(constrainedAxis, new Cartesian3()));
                angleToAxis = HEditorMath.acosClamped(dot);
                if (angle < 0 && -angle > angleToAxis) {
                    angle = -angleToAxis + HEditorMath.EPSILON4;
                }
                const tangent = Cartesian3.cross(constrainedAxis, p, new Cartesian3());
                this.rotate(tangent, angle);
            }
            else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
                this.rotate(this.right, angle);
            }
        }
        else {
            this.rotate(this.right, angle);
        }
    }
    _rotateHorizonTal(angle) {
        if (defined(this.constrainedAxis)) {
            this.rotate(this.constrainedAxis, angle);
        }
        else {
            this.rotate(this.up, angle);
        }
    }
    rotate(axis, angle) {
        if (!defined(axis)) {
            throw new Error('axis is required.');
        }
        const turnAngle = defaultValue(angle, this._defaultRotateAmount);
        const quaternion = Quaternion.fromAxisAngle(axis, turnAngle);
        const rotation = Matrix3.fromQuaternion(quaternion);
        Matrix3.multiplyByVector(rotation, this.position, this.position);
        Matrix3.multiplyByVector(rotation, this.direction, this.direction);
        Matrix3.multiplyByVector(rotation, this.up, this.up);
        Cartesian3.cross(this.direction, this.up, this.right);
        Cartesian3.cross(this.right, this.direction, this.up);
        this._adjustOrthographicFrustum(false);
    }
    rotateDown(angle) {
        angle = defaultValue(angle, this._defaultRotateAmount);
        this._rotateVertical(angle);
    }
    rotateUp(angle) {
        angle = defaultValue(angle, this._defaultRotateAmount);
        this._rotateVertical(-angle);
    }
    rotateRight(angle) {
        angle = defaultValue(angle, this._defaultRotateAmount);
        this._rotateHorizonTal(-angle);
    }
    rotateLeft(angle) {
        angle = defaultValue(angle, this._defaultRotateAmount);
        this._rotateHorizonTal(angle);
    }
    _zoom3D(amount) {
        this.move(this.direction, amount);
    }
    zoomIn(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this._zoom3D(amount);
    }
    zoomOut(amount) {
        amount = defaultValue(amount, this._defaultZoomAmount);
        this._zoom3D(-amount);
    }
}
Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(-95.0, -20.0, -70.0, 90.0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtZXJhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9DYW1lcmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFDckMsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQTtBQUM3QixPQUFPLGtCQUFrQixNQUFNLDRCQUE0QixDQUFBO0FBRTNELE9BQU8sbUJBQW1CLE1BQU0sNkJBQTZCLENBQUE7QUFHN0QsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxPQUFPLE1BQU0saUJBQWlCLENBQUE7QUFDckMsT0FBTyxTQUFTLE1BQU0sbUJBQW1CLENBQUE7QUFDekMsT0FBTyxpQkFBaUIsTUFBTSwyQkFBMkIsQ0FBQTtBQUN6RCxPQUFPLEVBR0wsU0FBUyxFQUNWLE1BQU0sWUFBWSxDQUFBO0FBQ25CLE9BQU8sZ0JBQWdCLE1BQU0sMEJBQTBCLENBQUE7QUFDdkQsT0FBTyxTQUFTLE1BQU0sbUJBQW1CLENBQUE7QUFDekMsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxpQkFBaUIsTUFBTSwyQkFBMkIsQ0FBQTtBQUV6RCxNQUFNLFNBQVMsR0FBRztJQUNoQixTQUFTLEVBQUUsSUFBSSxVQUFVLEVBQUU7SUFDM0IsS0FBSyxFQUFFLElBQUksVUFBVSxFQUFFO0lBQ3ZCLEVBQUUsRUFBRSxJQUFJLFVBQVUsRUFBRTtDQUNyQixDQUFBO0FBQ0QsTUFBTSxDQUFDLE9BQU8sT0FBTyxNQUFNO0lBQ2xCLFFBQVEsR0FBZSxJQUFJLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEQsU0FBUyxHQUFlLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDckQsRUFBRSxHQUFlLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDOUMsS0FBSyxHQUFlLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDakQsZUFBZSxDQUF3QjtJQUV2QyxVQUFVLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUN6QyxXQUFXLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUMxQyxJQUFJLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUNuQyxPQUFPLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUVyQyxXQUFXLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUMxQyxZQUFZLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUMzQyxLQUFLLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUNwQyxRQUFRLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUN2QyxTQUFTLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUN4QyxVQUFVLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUN6QyxHQUFHLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUNsQyxNQUFNLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUNyQyxVQUFVLEdBQVksSUFBSSxPQUFPLEVBQUUsQ0FBQTtJQUNuQyxpQkFBaUIsR0FBRyxLQUFLLENBQUE7SUFDekIsWUFBWSxHQUFHLEtBQUssQ0FBQTtJQUNwQixrQkFBa0IsR0FBVyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQTtJQUMzQyxvQkFBb0IsR0FBVyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQTtJQUMvQyxrQkFBa0IsR0FBVyxRQUFRLENBQUE7SUFFckMsZ0JBQWdCLEdBQVksT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDM0QsbUJBQW1CLEdBQVksT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDOUQsV0FBVyxHQUFZLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3RELGNBQWMsR0FBWSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUVqRSxLQUFLLENBQU87SUFDSixXQUFXLENBQXNCO0lBQ2pDLHFCQUFxQixDQUFjO0lBQ25DLFNBQVMsQ0FBWTtJQUNyQixLQUFLLENBQVc7SUFDeEIsT0FBTyxHQUFXLEdBQUcsQ0FBQTtJQUNyQixLQUFLLEdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFBO0lBQ3hDLElBQUksR0FBVyxHQUFHLENBQUE7SUFDbEIsTUFBTSxDQUFDLHNCQUFzQixDQUFXO0lBRXhDLElBQUksVUFBVTtRQUNaLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUVyQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7SUFDekIsQ0FBQztJQUNELElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQTtJQUN4QixDQUFDO0lBQ0QsSUFBSSxvQkFBb0I7UUFDdEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFBO0lBQ25DLENBQUM7SUFFRCxPQUFPLENBQTBDO0lBRWpELFlBQVksS0FBWTtRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtRQUVsQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixDQUFBO1FBQ3hFLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDdkMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFBO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQTtRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksa0JBQWtCLENBQUM7WUFDcEMsR0FBRztZQUNILFdBQVc7WUFDWCxJQUFJO1lBQ0osR0FBRztTQUNKLENBQUMsQ0FBQTtRQUVGLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUE7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUE7UUFFN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FDakMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLENBQ2xELENBQUE7UUFDRixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUMvQyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7UUFFOUIsbUNBQW1DO1FBQ25DLG1DQUFtQztRQUNuQyxtQkFBbUI7UUFDbkIsU0FBUztRQUNULElBQUk7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLElBQWU7UUFDM0IsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO1FBQ25CLENBQUM7SUFDSCxDQUFDO0lBQ08sY0FBYztRQUNwQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO1FBQzdCLE1BQU0sZUFBZSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25FLElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDNUQsQ0FBQztRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7UUFDL0IsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUN0RSxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDckIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUNwRCxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUMvRCxDQUFDO1FBQ0QsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQTtRQUNqQixNQUFNLFNBQVMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUNqRCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN0QyxFQUFFLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQyxDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUN2QixNQUFNLFlBQVksR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUMxRCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDNUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbkQsQ0FBQztRQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUE7UUFDcEUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQTtRQUM5QixJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDckIsT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7WUFFeEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1lBRXJELE9BQU8sQ0FBQyxxQkFBcUIsQ0FDM0IsSUFBSSxDQUFDLGdCQUFnQixFQUNyQixJQUFJLENBQUMsbUJBQW1CLENBQ3pCLENBQUE7WUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQTtRQUMzQixDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFBO1FBRXZDLElBQUksZUFBZSxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUN4QyxTQUFTLEVBQ1QsUUFBUSxFQUNSLElBQUksQ0FBQyxXQUFXLENBQ2pCLENBQUE7WUFFRCxJQUFJLENBQUMscUJBQXFCO2dCQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDaEQsSUFBSSxDQUFDLFdBQVcsRUFDaEIsSUFBSSxDQUFDLHFCQUFxQixDQUMzQixDQUFBO1FBQ0wsQ0FBQztRQUVELElBQUksZ0JBQWdCLElBQUksU0FBUyxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2xELE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQ3hCLFNBQVMsRUFDVCxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUM5QyxDQUFBO1lBQ0QsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQy9DLE1BQU0sUUFBUSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ3RELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQTtnQkFDdkQsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDekQsRUFBRSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQ3ZCLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ3JDLElBQUksQ0FBQyxHQUFHLENBQ1QsQ0FBQTtnQkFDRCxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBRTdCLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUNwRCxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDckMsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLGdCQUFnQixJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQ2pELFNBQVMsRUFDVCxTQUFTLEVBQ1QsSUFBSSxDQUFDLFlBQVksQ0FDbEIsQ0FBQTtZQUNELFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDNUQsQ0FBQztRQUNELElBQUksU0FBUyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM5QyxDQUFDO1FBQ0QsSUFBSSxZQUFZLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FDN0MsU0FBUyxFQUNULEtBQUssRUFDTCxJQUFJLENBQUMsUUFBUSxDQUNkLENBQUE7WUFDRCxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3BELENBQUM7UUFFRCxJQUNFLGVBQWU7WUFDZixnQkFBZ0I7WUFDaEIsU0FBUztZQUNULFlBQVk7WUFDWixnQkFBZ0IsRUFDaEIsQ0FBQztZQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM3QixDQUFDO0lBQ0gsQ0FBQztJQUNPLGtDQUFrQztRQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3RELE9BQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUMsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7UUFDeEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQTtRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBQ0QsMEJBQTBCLENBQUMsT0FBZ0I7UUFDekMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxtQkFBbUIsQ0FBQztZQUFFLE9BQU07UUFFMUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDO1lBQzdELE9BQU07UUFDUixDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQ2hCLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFBO0lBQ25FLENBQUM7SUFDTSxnQkFBZ0IsQ0FBQyxNQUFjO1FBQ3BDLE9BQU8sQ0FBQyxXQUFXLENBQ2pCLE1BQU0sQ0FBQyxTQUFTLEVBQ2hCLE1BQU0sQ0FBQyxVQUFVLEVBQ2pCLE1BQU0sQ0FBQyxHQUFHLEVBQ1YsTUFBTSxDQUFDLE1BQU0sRUFDYixJQUFJLENBQUMsV0FBVyxDQUNqQixDQUFBO1FBQ0QsT0FBTyxDQUFDLFFBQVEsQ0FDZCxJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsbUJBQW1CLEVBQ3hCLElBQUksQ0FBQyxXQUFXLENBQ2pCLENBQUE7UUFDRCxPQUFPLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDdEUsQ0FBQztJQUVNLFVBQVUsQ0FBQyxTQUFxQixFQUFFLE1BQVk7UUFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtRQUMxQyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQTtRQUNoQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDeEQsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2xCLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFBO1FBRTVCLElBQ0UsT0FBTyxZQUFZLGtCQUFrQjtZQUNyQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUM1QixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNwQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUNyQixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUM3RCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM5RCxDQUFDO0lBRU8sc0JBQXNCLENBQzVCLE1BQWMsRUFDZCxTQUFxQixFQUNyQixNQUFXO1FBRVgsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7UUFDbEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQTtRQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFBO1FBRWxDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUE2QixDQUFBO1FBRXBELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMzQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQTtRQUM3QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFBO1FBRXpCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzNDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFFdkQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQTtRQUNsQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFekMsMERBQTBEO1FBRTFELCtDQUErQztRQUMvQyxvREFBb0Q7UUFDcEQsMEJBQTBCO1FBQzFCLDJEQUEyRDtRQUMzRCxnREFBZ0Q7UUFDaEQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDeEUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBRWhELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FDdEMsTUFBTSxDQUFDLE9BQU8sRUFDZCxDQUFDLEdBQUcsSUFBSSxHQUFHLFFBQVEsQ0FDcEIsQ0FBQTtRQUNELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUE7UUFFeEUsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNwRSxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDMUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ25ELFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBRTFDLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVPLHVCQUF1QixDQUM3QixNQUFjLEVBQ2QsU0FBcUIsRUFDckIsTUFBVztRQUVYLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBO1FBQ2xDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUE7UUFDaEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQTtRQUVsQywwQkFBMEI7UUFDMUIseURBQXlEO1FBQ3pELGlCQUFpQjtRQUNqQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBOEIsQ0FBQTtRQUNyRCxNQUFNLGdCQUFnQixHQUNwQixPQUFPLENBQUMsZ0JBQWdELENBQUE7UUFFMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUVyRCxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzNELENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUE7UUFFM0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQTtRQUM1QixVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFekMsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDekQsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFdEQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3BDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUVwQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRXRELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVNLFlBQVksQ0FBQyxTQUFrQjtRQUNwQyxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNsRCxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUVwRCxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQTtRQUM3QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7UUFFckIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFBO1FBRXhDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekQsT0FBTyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ25FLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNyRCxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFFckQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQ3ZCLENBQUM7SUFFTSx3QkFBd0IsQ0FBQyxTQUFxQixFQUFFLE1BQW1CO1FBQ3hFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7UUFDM0MsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBRXJCLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDOUUsQ0FBQztJQUNNLDZCQUE2QixDQUNsQyxTQUFxQixFQUNyQixNQUFtQjtRQUVuQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1FBQzNDLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDckIsTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7UUFDM0IsQ0FBQztRQUVELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUVyQixPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM3RSxDQUFDO0lBQ00sOEJBQThCLENBQ25DLFNBQXFCLEVBQ3JCLE1BQW1CO1FBRW5CLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7UUFDM0MsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBRXJCLE9BQU8sT0FBTyxDQUFDLHVCQUF1QixDQUNwQyxJQUFJLENBQUMsbUJBQW1CLEVBQ3hCLFNBQVMsRUFDVCxNQUFNLENBQ1AsQ0FBQTtJQUNILENBQUM7SUFDTSx3QkFBd0IsQ0FBQyxTQUFxQixFQUFFLE1BQW1CO1FBQ3hFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7UUFDM0MsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBRXJCLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDM0UsQ0FBQztJQUNNLDZCQUE2QixDQUNsQyxTQUFxQixFQUNyQixNQUFtQjtRQUVuQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1FBQzNDLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDckIsTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7UUFDM0IsQ0FBQztRQUVELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUNyQixPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUMxRSxDQUFDO0lBQ00sOEJBQThCLENBQ25DLFNBQXFCLEVBQ3JCLE1BQW1CO1FBRW5CLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7UUFDM0MsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUMzQixDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBRXJCLE9BQU8sT0FBTyxDQUFDLHVCQUF1QixDQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLFNBQVMsRUFDVCxNQUFNLENBQ1AsQ0FBQTtJQUNILENBQUM7SUFFTyxnQkFBZ0IsQ0FDdEIsY0FBMEIsRUFDMUIsU0FBb0IsRUFDcEIsTUFBbUI7UUFFbkIsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDM0MsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUNuRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDM0IsT0FBTyxTQUFTLENBQUE7UUFDbEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFBO1FBRTNFLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ3JDLENBQUM7SUFDTSxhQUFhLENBQ2xCLGNBQTBCLEVBQzFCLFNBQW9CLEVBQ3BCLE1BQW1CO1FBRW5CLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUE7UUFDaEQsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBO1FBQ2hDLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLFlBQVksSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4RCxPQUFPLFNBQVMsQ0FBQTtRQUNsQixDQUFDO1FBRUQsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBRXRELE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUVqRSxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFDTSxPQUFPLENBQUMsT0FBMEI7UUFDdkMsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDLENBQUE7UUFFM0UsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUV2QixJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEMsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUN6QyxDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDakQsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUM1QixPQUFPLENBQUMsV0FBVyxFQUNuQixVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FDbEMsQ0FBQTtRQUNELElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBRSxXQUF5QixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDckUsV0FBVyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FDOUMsV0FBd0IsQ0FDWCxDQUFBO1lBRWYsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO1lBQ3JELENBQUM7WUFDRCxPQUFPLEdBQUcsS0FBSyxDQUFBO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbkMsQ0FBQztRQUVELElBQUksT0FBTyxDQUFFLFdBQXdDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUNqRSxXQUFXLEdBQUcsSUFBSSxDQUFDLDhCQUE4QixDQUMvQyxXQUF5QixFQUN6QixXQUF1QyxDQUNwQixDQUFBO1FBQ3ZCLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUE7UUFDekMsVUFBVSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQzlCLFdBQWdDLENBQUMsT0FBTyxFQUN6QyxHQUFHLENBQ0osQ0FBQTtRQUNELFVBQVUsQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUM1QixXQUFnQyxDQUFDLEtBQUssRUFDdkMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUN6QixDQUFBO1FBQ0QsVUFBVSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUUsV0FBZ0MsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFFM0UsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBeUIsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUN4RCxDQUFDO0lBQ0gsQ0FBQztJQUVNLDZCQUE2QixDQUNsQyxTQUFvQixFQUNwQixTQUFxQixJQUFJLFVBQVUsRUFBRTtRQUVyQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1FBQzNDLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBRXZCLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMvQixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDM0QsQ0FBQztJQUNILENBQUM7SUFDTywwQkFBMEIsQ0FDaEMsU0FBb0IsRUFDcEIsU0FBcUIsSUFBSSxVQUFVLEVBQUUsRUFDckMsZUFBd0IsS0FBSztRQUU3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQTtRQUM1QyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO1FBRWhELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUE7UUFDN0IsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQTtRQUM3QixJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFBO1FBQ3pCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUE7UUFFM0IsYUFBYTtRQUNiLElBQUksSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ2hCLElBQUksSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFBO1FBQzVCLENBQUM7UUFFRCxhQUFhO1FBQ2IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3JDLElBQUksUUFBUSxDQUFBO1FBQ1osSUFDRSxLQUFLLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxrQkFBa0I7WUFDakUsS0FBSyxHQUFHLFdBQVcsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixFQUNoRSxDQUFDO1lBQ0QsUUFBUSxHQUFHLEdBQUcsQ0FBQTtRQUNoQixDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtZQUM1QyxpQkFBaUIsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1lBQ3ZDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7WUFDbEMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQTtZQUU5QixNQUFNLGlCQUFpQixHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7WUFDNUMsaUJBQWlCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtZQUN2QyxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO1lBQ2xDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUE7WUFFOUIsSUFBSSxpQkFBZ0QsQ0FBQTtZQUNwRCxJQUNFLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUMzQixpQkFBaUIsQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUN6QyxDQUFDO2dCQUNELGlCQUFpQixHQUFHLElBQUksaUJBQWlCLENBQ3ZDLFNBQVMsRUFDVCxTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUE7WUFDSCxDQUFDO1lBRUQsaUJBQWlCLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUE7WUFDcEUsUUFBUSxHQUFHLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtRQUNyRSxDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUM3QyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQ3hDLGtCQUFrQixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDdEMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQTtRQUMvQixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUVwRSxzQ0FBc0M7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtRQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtRQUNyQixNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFekQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7UUFDckIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXpELElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFBO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUUzRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtRQUN0QixNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFM0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7UUFDckIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXpELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUV6RCxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDakQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ2pELFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUNqRCxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDakQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQ3JELFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUVyRCxrQkFBa0I7UUFDbEIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixDQUMvQyxNQUFNLEVBQ04sUUFBUSxDQUFDLFNBQVMsQ0FDbkIsQ0FBQTtRQUNELFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ3ZDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzVFLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFMUQsSUFBSSxDQUFDLENBQUE7UUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksbUJBQW1CLEVBQUUsQ0FBQztZQUNoRCxnQkFBZ0I7WUFDaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDcEIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQ3pDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUMxQyxDQUFBO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQ3pDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUMxQyxDQUFBO1lBRUQsSUFBSSxXQUFXLEVBQUUsU0FBUyxDQUFBO1lBQzFCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQTtZQUN0RCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFBO1lBQzNELE1BQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUE7WUFDbEMsSUFBSSxLQUFLLEdBQUcsV0FBVyxFQUFFLENBQUM7Z0JBQ3hCLFdBQVcsR0FBRyxLQUFLLENBQUE7Z0JBQ25CLFNBQVMsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFBO1lBQ2pDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixTQUFTLEdBQUcsTUFBTSxDQUFBO2dCQUNsQixXQUFXLEdBQUcsV0FBVyxDQUFBO1lBQzNCLENBQUM7WUFFRCxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDdEMsQ0FBQzthQUFNLENBQUM7WUFDTixnQkFBZ0I7WUFDaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUNoRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUE7WUFFbEQsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsRUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FDeEQsQ0FBQTtZQUVELElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtnQkFDOUMsbUJBQW1CLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtnQkFDcEMsbUJBQW1CLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQTtnQkFDbEMsbUJBQW1CLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQTtnQkFDaEMsSUFBSSxlQUFlLEdBQ2pCLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO2dCQUN4RCxVQUFVLENB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