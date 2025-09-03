export type ActionMap = Record<string, ActionHandler>

export type ActionHandler = (action: Action) => Promise<void>

export interface Action {
  type: string
  details?: any
}
