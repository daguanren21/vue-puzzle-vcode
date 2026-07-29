import { inject, provide, type InjectionKey } from 'vue-demi'

export interface ContextPair<T> {
  /** Provide the context value. Call inside the provider component's `setup()`. */
  provideContext: (value: T) => T
  /**
   * Inject the context value. Throws a descriptive error when the component
   * is used outside of its provider (Radix-style guard).
   */
  useContext: (consumerName?: string) => T
}

/**
 * Radix-style typed context factory built on provide/inject.
 *
 * ```ts
 * const [useVcodeContext, provideVcodeContext] = createContext<VcodeContext>('VcodeRoot')
 * ```
 */
export function createContext<T>(providerName: string): readonly [
  useContext: (consumerName?: string) => T,
  provideContext: (value: T) => T,
] {
  const key: InjectionKey<T> = Symbol(providerName)

  function provideContext(value: T): T {
    provide(key, value)
    return value
  }

  function useContext(consumerName = 'Component'): T {
    const ctx = inject(key, null)
    if (ctx === null) {
      throw new Error(`[vue-puzzle-vcode] \`${consumerName}\` must be used within \`${providerName}\``)
    }
    return ctx
  }

  return [useContext, provideContext] as const
}
