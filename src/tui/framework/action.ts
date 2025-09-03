export type ActionMap = Record<string, ActionHandler>

export interface ActionHandler {}

export interface Action {
  type: string
  details?: any
}
