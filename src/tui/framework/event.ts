import { Action } from './action'
import { SelectableItem } from './checkbox'
import { Controller } from './controller'

export type StringEvent = 'dirty' | 'pressed' | 'launch'

export interface NoArgEvent {
  type: StringEvent
}

export interface CheckboxEvent {
  type: 'checkbox'
  item: SelectableItem
  checked: boolean
}

export interface ItemSelectedEvent<T> {
  type: 'selected'
  item: T
}

export interface TextChangedEvent {
  type: 'text-changed'
  value: string
}

export interface FocusEvent {
  type: 'focus'
  component: Controller
}

export interface DestroyEvent {
  type: 'destroy'
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

export type Event =
  | ActionEvent
  | NoArgEvent
  | CheckboxEvent
  | DestroyEvent
  | DestroyedEvent
  | FocusEvent
  | ItemSelectedEvent<any>
  | LogEvent
  | TextChangedEvent
