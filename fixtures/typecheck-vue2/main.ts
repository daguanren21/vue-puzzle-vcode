/**
 * Consumer-side type contract test: this file is compiled against the
 * PUBLISHED declarations of vue-puzzle-vcode with `skipLibCheck: false`,
 * once per supported Vue version (2.7 / 3.x). It must typecheck on both.
 *
 * Note: components are rendered through our own `hCompat` — Vue 2.7's raw
 * `h()` types reject `DefineComponent` (a limitation of vue 2.7's own
 * declarations, not of this library). Template usage is covered by the
 * playgrounds.
 */
import { ref } from 'vue'
import {
  Vcode,
  VcodeRoot,
  VcodePortal,
  VcodeOverlay,
  VcodePanel,
  VcodeBoard,
  VcodeCanvasMain,
  VcodeCanvasPuzzle,
  VcodeCanvasSuccess,
  VcodeFlash,
  VcodeLoading,
  VcodeMessage,
  VcodeRefresh,
  VcodeSlider,
  VcodeSliderProgress,
  VcodeSliderThumb,
  VcodePlugin,
  createContext,
  hCompat,
  isVue2,
  isVue3,
  useEventListener,
  useVcode,
  useVcodeContext,
  provideVcodeContext,
} from 'vue-puzzle-vcode'

// --- Components are renderable with props, events and slots -----------------
const tree = hCompat(
  Vcode,
  {
    attrs: {
      show: true,
      canvasWidth: 320,
      canvasHeight: 160,
      puzzleScale: 1,
      sliderSize: 40,
      range: 10,
      successText: 'ok',
      failText: 'no',
      sliderText: 'slide',
    },
    on: {
      success: (diff: number) => diff,
      fail: (diff: number) => diff,
      'update:show': (v: boolean) => v,
    },
  },
  {
    loading: () => 'loading…',
    message: ({ text, fail }: { text: string; fail: number }) => `${text}:${fail}`,
    thumb: () => 'drag',
  },
)

// --- Headless composition of parts ------------------------------------------
const parts = hCompat(VcodeRoot, { attrs: { show: false, range: 5 } }, { default: () => [
  hCompat(VcodePortal, { attrs: { to: 'body' } }),
  hCompat(VcodeOverlay),
  hCompat(VcodePanel),
  hCompat(VcodeBoard),
  hCompat(VcodeCanvasMain),
  hCompat(VcodeCanvasPuzzle),
  hCompat(VcodeCanvasSuccess),
  hCompat(VcodeFlash),
  hCompat(VcodeLoading),
  hCompat(VcodeMessage),
  hCompat(VcodeRefresh),
  hCompat(VcodeSlider),
  hCompat(VcodeSliderProgress),
  hCompat(VcodeSliderThumb),
] })

// --- Plugin ------------------------------------------------------------------
const installer: (app: unknown) => void = VcodePlugin.install as (app: unknown) => void

// --- Composables -------------------------------------------------------------
const count = ref(0)
useEventListener(document, 'click', () => count.value++)

const [useContext, provideContext] = createContext<{ id: number }>('Fixture')
provideContext({ id: 1 })
const injected = useContext()

const vcode = useVcode(
  {
    show: true,
    canvasWidth: 300,
    canvasHeight: 150,
    puzzleScale: 1,
    sliderSize: 40,
    range: 10,
    successText: 'ok',
    failText: 'no',
    sliderText: 'slide',
  },
  {},
)
const ctx = useVcodeContext('FixtureConsumer')
if (ctx) provideVcodeContext(ctx)

// --- hCompat + version flags --------------------------------------------------
const node = hCompat(
  'button',
  { class: ['a'], style: { color: 'red' }, attrs: { type: 'button' }, on: { click: () => 1 } },
  ['ok'],
)
const flags: [boolean, boolean] = [isVue2, isVue3]

export { tree, parts, installer, injected, vcode, node, flags }
