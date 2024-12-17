import Cartesian3 from '../Core/Cartesian3';
import { defined } from '../Core/Defined';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtZXJhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9TY2VuZS9DYW1lcmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUE7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3pDLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQTtBQUN0QyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUNyQyxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUE7QUFDN0IsT0FBTyxrQkFBa0IsTUFBTSw0QkFBNEIsQ0FBQTtBQUUzRCxPQUFPLG1CQUFtQixNQUFNLDZCQUE2QixDQUFBO0FBRzdELE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFBO0FBQ3JDLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8saUJBQWlCLE1BQU0sMkJBQTJCLENBQUE7QUFDekQsT0FBTyxFQUdMLFNBQVMsRUFDVixNQUFNLFlBQVksQ0FBQTtBQUNuQixPQUFPLGdCQUFnQixNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFBO0FBQ3pDLE9BQU8sVUFBVSxNQUFNLG9CQUFvQixDQUFBO0FBQzNDLE9BQU8saUJBQWlCLE1BQU0sMkJBQTJCLENBQUE7QUFFekQsTUFBTSxTQUFTLEdBQUc7SUFDaEIsU0FBUyxFQUFFLElBQUksVUFBVSxFQUFFO0lBQzNCLEtBQUssRUFBRSxJQUFJLFVBQVUsRUFBRTtJQUN2QixFQUFFLEVBQUUsSUFBSSxVQUFVLEVBQUU7Q0FDckIsQ0FBQTtBQUNE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SyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzVELENBQUM7UUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO1FBQy9CLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDdEUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3JCLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDcEQsU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDL0QsQ0FBQztRQUNELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUE7UUFDakIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDakQsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDdEMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUMsQ0FBQztRQUNELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDdkIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDMUQsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzVDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ25ELENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFBO1FBQ3BFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUE7UUFDOUIsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1lBRXhFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtZQUVyRCxPQUFPLENBQUMscUJBQXFCLENBQzNCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLG1CQUFtQixDQUN6QixDQUFBO1lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7UUFDM0IsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQTtRQUV2QyxJQUFJLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FDeEMsU0FBUyxFQUNULFFBQVEsRUFDUixJQUFJLENBQUMsV0FBVyxDQUNqQixDQUFBO1lBRUQsSUFBSSxDQUFDLHFCQUFxQjtnQkFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQ2hELElBQUksQ0FBQyxXQUFXLEVBQ2hCLElBQUksQ0FBQyxxQkFBcUIsQ0FDM0IsQ0FBQTtRQUNMLENBQUM7UUFFRCxJQUFJLGdCQUFnQixJQUFJLFNBQVMsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNsRCxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUN4QixTQUFTLEVBQ1QsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksVUFBVSxFQUFFLENBQUMsQ0FDOUMsQ0FBQTtZQUNELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLFFBQVEsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUN0RCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUE7Z0JBQ3ZELE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7Z0JBQ3pELEVBQUUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUN2QixVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNyQyxJQUFJLENBQUMsR0FBRyxDQUNULENBQUE7Z0JBQ0QsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUU3QixLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDcEQsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3JDLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUNqRCxTQUFTLEVBQ1QsU0FBUyxFQUNULElBQUksQ0FBQyxZQUFZLENBQ2xCLENBQUE7WUFDRCxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVB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QUUsTUFBTSxDQUFDLEVBQ2hELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQ2hELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQ3hELENBQUE7WUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMzQixNQUFNLG1CQUFtQixHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7Z0JBQzlDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7Z0JBQ3BDLG1CQUFtQixDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUE7Z0JBQ2xDLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUE7Z0JBQ2hDLElBQUksZUFBZSxHQUNqQixTQUFTLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtnQkFD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