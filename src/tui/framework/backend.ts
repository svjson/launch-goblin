import { LabelWidget, ListWidget, TextFieldWidget, Widget } from './widget'

import {
  BoxOptions,
  ButtonOptions,
  LabelOptions,
  ListOptions,
  TextFieldOptions,
} from './widget'

export type Value = number | string | undefined

export interface Backend {
  onBeforeRender(handler: () => void): void
  /**
   * Register a key handler function that reacts to any key press
   * event in the application environment.
   */
  onKey(handler: (ch: string, key: any) => void): void

  onKeyPress(
    key: string | string[],
    handler: (ch: string, key: any) => void
  ): void

  addRoot(widget: Widget): void

  render(): void

  createBox(options: BoxOptions): Widget
  createButton(options: ButtonOptions): Widget
  createLabel(options: LabelOptions): LabelWidget
  createList(options: ListOptions): ListWidget
  createTextField(options: TextFieldOptions): TextFieldWidget

  dispose(): void
}
