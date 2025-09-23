import {
  CheckboxOptions,
  CheckboxWidget,
  LabelWidget,
  ListWidget,
  TextFieldWidget,
  Widget,
} from './widget'

import {
  BoxOptions,
  ButtonOptions,
  LabelOptions,
  ListOptions,
  TextFieldOptions,
} from './widget'

export type Value = number | string | undefined

export type BackendKeyHandler = (ch: string | undefined, key: any) => void
export type BackendKeyPressHandler = {
  key: string[]
  handler: BackendKeyHandler
}
export type BackendCallback = () => void

export interface Backend {
  onBeforeRender(handler: () => void): void
  /**
   * Register a key handler function that reacts to any key press
   * event in the application environment.
   */
  onKey(handler: BackendKeyHandler): void

  onKeyPress(key: string | string[], handler: BackendKeyHandler): void

  addRoot(widget: Widget): void

  render(): void

  createBox(options: BoxOptions): Widget
  createButton(options: ButtonOptions): Widget
  createCheckbox(options: CheckboxOptions): CheckboxWidget
  createLabel(options: LabelOptions): LabelWidget
  createList(options: ListOptions): ListWidget
  createTextField(options: TextFieldOptions): TextFieldWidget

  dispose(): void
}
