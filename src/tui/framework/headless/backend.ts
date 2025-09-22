import { Backend } from '../backend'
import {
  BoxOptions,
  ButtonOptions,
  LabelOptions,
  LabelWidget,
  ListWidget,
  ListOptions,
  TextFieldOptions,
  TextFieldWidget,
  Widget,
} from '../widget'
import { HeadlessWidget } from './widget'

export const noopHandler = (_handler: () => void) => {}
export const noopKeyHandler = (_handler: (_ch: string, _key: any) => void) => {}
export const noopKeyPress = (
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
    createBox(options: BoxOptions): Widget {
      return new HeadlessWidget<BoxOptions>({}, options)
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
