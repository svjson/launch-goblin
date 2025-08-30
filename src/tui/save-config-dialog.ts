import blessed from 'neo-blessed'

import { ApplicationState } from 'src/project'
import {
  ModalDialog,
  TextChangedEvent,
  TextField,
  Button,
  Store,
} from './framework'
import { ModalDialogModel } from './framework/modal'

export class SaveConfigDialog extends ModalDialog<
  ModalDialogModel,
  ApplicationState
> {
  constructor({
    screen,
    store,
  }: {
    screen: blessed.Widgets.Screen
    store: Store<ApplicationState>
  }) {
    super({
      screen,
      store,
      model: { title: ' Save Configuration ' },
      options: { height: 8, width: 45 },
    })

    const nameField = this.addChild(
      {
        component: TextField,
        model: { label: 'Configuration Name:', value: '' },
      },
      { top: 1, left: 2, width: '100%-6' }
    )

    const saveButton = this.addChild(
      {
        component: Button,
        model: { text: 'Save' },
      },
      { top: 4, left: '50%-14' }
    )
    saveButton.disable()

    const cancelButton = this.addChild(
      { component: Button, model: { text: 'Cancel' } },
      { top: 4, left: '50%+2' }
    )

    nameField.on('text-changed', (event: TextChangedEvent) => {
      if (!event.value || event.value.trim() === '') {
        saveButton.disable()
      } else {
        saveButton.enable()
      }
    })

    saveButton.on('pressed', () => {
      this.emit({
        type: 'action',
        action: {
          type: 'create-config',
          details: {
            type: 'local',
            name: nameField.getText(),
          },
        },
      })
      this.destroy()
    })

    cancelButton.on('pressed', () => {
      this.destroy()
    })

    this.focus()
  }
}
