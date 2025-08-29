export interface KeyMapArg {
  replace: boolean
  keys: KeyMap
}

export type KeyMap = Record<string, KeyHandler>

export type KeyIdentifier = string | string[]
export interface KeyHandler {
  propagate?: boolean
  handler: Function
}
