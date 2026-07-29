import { createContext } from './context'
import type { VcodeContext } from './use-vcode'

/**
 * Shared context pair for the `Vcode*` component family.
 * `VcodeRoot` provides; every other part injects with a descriptive error
 * when used standalone.
 */
export const [useVcodeContext, provideVcodeContext] = createContext<VcodeContext>('VcodeRoot')

export { createContext, type ContextPair } from './context'
export { provideVcodeHandle, injectVcodeHandle, type VcodeHandle } from './handle'
export { hCompat, isVue2, isVue3, type HCompatProps, type HCompatChildren } from './compat'
export { useEventListener } from './use-event-listener'
export {
  useVcode,
  type VcodePropsLike,
  type VcodeEmitters,
  type VcodeCanvasKey,
  type VcodeContext,
} from './use-vcode'
