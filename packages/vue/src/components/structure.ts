import { defineComponent, type DefineComponent } from 'vue-demi'
import { hCompat, useVcodeContext } from '@vue-puzzle-vcode/core'

/**
 * Fixed backdrop. Pointer gestures that start and end on the overlay (not on
 * the panel) request a close. Wraps `VcodePanel`.
 */
export const VcodeOverlay: DefineComponent = defineComponent({
  name: 'VcodeOverlay',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeOverlay')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        {
          class: ['vpv-overlay', { 'vpv-overlay--show': ctx.config.show }, extraClass],
          style,
          attrs: rest,
          on: {
            mousedown: ctx.onOverlayDown,
            mouseup: ctx.onOverlayUp,
            touchstart: ctx.onOverlayDown,
            touchend: ctx.onOverlayUp,
          },
        },
        slots.default?.() as unknown[],
      )
    }
  },
})

/** Centered card container; swallows pointer events so they don't close. */
export const VcodePanel: DefineComponent = defineComponent({
  name: 'VcodePanel',
  setup(_, { slots, attrs }) {
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      const stop = (e: Event) => e.stopPropagation()
      return hCompat(
        'div',
        {
          class: ['vpv-panel', extraClass],
          style,
          attrs: rest,
          on: { mousedown: stop, touchstart: stop },
        },
        slots.default?.() as unknown[],
      )
    }
  },
})

/** Canvas area (the upper half of the card). */
export const VcodeBoard: DefineComponent = defineComponent({
  name: 'VcodeBoard',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeBoard')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        {
          class: ['vpv-board', extraClass],
          style: [{ height: `${ctx.config.canvasHeight}px` }, style],
          attrs: rest,
        },
        slots.default?.() as unknown[],
      )
    }
  },
})
