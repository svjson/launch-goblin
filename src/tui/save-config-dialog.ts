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
  components = this.defineComponents({
    nameField: {
      component: TextField,
      model: { label: 'Configuration Name:', value: '' },
      style: { top: 1, left: 2, width: '100%-6' },
    },
    configTypeLabel: {
      component: Label,
      model: { text: 'Configuration Type:' },
      style: {
        left: 2,
        top: 4,
      },
    },
    configTypeSelect: {
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
      style: { top: 5 },
    },

    saveButton: {
      component: Button,
      model: { text: 'Save' },
      style: { top: 7, left: '50%-14' },
    },

    cancelButton: {
      component: Button,
      model: { text: 'Cancel' },
      style: { top: 7, left: '50%+2' },
    },
  })

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

    const { nameField, configTypeSelect, saveButton, cancelButton } =
      this.components

    saveButton.disable()

    this.components.nameField.on('text-changed', (event: TextChangedEvent) => {
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
