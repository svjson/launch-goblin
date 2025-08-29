export interface DirtyEvent {
  type: 'dirty'
}

export interface CheckboxEvent {
  type: 'checkbox'
  item: SelectableItem
  checked: boolean
}

export interface TextChangedEvent {
  type: 'text-changed'
  value: string
}

export interface FocusEvent {
  type: 'focus'
  component: Controller
}

export interface DestroyedEvent {
  type: 'destroyed'
  component: Controller
}

export interface LogEvent {
  type: 'log'
  message: string
}

export interface ActionEvent {
  type: 'action'
  action: Action
}

export interface AnyEvent {
  type: string
}

export type Event =
  | ActionEvent
  | DirtyEvent
  | CheckboxEvent
  | DestroyedEvent
  | FocusEvent
  | LogEvent
  | TextChangedEvent
  | AnyEvent
