import { HeadlessBackend, TextField } from '@src/tui/framework'
import { SaveConfigDialog } from '@src/tui/save-config-dialog'

export const saveConfigDialogAdapter = (
  dialog: SaveConfigDialog,
  backend: HeadlessBackend
) => {
  return {
    getTextField() {
      return dialog.children[0] as TextField
    },

    getTextFieldContent(): string {
      return this.getTextField().model.value
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
}
