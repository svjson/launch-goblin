import { Action } from './action'
import { Controller } from './controller'
import { KeyPress } from './input'

export type StringEvent = 'dirty' | 'pressed' | 'launch'

export interface TUIEventBase {
  source?: Controller
}

export type NoArgEvent = TUIEventBase & {
  type: StringEvent
}

export type CheckboxEvent = TUIEventBase & {
  type: 'checkbox'
  item: any
  checked: boolean
}

export type ItemSelectedEvent<T> = TUIEventBase & {
  type: 'selected'
  item: T
}

export type TextChangedEvent = TUIEventBase & {
  type: 'text-changed'
  value: string
}

export type FocusEvent = TUIEventBase & {
  type: 'focus'
  source: Controller
}

export type DestroyEvent = TUIEventBase & {
  type: 'destroy'
  source: Controller
}

export type DestroyedEvent = TUIEventBase & {
  type: 'destroyed'
}

export type LogEvent = TUIEventBase & {
  type: 'log'
  message: string
}

export type ActionEvent = TUIEventBase & {
  type: 'action'
  action: Action
}

export type KeyEvent = TUIEventBase & {
  type: 'key'
} & KeyPress

export type TUIEvent =
  | ActionEvent
  | KeyEvent
  | NoArgEvent
  | CheckboxEvent
  | DestroyEvent
  | DestroyedEvent
  | FocusEvent
  | ItemSelectedEvent<any>
  | LogEvent
  | TextChangedEvent

export type EventDefinition = Function | EventMap

export type EventMap = Record<string, Function>

export type ScopedEventMap = Record<string, EventDefinition>
