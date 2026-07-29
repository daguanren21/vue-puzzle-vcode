import { defineComponent, type DefineComponent, onMounted, watch } from 'vue-demi'
import { hCompat, injectVcodeHandle, provideVcodeContext, useEventListener, useVcode } from '@vue-puzzle-vcode/core'
import { vcodeEmits, vcodeProps } from '../props'

/**
 * Headless root: owns the state machine, provides the `Vcode*` context and
 * wires document-level drag listeners. Renders a `display: contents` wrapper
 * (single root node keeps Vue 2.7 happy).
 */
const VcodeRootImpl = defineComponent({
  name: 'VcodeRoot',
  inheritAttrs: false,
  props: vcodeProps,
  emits: vcodeEmits,
  setup(props, { emit, slots, expose, attrs }) {
    const ctx = useVcode(props, {
      onSuccess: (diff) => emit('success', diff),
      onFail: (diff) => emit('fail', diff),
      onClose: () => {
        emit('update:show', false)
        emit('close')
      },
    })
    provideVcodeContext(ctx)
    injectVcodeHandle()?.register(ctx)

    watch(
      () => props.show,
      (visible) => {
        if (visible) {
          ctx.reset()
        } else {
          ctx.onHide()
        }
      },
    )

    onMounted(() => {
      if (props.show) ctx.reset()
    })

    useEventListener(document, 'mousemove', ctx.onPointerMove)
    useEventListener(document, 'mouseup', ctx.onPointerUp)
    useEventListener(document, 'touchmove', ctx.onPointerMove, { passive: false })
    useEventListener(document, 'touchend', ctx.onPointerUp)

    expose({ reset: ctx.reset, state: ctx })

    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat(
        'div',
        { class: ['vpv-root', extraClass], style, attrs: rest },
        slots.default?.() as unknown[],
      )
    }
  },
})

/**
 * Headless root: owns the state machine, provides the `Vcode*` context and
 * wires document-level drag listeners. Renders a `display: contents` wrapper
 * (single root node keeps Vue 2.7 happy).
 */
export const VcodeRoot = VcodeRootImpl as unknown as DefineComponent<typeof vcodeProps>
