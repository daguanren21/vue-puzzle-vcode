import { defineComponent, type DefineComponent, getCurrentInstance, onBeforeUnmount, onMounted } from 'vue-demi'
import { hCompat, useVcodeContext } from '@vue-puzzle-vcode/core'

/**
 * Slider track. Renders the hint text plus the default slot
 * (`VcodeSliderProgress` + `VcodeSliderThumb`).
 * Slot `text`: custom hint content.
 */
export const VcodeSlider: DefineComponent = defineComponent({
  name: 'VcodeSlider',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeSlider')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        {
          class: ['vpv-slider', extraClass],
          style: [{ height: `${ctx.sliderBaseSize.value}px` }, style],
          attrs: rest,
        },
        [
          slots.text?.() ?? hCompat('div', { class: 'vpv-slider-text' }, ctx.config.sliderText),
          ...((slots.default?.() as unknown[]) ?? []),
        ] as unknown[],
      )
    }
  },
})

/** Filled portion of the track; width follows the drag. Registers the
 *  element the state machine measures at drag start. */
export const VcodeSliderProgress: DefineComponent = defineComponent({
  name: 'VcodeSliderProgress',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeSliderProgress')
    const vm = getCurrentInstance()
    onMounted(() => ctx.registerProgress((vm?.proxy?.$el as HTMLElement | undefined) ?? null))
    onBeforeUnmount(() => ctx.registerProgress(null))
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        {
          class: ['vpv-slider-progress', extraClass],
          style: [{ width: `${ctx.styleWidth.value}px` }, style],
          attrs: rest,
        },
        slots.default?.() as unknown[],
      )
    }
  },
})

/** Draggable thumb. Slot: custom thumb content (default: 3 grip bars). */
export const VcodeSliderThumb: DefineComponent = defineComponent({
  name: 'VcodeSliderThumb',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeSliderThumb')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        {
          class: ['vpv-slider-thumb', { 'vpv-slider-thumb--down': ctx.mouseDown.value }, extraClass],
          style: [{ width: `${ctx.sliderBaseSize.value}px` }, style],
          attrs: rest,
          on: { mousedown: ctx.onThumbDown, touchstart: ctx.onThumbDown },
        },
        [
          slots.default?.() ?? [
            hCompat('div'),
            hCompat('div'),
            hCompat('div'),
          ],
        ] as unknown[],
      )
    }
  },
})
