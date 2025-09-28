import { Controller } from './controller'

export type KeyMap = Record<string, KeyHandler>

export type KeyIdentifier = string | string[]

export interface KeyHandler {
  propagate?: boolean
  legend?: string
  group?: string
  handler: Function
}

export interface LegendGroup {
  symbol: string
  description: string
}

export interface LegendKey {
  symbol: string
  description: string
}

export type LegendEntry = LegendGroup | LegendKey

export const keyHandler = (
  keyMap: KeyMap,
  ch: string | undefined,
  key: any
) => {
  const reKeys = Object.keys(keyMap).filter(
    (pt) => pt.startsWith('/') && pt.endsWith('/')
  )

  if (ch !== undefined) {
    for (const pattern of reKeys) {
      if (ch.match(new RegExp(pattern.substring(1, pattern.length - 1)))) {
        return keyMap[pattern].handler
      }
    }
  }

  return keyMap[key.full]?.handler
}

/**
 * Get the effective KeyMap of a component, including entries that
 * would be caught by event bubbling.
 *
 * @param controller The controller to get the effective keymap for
 * @returns The effective keymap
 */
export const getEffectiveKeyMap = (controller: Controller) => {
  let keyMap: KeyMap = {}

  let next: Controller | undefined = controller

  while (next) {
    keyMap = { ...next.keyMap, ...keyMap }
    next = next.parent
  }

  return keyMap
}
