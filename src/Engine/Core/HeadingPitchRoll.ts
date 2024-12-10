export default class HeadingPitchRoll {
  heading: number // 航向角(绕 Z 轴旋转的角度)
  pitch: number // 俯仰角(绕 Y 轴旋转的角度)
  roll: number // 滚动角(绕 X 轴旋转的角度)
  constructor(heading: number = 0.0, pitch: number = 0.0, roll: number = 0.0) {
    this.heading = heading
    this.pitch = pitch
    this.roll = roll
  }
}
