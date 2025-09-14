export interface KeyMapArg {
  replace: boolean
  keys: KeyMap
}

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
