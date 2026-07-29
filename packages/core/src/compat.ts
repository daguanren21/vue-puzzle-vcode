import { h, version, type VNode } from 'vue-demi'

/** True when running on Vue 2.7.x (detected at runtime from `vue` itself). */
export const isVue2 = version.startsWith('2.')
/** True when running on Vue 3.x. */
export const isVue3 = !isVue2

/**
 * Vue-version-agnostic props for {@link hCompat}.
 *
 * Render-function signatures differ between Vue 2.7 (`createElement`: props
 * nested under `attrs`/`on`/`scopedSlots`) and Vue 3 (flat props, `onXxx`
 * listeners, object slots). This interface is the common denominator:
 *
 * - `class` / `style` — passed through (both versions normalize them)
 * - `attrs` — DOM attributes and/or component props (v2 pulls declared props
 *   out of `attrs`; v3 receives them flat)
 * - `on` — event handlers keyed by raw event name (`click`, `update:show`,
 *   `success`…). Mapped to `onClick` / `onUpdate:show` / `onSuccess` on v3.
 */
export interface HCompatProps {
  class?: unknown
  style?: unknown
  attrs?: Record<string, unknown>
  on?: Record<string, unknown>
}

/** Object form = component slots; array/string form = element children. */
export type HCompatChildren = Record<string, (...args: any[]) => unknown> | unknown[] | string | undefined

// The installed `vue` types describe v3's `h` only. Both the legacy (v2)
// call shape and our normalized children union are unexpressible in those
// types — one unchecked cast per call shape. Runtime behavior verified on
// Vue 2.7.16 and Vue 3.5.
type HLegacy = (type: unknown, data?: Record<string, unknown>, children?: unknown) => VNode
const hLegacy = h as unknown as HLegacy
const hV3 = h as unknown as HLegacy

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * `h()` that works identically on Vue 2.7 and Vue 3. See {@link HCompatProps}
 * for the normalized prop contract.
 */
export function hCompat(type: unknown, props: HCompatProps = {}, children?: HCompatChildren): VNode {
  const { class: cls, style, attrs, on } = props

  if (isVue2) {
    const data: Record<string, unknown> = {}
    if (cls != null) data.class = cls
    if (style != null) data.style = style
    if (attrs != null) data.attrs = attrs
    if (on != null) data.on = on
    if (children != null && !Array.isArray(children) && typeof children === 'object') {
      data.scopedSlots = children
      return hLegacy(type, data)
    }
    return hLegacy(type, data, children)
  }

  const v3props: Record<string, unknown> = { ...attrs }
  if (cls != null) v3props.class = cls
  if (style != null) v3props.style = style
  if (on != null) {
    for (const [name, handler] of Object.entries(on)) {
      v3props[`on${capitalize(name)}`] = handler
    }
  }
  return hV3(type, v3props, children)
}
