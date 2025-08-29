export interface KeyMapArg {
  replace: boolean
  keys: KeyMap
}

export type KeyMap = Record<string, KeyHandler>

export type KeyIdentifier = string | string[]

export interface KeyHandler {
  propagate?: boolean
  legend: string
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
