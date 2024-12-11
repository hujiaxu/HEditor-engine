import Cartesian3 from './Cartesian3'
import Cartographic from './Cartographic'
import defaultValue from './DefaultValue'
import { defined } from './Defined'
import Ellipsoid from './Ellipsoid'
import HEditorMath from './Math'

export default class EllipsoidGeodesic {
  private _ellipsoid: Ellipsoid
  private _start: Cartographic
  private _end: Cartographic
  private _constants: {
    [key: string]: number
  }
  private _startHeading: number | undefined
  private _endHeading: number | undefined
  private _distance: number | undefined
  private _uSquared: number | undefined

  get ellipsoid(): Ellipsoid {
    return this._ellipsoid
  }
  constructor(
    start: Cartographic | undefined,
    end: Cartographic | undefined,
    ellipsoid: Ellipsoid
  ) {
    const e = defaultValue(ellipsoid, Ellipsoid.default)

    this._ellipsoid = e
    this._start = new Cartographic()
    this._end = new Cartographic()

    this._constants = {}

    this._startHeading = undefined
    this._endHeading = undefined
    console.log('this._endHeading: ', this._endHeading)
    this._distance = undefined
    this._uSquared = undefined

    if (defined(start) && defined(end)) {
      this._computeProperties(start, end, e)
    }
  }

  public setEndPoints(start: Cartographic, end: Cartographic) {
    if (!defined(start) || !defined(end)) {
      throw new Error('start and end are required.')
    }

    this._computeProperties(start, end, this._ellipsoid)
  }

  public interpolateUsingFraction(
    fraction: number,
    result: Cartographic = new Cartographic()
  ) {
    return this.interpolateUsingSurfaceDistance(
      fraction * this._distance!,
      result
    )
  }

  public interpolateUsingSurfaceDistance(
    distance: number,
    result: Cartographic = new Cartographic()
  ) {
    const constants = this._constants

    const s = constants.distanceRatio + distance / constants.b

    const cosine2S = Math.cos(2.0 * s)
    const cosine4S = Math.cos(4.0 * s)
    const cosine6S = Math.cos(6.0 * s)
    const sine2S = Math.sin(2.0 * s)
    const sine4S = Math.sin(4.0 * s)
    const sine6S = Math.sin(6.0 * s)
    const sine8S = Math.sin(8.0 * s)

    const s2 = s * s
    const s3 = s * s2

    const u8Over256 = constants.u8Over256
    const u2Over4 = constants.u2Over4
    const u6Over64 = constants.u6Over64
    const u4Over16 = constants.u4Over16
    let sigma =
      (2.0 * s3 * u8Over256 * cosine2S) / 3.0 +
      s *
        (1.0 -
          u2Over4 +
          (7.0 * u4Over16) / 4.0 -
          (15.0 * u6Over64) / 4.0 +
          (579.0 * u8Over256) / 64.0 -
          (u4Over16 - (15.0 * u6Over64) / 4.0 + (187.0 * u8Over256) / 16.0) *
            cosine2S -
          ((5.0 * u6Over64) / 4.0 - (115.0 * u8Over256) / 16.0) * cosine4S -
          (29.0 * u8Over256 * cosine6S) / 16.0) +
      (u2Over4 / 2.0 -
        u4Over16 +
        (71.0 * u6Over64) / 32.0 -
        (85.0 * u8Over256) / 16.0) *
        sine2S +
      ((5.0 * u4Over16) / 16.0 -
        (5.0 * u6Over64) / 4.0 +
        (383.0 * u8Over256) / 96.0) *
        sine4S -
      s2 *
        ((u6Over64 - (11.0 * u8Over256) / 2.0) * sine2S +
          (5.0 * u8Over256 * sine4S) / 2.0) +
      ((29.0 * u6Over64) / 96.0 - (29.0 * u8Over256) / 16.0) * sine6S +
      (539.0 * u8Over256 * sine8S) / 1536.0

    const theta = Math.asin(Math.sin(sigma) * constants.cosineAlpha)
    const latitude = Math.atan((constants.a / constants.b) * Math.tan(theta))

    // Redefine in terms of relative argument of latitude.
    sigma = sigma - constants.sigma

    const cosineTwiceSigmaMidpoint = Math.cos(2.0 * constants.sigma + sigma)

    const sineSigma = Math.sin(sigma)
    const cosineSigma = Math.cos(sigma)

    const cc = constants.cosineU * cosineSigma
    const ss = constants.sineU * sineSigma

    const lambda = Math.atan2(
      sineSigma * constants.sineHeading,
      cc - ss * constants.cosineHeading
    )

    const l =
      lambda -
      this._computeDeltaLambda(
        constants.f,
        constants.sineAlpha,
        constants.cosineSquaredAlpha,
        sigma,
        sineSigma,
        cosineSigma,
        cosineTwiceSigmaMidpoint
      )

    if (defined(result)) {
      result.longitude = this._start.longitude + l
      result.latitude = latitude
      result.height = 0.0
      return result
    }

    return new Cartographic(this._start.longitude + l, latitude, 0.0)
  }

  private _computeProperties(
    start: Cartographic,
    end: Cartographic,
    ellipsoid: Ellipsoid
  ) {
    const firstCartesian = Cartesian3.normalize(
      ellipsoid.cartographicToCartesian(start)
    )
    const lastCartesian = Cartesian3.normalize(
      ellipsoid.cartographicToCartesian(end)
    )

    console.log(firstCartesian, lastCartesian)

    this._vincentyInverseFormula(
      ellipsoid.maximumRadius,
      ellipsoid.minimumRadius,
      start.longitude,
      start.latitude,
      end.longitude,
      end.latitude
    )

    this._start = Cartographic.clone(start)
    this._end = Cartographic.clone(end)
    this._start.height = 0.0
    this._end.height = 0.0

    this._setConstants()
  }

  private _setConstants() {
    const uSquared = this._uSquared!
    const a = this._ellipsoid.maximumRadius
    const b = this._ellipsoid.minimumRadius
    const f = (a - b) / a

    const cosineHeading = Math.cos(this._startHeading!)
    const sineHeading = Math.sin(this._startHeading!)

    const tanU = (1 - f) * Math.tan(this._start.latitude)

    const cosineU = 1.0 / Math.sqrt(1.0 + tanU * tanU)
    const sineU = cosineU * tanU

    const sigma = Math.atan2(tanU, cosineHeading)

    const sineAlpha = cosineU * sineHeading
    const sineSquaredAlpha = sineAlpha * sineAlpha

    const cosineSquaredAlpha = 1.0 - sineSquaredAlpha
    const cosineAlpha = Math.sqrt(cosineSquaredAlpha)

    const u2Over4 = uSquared / 4.0
    const u4Over16 = u2Over4 * u2Over4
    const u6Over64 = u4Over16 * u2Over4
    const u8Over256 = u4Over16 * u4Over16

    const a0 =
      1.0 +
      u2Over4 -
      (3.0 * u4Over16) / 4.0 +
      (5.0 * u6Over64) / 4.0 -
      (175.0 * u8Over256) / 64.0
    const a1 = 1.0 - u2Over4 + (15.0 * u4Over16) / 8.0 - (35.0 * u6Over64) / 8.0
    const a2 = 1.0 - 3.0 * u2Over4 + (35.0 * u4Over16) / 4.0
    const a3 = 1.0 - 5.0 * u2Over4

    const distanceRatio =
      a0 * sigma -
      (a1 * Math.sin(2.0 * sigma) * u2Over4) / 2.0 -
      (a2 * Math.sin(4.0 * sigma) * u4Over16) / 16.0 -
      (a3 * Math.sin(6.0 * sigma) * u6Over64) / 48.0 -
      (Math.sin(8.0 * sigma) * 5.0 * u8Over256) / 512

    const constants = this._constants

    constants.a = a
    constants.b = b
    constants.f = f
    constants.cosineHeading = cosineHeading
    constants.sineHeading = sineHeading
    constants.tanU = tanU
    constants.cosineU = cosineU
    constants.sineU = sineU
    constants.sigma = sigma
    constants.sineAlpha = sineAlpha
    constants.sineSquaredAlpha = sineSquaredAlpha
    constants.cosineSquaredAlpha = cosineSquaredAlpha
    constants.cosineAlpha = cosineAlpha
    constants.u2Over4 = u2Over4
    constants.u4Over16 = u4Over16
    constants.u6Over64 = u6Over64
    constants.u8Over256 = u8Over256
    constants.a0 = a0
    constants.a1 = a1
    constants.a2 = a2
    constants.a3 = a3
    constants.distanceRatio = distanceRatio
  }
  private _vincentyInverseFormula(
    major: number,
    minor: number,
    firstLongitude: number,
    firstLatitude: number,

    secondLongitude: number,
    secondLatitude: number
  ) {
    const eff = (major - minor) / major
    const l = secondLongitude - firstLongitude

    const u1 = Math.atan((1 - eff) * Math.tan(firstLatitude))
    const u2 = Math.atan((1 - eff) * Math.tan(secondLatitude))

    const cosineU1 = Math.cos(u1)
    const sineU1 = Math.sin(u1)
    const cosineU2 = Math.cos(u2)
    const sineU2 = Math.sin(u2)

    const cc = cosineU1 * cosineU2
    const cs = cosineU1 * sineU2
    const sc = sineU1 * cosineU2
    const ss = sineU1 * sineU2

    let lambda = l
    let lambdaDot = HEditorMath.TWO_PI

    let cosineLambda = Math.cos(lambda)
    let sineLambda = Math.sin(lambda)

    let sigma,
      cosineSigma,
      sineSigma,
      cosineSquaredAlpha,
      cosineTwiceSigmaMidpoint

    do {
      cosineLambda = Math.cos(lambda)
      sineLambda = Math.sin(lambda)

      const temp = cs - sc * cosineLambda
      sineSigma = Math.sqrt(
        cosineU2 * cosineU2 * sineLambda * sineLambda + temp * temp
      )
      cosineSigma = ss + cc * cosineLambda

      sigma = Math.atan2(sineSigma, cosineSigma)

      let sineAplha

      if (sineSigma === 0.0) {
        sineAplha = 0.0
        cosineSquaredAlpha = 1.0
      } else {
        sineAplha = (cc * sineLambda) / sineSigma
        cosineSquaredAlpha = 1.0 - sineAplha * sineAplha
      }

      lambdaDot = lambda

      cosineTwiceSigmaMidpoint = cosineSigma - (2.0 * ss) / cosineSquaredAlpha

      if (!isFinite(cosineTwiceSigmaMidpoint)) {
        cosineTwiceSigmaMidpoint = 0.0
      }

      lambda =
        l +
        this._computeDeltaLambda(
          eff,
          sineAplha,
          cosineSquaredAlpha,
          sigma,
          sineSigma,
          cosineSigma,
          cosineTwiceSigmaMidpoint
        )
    } while (Math.abs(lambda - lambdaDot) > HEditorMath.EPSILON12)

    const uSquared =
      (cosineSquaredAlpha * (major * major - minor * minor)) / (minor * minor)

    const A =
      1.0 +
      (uSquared *
        (4096.0 + uSquared * (uSquared * (320.0 - 175.0 * uSquared) - 768.0))) /
        16384.0

    const B =
      (uSquared *
        (256.0 + uSquared * (uSquared * (74.0 - 47.0 * uSquared) - 128.0))) /
      1024.0

    const cosineSquaredTwiceSigmaMidpoint =
      cosineTwiceSigmaMidpoint * cosineTwiceSigmaMidpoint
    const deltaSigma =
      B *
      sineSigma *
      (cosineTwiceSigmaMidpoint +
        (B *
          (cosineSigma * (2.0 * cosineSquaredTwiceSigmaMidpoint - 1.0) -
            (B *
              cosineTwiceSigmaMidpoint *
              (4.0 * sineSigma * sineSigma - 3.0) *
              (4.0 * cosineSquaredTwiceSigmaMidpoint - 3.0)) /
              6.0)) /
          4.0)

    const distance = minor * A * (sigma - deltaSigma)

    const startHeading = Math.atan2(
      cosineU2 * sineLambda,
      cs - sc * cosineLambda
    )
    const endHeading = Math.atan2(cosineU1 * sineLambda, cs * cosineLambda - sc)

    this._distance = distance
    this._startHeading = startHeading
    this._endHeading = endHeading
    this._uSquared = uSquared
  }

  private _computeDeltaLambda(
    f: number,
    sineAlpha: number,
    cosineSquaredAlpha: number,
    sigma: number,
    sineSigma: number,
    cosineSigma: number,
    cosineTwiceSigmaMidpoint: number
  ) {
    const C = this._computeC(f, cosineSquaredAlpha)

    return (
      (1.0 - C) *
      f *
      sineAlpha *
      (sigma +
        C *
          sineSigma *
          (cosineTwiceSigmaMidpoint +
            C *
              cosineSigma *
              (2.0 * cosineTwiceSigmaMidpoint * cosineTwiceSigmaMidpoint -
                1.0)))
    )
  }

  private _computeC(f: number, cosineSquaredAlpha: number) {
    return (
      (f * cosineSquaredAlpha * (4.0 + f * (4.0 - 3.0 * cosineSquaredAlpha))) /
      16.0
    )
  }
}
