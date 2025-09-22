import { ApplicationState } from 'src/project'
import {
  ModalDialog,
  TextChangedEvent,
  TextField,
  Button,
  Store,
  Label,
  ModalDialogModel,
  OptionBar,
  ComponentEnvironment,
} from './framework'

/**
 * TUI Component defining a modal dialog with options and controls for
 * saving the current launch configuration state as a private or shared
 * configuration.
 */
export class SaveConfigDialog extends ModalDialog<
  ModalDialogModel,
  ApplicationState
> {
  constructor({
    env,
    store,
  }: {
    env: ComponentEnvironment
    store: Store<ApplicationState>
  }) {
    super({
      env,
      store,
      model: { title: ' Save Configuration ' },
      options: { height: 11, width: 45 },
    })

    const nameField = this.addChild(
      {
        component: TextField,
        model: { label: 'Configuration Name:', value: '' },
      },
      { top: 1, left: 2, width: '100%-6' }
    )

    this.addChild(
      {
        component: Label,
        model: { text: 'Configuration Type:' },
      },
      {
        left: 2,
        top: 4,
      }
    )

    const configTypeSelect = this.addChild(
      {
        component: OptionBar,
        model: [
          {
            id: 'global',
            label: 'Private',
            selected: true,
          },
          {
            id: 'local',
            label: 'Shared',
            selected: false,
          },
        ],
      },
      { top: 5 }
    )

    const saveButton = this.addChild(
      {
        component: Button,
        model: { text: 'Save' },
      },
      { top: 7, left: '50%-14' }
    )
    saveButton.disable()

    const cancelButton = this.addChild(
      { component: Button, model: { text: 'Cancel' } },
      { top: 7, left: '50%+2' }
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
            type: configTypeSelect.getSelectedItemId(),
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
