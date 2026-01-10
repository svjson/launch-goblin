import { HeadlessBackend, TextField } from '@src/tui/framework'
import { ConfigDialog } from '@src/tui/config-dialog'
import { AdapterBase, makeAdapterBase } from './adapter-base'

export const configDialogAdapter = <D extends ConfigDialog>(
  dialog: D,
  backend: HeadlessBackend
) => {
  const adapter = {
    ...makeAdapterBase(backend, dialog),

    getTextField() {
      return dialog.children[0] as TextField
    },

    getTextFieldContent(): string {
      return this.getTextField().model.value
    },

    tabToOptionBar() {
      const initial = backend.getFocusedWidget()!

      let current = backend.getFocusedWidget()
      while (current?.type !== 'label') {
        backend.performKeyPress('tab')
        current = backend.getFocusedWidget()!
        if (current === initial) {
          throw new Error('Could not find option bar')
        }
      }
    },

    tabToButton(buttonLabel: string) {
      const initial = backend.getFocusedWidget()!

      let current = initial
      while (current.type !== 'button' || current.get('text') !== buttonLabel) {
        backend.performKeyPress('tab')
        current = backend.getFocusedWidget()!
        if (current === initial) {
          throw new Error('Could not find button with label: ' + buttonLabel)
        }
      }
    },
  }

  return adapter satisfies AdapterBase
}
