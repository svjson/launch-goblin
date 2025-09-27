import {
  Backend,
  BackendCallback,
  BackendKeyHandler,
  BackendKeyPressHandler,
} from '../backend'
import {
  BoxOptions,
  ButtonOptions,
  CheckboxOptions,
  LabelOptions,
  LabelWidget,
  ListWidget,
  ListOptions,
  TextFieldOptions,
  TextFieldWidget,
  Widget,
  CheckboxWidget,
} from '../widget'
import { genKeyPress } from './keygen'
import {
  HeadlessCheckboxWidget,
  HeadlessLabelWidget,
  HeadlessListWidget,
  HeadlessTextFieldWidget,
  HeadlessWidget,
} from './widget'

export const noopHandler = (_handler: () => void) => {}
export const noopKeyHandler = (
  _handler: (_ch: string | undefined, _key: any) => void
) => {}
export const noopKeyPress = (
  _key: string | string[] | undefined,
  _handler: (ch: string, key: any) => void
) => {}

export interface HeadlessBackend extends Backend {
  focused?: HeadlessWidget
  getFocusedWidget(): Widget | undefined
  getFocused<T extends Widget>(): T
  performKeyPress(key: string): Promise<void>
  typeString(string: string): Promise<void>
}

export const noBackend = (): Backend => {
  const keyHandlers: BackendKeyHandler[] = []
  const keyPressHandlers: BackendKeyPressHandler[] = []
  const preRenderHandlers: BackendCallback[] = []

  const rootWidgets: Widget[] = []

  const backend: HeadlessBackend = {
    onBeforeRender: (handler: BackendCallback) => {
      preRenderHandlers.push(handler)
    },
    onKey: (handler: BackendKeyHandler) => {
      keyHandlers.push(handler)
    },
    onKeyPress: (key: string | string[], handler: BackendKeyHandler) => {
      key = Array.isArray(key) ? key : [key]
      keyPressHandlers.push({ key, handler })
    },
    addRoot(widget: Widget) {
      rootWidgets.push(widget)
    },
    render() {
      preRenderHandlers.forEach((h) => h())

      rootWidgets.forEach((w) => {
        w.render()
      })
    },
    createBox(options: BoxOptions): Widget {
      return new HeadlessWidget<BoxOptions>(
        this,
        {},
        { focusable: false, ...options }
      )
    },
    createButton(options: ButtonOptions): Widget {
      return new HeadlessWidget<ButtonOptions>(
        this,
        {},
        {
          focusable: true,
          ...options,
        }
      )
    },
    createCheckbox(options: CheckboxOptions): CheckboxWidget {
      return new HeadlessCheckboxWidget(
        this,
        {},
        {
          focusable: true,
          ...options,
        }
      )
    },
    createLabel(options: LabelOptions): LabelWidget {
      return new HeadlessLabelWidget(
        this,
        {},
        {
          focusable: false,
          ...options,
        }
      )
    },
    createList(options: ListOptions): ListWidget {
      return new HeadlessListWidget(
        this,
        {},
        {
          focusable: true,
          ...options,
        }
      )
    },
    createTextField(options: TextFieldOptions): TextFieldWidget {
      return new HeadlessTextFieldWidget(
        this,
        {},
        {
          focusable: true,
          ...options,
        }
      )
    },

    async performKeyPress(keyName: string) {
      const [ch, key] = genKeyPress(keyName)

      keyHandlers.forEach((handler) => {
        handler(ch, key)
      })

      keyPressHandlers.forEach((handler) => {
        if (handler.key.includes(key.full)) {
          handler.handler(ch, key)
        }
      })
    },

    async typeString(string: string) {
      for (const ch of string.split('')) {
        await backend.performKeyPress(ch)
      }
    },

    getFocusedWidget() {
      return backend.focused
    },
    getFocused<T extends Widget>(): T {
      return backend.getFocusedWidget() as T
    },

    dispose() {},
  } satisfies HeadlessBackend

  return backend as Backend
}
