import blessed from 'neo-blessed'
import { LabelWidget, ListWidget, TextFieldWidget, Widget } from './widget'

export type Value = number | string | undefined

export type BoxOptions = blessed.Widgets.BoxOptions
export interface ButtonOptions {}
export interface ListOptions {}
export interface LabelOptions {}
export interface TextFieldOptions {}

export interface Backend {
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
}
