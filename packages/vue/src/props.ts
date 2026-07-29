import type { PropType } from 'vue-demi'

/** Prop declarations shared by `VcodeRoot` and the default `Vcode` composition. */
export const vcodeProps = {
  /** Visibility, controlled by the parent (`v-model:show` / `:show.sync`). */
  show: { type: Boolean, default: false },
  /** Main canvas width. */
  canvasWidth: { type: Number, default: 310 },
  /** Main canvas height. */
  canvasHeight: { type: Number, default: 160 },
  /** Puzzle block scale, clamped to 0.2..2. */
  puzzleScale: { type: Number, default: 1 },
  /** Slider thumb size. */
  sliderSize: { type: Number, default: 50 },
  /** Allowed pixel deviation for a successful match. */
  range: { type: Number, default: 10 },
  /** Custom background images; falls back to generated art. */
  imgs: { type: Array as PropType<string[]>, default: undefined },
  successText: { type: String, default: '验证通过！' },
  failText: { type: String, default: '验证失败，请重试' },
  sliderText: { type: String, default: '拖动滑块完成拼图' },
}

export const vcodeEmits = ['update:show', 'success', 'fail', 'close']
