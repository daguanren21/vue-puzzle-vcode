import { defineComponent, type DefineComponent } from 'vue-demi'
import { hCompat, useVcodeContext } from '@vue-puzzle-vcode/core'
import { RESET_ICON } from '@vue-puzzle-vcode/shared'

/** Shine sweep across the picture on success. */
export const VcodeFlash: DefineComponent = defineComponent({
  name: 'VcodeFlash',
  setup(_, { attrs }) {
    const ctx = useVcodeContext('VcodeFlash')
    return () =>
      hCompat('div', {
        class: ['vpv-flash', { 'vpv-flash--show': ctx.isSuccess.value }],
        style: {
          transform: `translateX(${
            ctx.isSuccess.value
              ? `${ctx.config.canvasWidth + ctx.config.canvasHeight * 0.578}px`
              : `-${ctx.config.canvasHeight * 0.578}px`
          }) skew(-30deg, 0)`,
        },
        attrs,
      })
  },
})

/** Loading overlay shown while the background image loads. Slot: custom spinner. */
export const VcodeLoading: DefineComponent = defineComponent({
  name: 'VcodeLoading',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeLoading')
    return () =>
      hCompat(
        'div',
        {
          class: ['vpv-loading', { 'vpv-loading--hide': !ctx.loading.value }],
          attrs,
        },
        [
          slots.default?.() ??
            hCompat('div', { class: 'vpv-loading-spinner' }, [
              hCompat('span'),
              hCompat('span'),
              hCompat('span'),
              hCompat('span'),
              hCompat('span'),
            ]),
        ] as unknown[],
      )
  },
})

/**
 * Result message bar (success green / fail red).
 * Slot scope: `{ text, fail }`.
 */
export const VcodeMessage: DefineComponent = defineComponent({
  name: 'VcodeMessage',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeMessage')
    return () =>
      hCompat(
        'div',
        {
          class: [
            'vpv-message',
            { 'vpv-message--show': ctx.infoBoxShow.value, 'vpv-message--fail': ctx.infoBoxFail.value },
          ],
          attrs,
        },
        [
          slots.default?.({ text: ctx.infoText.value, fail: ctx.infoBoxFail.value }) ??
            ctx.infoText.value,
        ] as unknown[],
      )
  },
})

/** Refresh button; regenerates the puzzle on click. Slot: custom content. */
export const VcodeRefresh: DefineComponent = defineComponent({
  name: 'VcodeRefresh',
  setup(_, { slots, attrs }) {
    const ctx = useVcodeContext('VcodeRefresh')
    return () =>
      hCompat(
        'div',
        {
          class: 'vpv-refresh',
          attrs: { ...attrs, role: 'button', 'aria-label': 'refresh' },
          on: { click: () => ctx.reset() },
        },
        [slots.default?.() ?? hCompat('img', { attrs: { src: RESET_ICON, alt: 'refresh' } })] as unknown[],
      )
  },
})
