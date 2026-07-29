import { defineComponent, type DefineComponent, getCurrentInstance, onBeforeUnmount, onMounted } from 'vue-demi'
import { hCompat, useVcodeContext, type VcodeCanvasKey } from '@vue-puzzle-vcode/core'

/** Shared mount/unmount canvas registration. The canvas is the component's
 *  single root node, so `proxy.$el` is the element on both Vue versions. */
function useCanvasRegistration(key: VcodeCanvasKey, consumerName: string) {
  const ctx = useVcodeContext(consumerName)
  const vm = getCurrentInstance()
  onMounted(() => ctx.registerCanvas(key, (vm?.proxy?.$el as HTMLCanvasElement | undefined) ?? null))
  onBeforeUnmount(() => ctx.registerCanvas(key, null))
  return ctx
}

/** Main canvas: background image with the puzzle-shaped hole. */
export const VcodeCanvasMain: DefineComponent = defineComponent({
  name: 'VcodeCanvasMain',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const ctx = useCanvasRegistration('main', 'VcodeCanvasMain')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat('canvas', {
        class: ['vpv-canvas-main', extraClass],
        style: [{ width: `${ctx.config.canvasWidth}px`, height: `${ctx.config.canvasHeight}px` }, style],
        attrs: {
          ...rest,
          width: ctx.config.canvasWidth,
          height: ctx.config.canvasHeight,
        },
      })
    }
  },
})

/** Floating puzzle piece canvas; translateX follows the slider. */
export const VcodeCanvasPuzzle: DefineComponent = defineComponent({
  name: 'VcodeCanvasPuzzle',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const ctx = useCanvasRegistration('puzzle', 'VcodeCanvasPuzzle')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat('canvas', {
        class: ['vpv-canvas-puzzle', extraClass],
        style: [
          {
            width: `${ctx.puzzleBaseSize.value}px`,
            height: `${ctx.config.canvasHeight}px`,
            transform: `translateX(${ctx.puzzleTranslateX.value}px)`,
          },
          style,
        ],
        attrs: {
          ...rest,
          width: ctx.puzzleBaseSize.value,
          height: ctx.config.canvasHeight,
        },
      })
    }
  },
})

/** Full-picture canvas revealed (opacity fade) on success. */
export const VcodeCanvasSuccess: DefineComponent = defineComponent({
  name: 'VcodeCanvasSuccess',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const ctx = useCanvasRegistration('success', 'VcodeCanvasSuccess')
    return () => {
      const { class: extraClass, style, ...rest } = attrs
      return hCompat('canvas', {
        class: ['vpv-canvas-success', { 'vpv-canvas-success--show': ctx.isSuccess.value }, extraClass],
        style: [{ width: `${ctx.config.canvasWidth}px`, height: `${ctx.config.canvasHeight}px` }, style],
        attrs: {
          ...rest,
          width: ctx.config.canvasWidth,
          height: ctx.config.canvasHeight,
        },
      })
    }
  },
})
