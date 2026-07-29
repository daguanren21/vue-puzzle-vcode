import { computed, onScopeDispose, ref, shallowRef } from 'vue-demi'
import type { ComputedRef, Ref, ShallowRef } from 'vue-demi'
import {
  computePuzzleBaseSize,
  computeSliderBaseSize,
  drawPuzzleFrame,
  generateRandomImage,
  loadImage,
  randomInt,
} from '@vue-puzzle-vcode/shared'

/** Reactive props the state machine reads (owned by `VcodeRoot`). */
export interface VcodePropsLike {
  show: boolean
  canvasWidth: number
  canvasHeight: number
  puzzleScale: number
  sliderSize: number
  range: number
  imgs?: string[] | undefined
  successText: string
  failText: string
  sliderText: string
}

/** Event callbacks wired to the root component's emits. */
export interface VcodeEmitters {
  onSuccess?: (diff: number) => void
  onFail?: (diff: number) => void
  onClose?: () => void
}

export type VcodeCanvasKey = 'main' | 'puzzle' | 'success'

/**
 * Public return type of {@link useVcode}. Declared explicitly (instead of
 * inferred) with single-argument `Ref<T>` / `ShallowRef<T>` applications so
 * the emitted declarations typecheck against both Vue 2.7 (`Ref<T>`) and
 * Vue 3 (`Ref<T, S = T>`) typings.
 */
export interface UseVcodeReturn {
  /** Reactive props owned by the root (sizes, texts, show…). */
  config: VcodePropsLike
  // state
  mouseDown: Ref<boolean>
  loading: Ref<boolean>
  isCanSlide: Ref<boolean>
  infoBoxShow: Ref<boolean>
  infoText: Ref<string>
  infoBoxFail: Ref<boolean>
  isSuccess: Ref<boolean>
  isSubmting: Ref<boolean>
  pinX: Ref<number>
  pinY: Ref<number>
  // computeds
  puzzleBaseSize: ComputedRef<number>
  sliderBaseSize: ComputedRef<number>
  styleWidth: ComputedRef<number>
  puzzleTranslateX: ComputedRef<number>
  // registry
  canvases: Record<VcodeCanvasKey, ShallowRef<HTMLCanvasElement | undefined>>
  progressEl: ShallowRef<HTMLElement | undefined>
  registerCanvas: (key: VcodeCanvasKey, el: HTMLCanvasElement | null) => void
  registerProgress: (el: HTMLElement | null) => void
  // actions
  init: (withCanvas?: boolean) => Promise<void>
  reset: () => void
  submit: () => void
  onHide: () => void
  onThumbDown: (e: MouseEvent | TouchEvent) => void
  onPointerMove: (e: MouseEvent | TouchEvent) => void
  onPointerUp: () => void
  requestClose: () => void
  onOverlayDown: () => void
  onOverlayUp: () => void
}

const clientXOf = (e: MouseEvent | TouchEvent): number => {
  const t = (e as TouchEvent).changedTouches
  return t && t.length > 0 ? t[0]!.clientX : (e as MouseEvent).clientX
}

/**
 * Headless sliding-puzzle state machine. `VcodeRoot` creates it and provides
 * the result through context; every `Vcode*` part consumes slices of it.
 *
 * The drag math, verification tolerance and drawing flow are a faithful port
 * of the original `vue-puzzle-vcode` component.
 */
export function useVcode(props: VcodePropsLike, emits: VcodeEmitters): UseVcodeReturn {
  // ---------------------------------------------------------------- state
  const mouseDown = ref(false) // pointer is pressed on the thumb
  const startWidth = ref(props.sliderSize) // progress width when drag started
  const startX = ref(0) // clientX when drag started
  const newX = ref(0) // current pointer clientX
  const pinX = ref(0) // puzzle anchor X
  const pinY = ref(0) // puzzle anchor Y
  const loading = ref(false) // image loading in flight
  const isCanSlide = ref(false) // slider armed (image ready)
  const infoBoxShow = ref(false)
  const infoText = ref('')
  const infoBoxFail = ref(false)
  const isSuccess = ref(false)
  const isSubmting = ref(false) // verdict in progress (blocks reset/close)
  const imgIndex = ref(-1) // last used imgs[] index (avoids repeats)

  let timer: ReturnType<typeof setTimeout> | undefined
  let closeDown = false // guards the macOS click-through bug (see original)

  // ------------------------------------------------------------ computeds
  const puzzleBaseSize = computed(() => computePuzzleBaseSize(props.puzzleScale))
  const sliderBaseSize = computed(() => computeSliderBaseSize(props.sliderSize, props.canvasWidth))
  /** Progress width while dragging, clamped to [sliderSize, canvasWidth]. */
  const styleWidth = computed(() => {
    const w = startWidth.value + newX.value - startX.value
    return w < sliderBaseSize.value
      ? sliderBaseSize.value
      : w > props.canvasWidth
        ? props.canvasWidth
        : w
  })
  /** translateX of the floating puzzle piece, synced to the slider. */
  const puzzleTranslateX = computed(
    () =>
      styleWidth.value -
      sliderBaseSize.value -
      (puzzleBaseSize.value - sliderBaseSize.value) *
        ((styleWidth.value - sliderBaseSize.value) / (props.canvasWidth - sliderBaseSize.value)),
  )

  // ---------------------------------------------------- element registry
  const canvases = {
    main: shallowRef<HTMLCanvasElement>(),
    puzzle: shallowRef<HTMLCanvasElement>(),
    success: shallowRef<HTMLCanvasElement>(),
  }
  const progressEl = shallowRef<HTMLElement>()

  function registerCanvas(key: VcodeCanvasKey, el: HTMLCanvasElement | null) {
    canvases[key].value = el ?? undefined
  }
  function registerProgress(el: HTMLElement | null) {
    progressEl.value = el ?? undefined
  }

  // -------------------------------------------------------------- helpers
  function clearTimer() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  onScopeDispose(clearTimer)

  // --------------------------------------------------------------- render
  /**
   * (Re)draw a frame: pick a puzzle position, load a background image and
   * paint all three canvases. `withCanvas` forces a generated image.
   */
  async function init(withCanvas = false): Promise<void> {
    // concurrent draws would corrupt the canvas state (original guard)
    if (loading.value && !withCanvas) return
    const main = canvases.main.value
    const puzzle = canvases.puzzle.value
    const success = canvases.success.value
    if (!main || !puzzle || !success) return // canvases not mounted yet

    loading.value = true
    isCanSlide.value = false

    pinX.value = randomInt(puzzleBaseSize.value, props.canvasWidth - puzzleBaseSize.value - 20)
    pinY.value = randomInt(20, props.canvasHeight - puzzleBaseSize.value - 20)

    let src: string
    const imgs = props.imgs
    if (!withCanvas && imgs && imgs.length > 0) {
      let n = randomInt(0, imgs.length - 1)
      if (n === imgIndex.value) n = n === imgs.length - 1 ? 0 : n + 1
      imgIndex.value = n
      src = imgs[n]!
    } else {
      src = generateRandomImage(props.canvasWidth, props.canvasHeight)
    }

    try {
      const img = await loadImage(src)
      // Canvas element swapped mid-load (HMR / v-if remount): unstick
      // `loading` and redraw onto the new elements. On full teardown the
      // registry reads undefined and init() bails at the presence check.
      if (canvases.main.value !== main) {
        loading.value = false
        return init()
      }
      drawPuzzleFrame({ main, puzzle, success }, img, {
        canvasWidth: props.canvasWidth,
        canvasHeight: props.canvasHeight,
        puzzleScale: props.puzzleScale,
        puzzleBaseSize: puzzleBaseSize.value,
        pinX: pinX.value,
        pinY: pinY.value,
      })
    } catch {
      // image failed (CORS/404): retry once with a generated image
      return init(true)
    }
    loading.value = false
    isCanSlide.value = true
  }

  // ----------------------------------------------------------------- drag
  function onThumbDown(e: MouseEvent | TouchEvent) {
    if (!isCanSlide.value) return
    mouseDown.value = true
    startWidth.value = progressEl.value?.clientWidth ?? sliderBaseSize.value
    const x = clientXOf(e)
    newX.value = x
    startX.value = x
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!mouseDown.value) return
    e.preventDefault()
    newX.value = clientXOf(e)
  }

  function onPointerUp() {
    if (!mouseDown.value) return
    mouseDown.value = false
    submit()
  }

  // -------------------------------------------------------------- verdict
  function submit() {
    isSubmting.value = true
    // deviation = anchor - dragged distance + width-gap compensation - shadow offset
    const x = Math.abs(
      pinX.value -
        (styleWidth.value - sliderBaseSize.value) +
        (puzzleBaseSize.value - sliderBaseSize.value) *
          ((styleWidth.value - sliderBaseSize.value) / (props.canvasWidth - sliderBaseSize.value)) -
        3,
    )
    clearTimer()
    if (x < props.range) {
      infoText.value = props.successText
      infoBoxFail.value = false
      infoBoxShow.value = true
      isCanSlide.value = false
      isSuccess.value = true
      timer = setTimeout(() => {
        isSubmting.value = false
        emits.onSuccess?.(x)
      }, 800)
    } else {
      infoText.value = props.failText
      infoBoxFail.value = true
      infoBoxShow.value = true
      isCanSlide.value = false
      emits.onFail?.(x)
      timer = setTimeout(() => {
        isSubmting.value = false
        reset()
      }, 800)
    }
  }

  function resetState() {
    infoBoxFail.value = false
    infoBoxShow.value = false
    isCanSlide.value = false
    isSuccess.value = false
    startWidth.value = sliderBaseSize.value
    startX.value = 0
    newX.value = 0
  }

  /** Public: redraw with a fresh puzzle. No-op while a verdict is pending. */
  function reset() {
    if (isSubmting.value) return
    resetState()
    void init()
  }

  /** Called when the captcha is hidden: cancel the pending verdict emit
   *  and clear verdict UI state. */
  function onHide() {
    clearTimer()
    isSubmting.value = false
    isSuccess.value = false
    infoBoxShow.value = false
  }

  // ---------------------------------------------------------------- close
  function requestClose() {
    if (!mouseDown.value && !isSubmting.value) {
      clearTimer()
      emits.onClose?.()
    }
  }

  function onOverlayDown() {
    closeDown = true
  }

  function onOverlayUp() {
    if (closeDown) requestClose()
    closeDown = false
  }

  return {
    /** Reactive props owned by the root (sizes, texts, show…). */
    config: props,
    // state
    mouseDown,
    loading,
    isCanSlide,
    infoBoxShow,
    infoText,
    infoBoxFail,
    isSuccess,
    isSubmting,
    pinX,
    pinY,
    // computeds
    puzzleBaseSize,
    sliderBaseSize,
    styleWidth,
    puzzleTranslateX,
    // registry
    canvases,
    progressEl,
    registerCanvas,
    registerProgress,
    // actions
    init,
    reset,
    submit,
    onHide,
    onThumbDown,
    onPointerMove,
    onPointerUp,
    requestClose,
    onOverlayDown,
    onOverlayUp,
  }
}

export type VcodeContext = UseVcodeReturn
