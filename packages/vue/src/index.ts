import type { Component } from 'vue-demi'
import { Vcode } from './components/Vcode'
import { VcodeRoot } from './components/Root'
import { VcodePortal } from './components/Portal'
import { VcodeBoard, VcodeOverlay, VcodePanel } from './components/structure'
import { VcodeCanvasMain, VcodeCanvasPuzzle, VcodeCanvasSuccess } from './components/canvases'
import { VcodeFlash, VcodeLoading, VcodeMessage, VcodeRefresh } from './components/feedback'
import { VcodeSlider, VcodeSliderProgress, VcodeSliderThumb } from './components/slider'

import './styles.css'

export {
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
}

// Headless API for building fully custom parts
export {
  createContext,
  hCompat,
  isVue2,
  isVue3,
  useEventListener,
  useVcode,
  useVcodeContext,
  provideVcodeContext,
  type VcodeContext,
} from '@vue-puzzle-vcode/core'

const allComponents: Record<string, Component> = {
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
}

/** `app.use(VcodePlugin)` — registers every part globally. Works on Vue 2.7
 *  (`Vue.use`) and Vue 3 (`app.use`). */
export const VcodePlugin = {
  install(app: { component: (name: string, comp: Component) => unknown }) {
    for (const [name, comp] of Object.entries(allComponents)) {
      app.component(name, comp)
    }
  },
}

export default Vcode
