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

const noopHandler = (_handler: () => void) => {}
const noopKeyHandler = (_handler: (_ch: string, _key: any) => void) => {}
const noopKeyPress = (
  _key: string | string[],
  _handler: (ch: string, key: any) => void
) => {}

export const noBackend = (): Backend => {
  return {
    onBeforeRender: noopHandler,
    onKey: noopKeyHandler,
    onKeyPress: noopKeyPress,
    addRoot(_widget: Widget) {},
    render() {},
    createBox(_options: BoxOptions): Widget {
      throw new Error('Cannot create widget')
    },
    createButton(_options: ButtonOptions): Widget {
      throw new Error('Cannot create widget')
    },
    createLabel(_options: LabelOptions): LabelWidget {
      throw new Error('Cannot create widget')
    },
    createList(_options: ListOptions): ListWidget {
      throw new Error('Cannot create widget')
    },
    createTextField(_options: TextFieldOptions): TextFieldWidget {
      throw new Error('Cannot create widget')
    },

    dispose() {},
  }
}
