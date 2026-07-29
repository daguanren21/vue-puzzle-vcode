import { defineComponent, type DefineComponent } from 'vue-demi'
import { hCompat, provideVcodeHandle, type VcodeContext } from '@vue-puzzle-vcode/core'
import { vcodeEmits, vcodeProps } from '../props'
import { VcodeRoot } from './Root'
import { VcodePortal } from './Portal'
import { VcodeBoard, VcodeOverlay, VcodePanel } from './structure'
import { VcodeCanvasMain, VcodeCanvasPuzzle, VcodeCanvasSuccess } from './canvases'
import { VcodeFlash, VcodeLoading, VcodeMessage, VcodeRefresh } from './feedback'
import { VcodeSlider, VcodeSliderProgress, VcodeSliderThumb } from './slider'

/**
 * Default drop-in composition of all `Vcode*` parts — the successor of the
 * v1 single-file component. Accepts the same props/events as `VcodeRoot`.
 *
 * Slots (all optional): `loading`, `message({ text, fail })`, `refresh`,
 * `thumb`, `slider-text`.
 */
const VcodeImpl = defineComponent({
  name: 'Vcode',
  props: vcodeProps,
  emits: vcodeEmits,
  setup(props, { emit, slots, expose }) {
    // Bridge the root's context back so template-ref users get `reset()`,
    // mirroring the v1 `this.$refs.vcode.reset()` API.
    let state: VcodeContext | null = null
    provideVcodeHandle({
      register: (ctx) => {
        state = ctx
      },
    })
    expose({
      reset: () => state?.reset(),
      getState: () => state,
    })

    return () =>
      hCompat(
        VcodeRoot,
        {
          attrs: { ...props },
          on: {
            'update:show': (v: boolean) => emit('update:show', v),
            success: (d: number) => emit('success', d),
            fail: (d: number) => emit('fail', d),
            close: () => emit('close'),
          },
        },
        {
          default: () => [
            hCompat(
              VcodePortal,
              {},
              {
                default: () => [
                  hCompat(
                    VcodeOverlay,
                    {},
                    {
                      default: () => [
                        hCompat(
                          VcodePanel,
                          {},
                          {
                            default: () => [
                              hCompat(
                                VcodeBoard,
                                {},
                                {
                                  default: () => [
                                    hCompat(VcodeCanvasMain),
                                    hCompat(VcodeCanvasSuccess),
                                    hCompat(VcodeCanvasPuzzle),
                                    hCompat(VcodeLoading, {}, slots.loading ? { default: slots.loading } : undefined),
                                    hCompat(VcodeMessage, {}, slots.message ? { default: slots.message } : undefined),
                                    hCompat(VcodeFlash),
                                    hCompat(VcodeRefresh, {}, slots.refresh ? { default: slots.refresh } : undefined),
                                  ],
                                },
                              ),
                              hCompat(
                                VcodeSlider,
                                {},
                                {
                                  default: () => [
                                    hCompat(
                                      VcodeSliderProgress,
                                      {},
                                      {
                                        default: () => [
                                          hCompat(VcodeSliderThumb, {}, slots.thumb ? { default: slots.thumb } : undefined),
                                        ],
                                      },
                                    ),
                                  ],
                                  ...(slots['slider-text'] ? { text: slots['slider-text'] } : {}),
                                },
                              ),
                            ],
                          },
                        ),
                      ],
                    },
                  ),
                ],
              },
            ),
          ],
        },
      )
  },
})

/**
 * Default drop-in composition of all `Vcode*` parts — the successor of the
 * v1 single-file component. Accepts the same props/events as `VcodeRoot`.
 *
 * Slots (all optional): `loading`, `message({ text, fail })`, `refresh`,
 * `thumb`, `slider-text`.
 */
export const Vcode = VcodeImpl as unknown as DefineComponent<typeof vcodeProps>
