import { defineComponent, type DefineComponent, getCurrentInstance, onBeforeUnmount, onMounted, type PropType } from 'vue-demi'
import { hCompat } from '@vue-puzzle-vcode/core'

/**
 * Moves its DOM subtree to `document.body` (or a custom target) on mount —
 * the Vue 2.7-safe equivalent of `<Teleport>`.
 */
const portalProps = {
  /** CSS selector or element to portal into. Defaults to `document.body`. */
  to: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
} as const

const VcodePortalImpl = defineComponent({
  name: 'VcodePortal',
  inheritAttrs: false,
  props: portalProps,
  setup(props, { slots, attrs }) {
    const vm = getCurrentInstance()

    onMounted(() => {
      const el = vm?.proxy?.$el as HTMLElement | undefined
      if (!el) return
      const target =
        (typeof props.to === 'string' ? document.querySelector(props.to) : props.to) ?? document.body
      target.appendChild(el)
    })

    onBeforeUnmount(() => {
      const el = vm?.proxy?.$el as HTMLElement | undefined
      el?.parentNode?.removeChild(el)
    })

    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        { class: ['vpv-portal', extraClass], style, attrs: rest },
        slots.default?.() as unknown[],
      )
    }
  },
})

/**
 * Moves its DOM subtree to `document.body` (or a custom target) on mount —
 * the Vue 2.7-safe equivalent of `<Teleport>`.
 */
export const VcodePortal = VcodePortalImpl as unknown as DefineComponent<typeof portalProps>
