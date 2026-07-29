import { defineComponent, type DefineComponent, onBeforeUnmount, onMounted, watch } from 'vue-demi'
import { hCompat, useVcodeContext } from '@vue-puzzle-vcode/core'

const BODY_LOCK_CLASS = 'vpv-body-lock'

// Process-wide reference count: with several overlays visible at once,
// closing one must not unlock the body while another is still showing.
let bodyLockCount = 0

/**
 * Fixed backdrop. Pointer gestures that start and end on the overlay (not on
 * the panel) request a close. Wraps `VcodePanel`.
 *
 * Also owns the body scroll-lock: it lives here rather than in `VcodeRoot`
 * so headless/inline usage without an overlay never locks the page.
 */
export const VcodeOverlay: DefineComponent = defineComponent({
  name: 'VcodeOverlay',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeOverlay')

    let locked = false
    const lock = () => {
      if (locked) return
      locked = true
      if (bodyLockCount++ === 0) document.body.classList.add(BODY_LOCK_CLASS)
    }
    const unlock = () => {
      if (!locked) return
      locked = false
      if (--bodyLockCount === 0) document.body.classList.remove(BODY_LOCK_CLASS)
    }
    watch(
      () => ctx.config.show,
      (visible) => (visible ? lock() : unlock()),
    )
    onMounted(() => {
      if (ctx.config.show) lock()
    })
    onBeforeUnmount(unlock)

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
  inheritAttrs: false,
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
  inheritAttrs: false,
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
