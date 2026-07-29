import { getCurrentScope, onScopeDispose } from 'vue-demi'

/**
 * Minimal `useEventListener`: binds immediately and auto-removes when the
 * current effect scope (component) is disposed. Returns a manual unbind.
 *
 * Self-contained on purpose — keeps the library dependency-free and safe on
 * both Vue 2.7 and Vue 3.
 */
export function useEventListener<E extends Event = Event>(
  target: EventTarget | null | undefined,
  type: string,
  listener: (event: E) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  const bound = listener as EventListener
  target?.addEventListener(type, bound, options)
  const off = () => target?.removeEventListener(type, bound, options)
  if (getCurrentScope()) onScopeDispose(off)
  return off
}
