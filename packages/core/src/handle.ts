import { inject, provide, type InjectionKey } from 'vue-demi'
import type { VcodeContext } from './use-vcode'

/**
 * Reverse channel letting an outer wrapper (the default `Vcode` composition)
 * capture the root's state machine to re-expose `reset()` on template refs.
 */
export interface VcodeHandle {
  register: (ctx: VcodeContext) => void
}

const key: InjectionKey<VcodeHandle> = Symbol('VcodeHandle')

export function provideVcodeHandle(handle: VcodeHandle): void {
  provide(key, handle)
}

export function injectVcodeHandle(): VcodeHandle | null {
  return inject(key, null)
}
