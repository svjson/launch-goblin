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
    /**
     * The text input field for the configuration name
     */
    nameField: {
      component: TextField,
      model: { label: 'Configuration Name:', value: '' },
      style: { top: 1, left: 2, width: '100%-6' },
    },
    /**
     * The field label for the configuration type option-bar
     */
    configTypeLabel: {
      component: Label,
      model: { text: 'Configuration Type:' },
      style: {
        left: 2,
        top: 4,
      },
    },
    /**
     * The configuration type OptionBar
     */
    configTypeSelect: {
      component: OptionBar,
      model: [
        {
          id: 'private',
          label: 'Private',
          selected: true,
        },
        {
          id: 'shared',
          label: 'Shared',
          selected: false,
        },
      ],
      style: { top: 5, left: 2, selectionMode: 'single' },
    },

    /**
     * The save-button that saves the configuration and closes the dialog.
     * Disabled if the nameField-component does not contain a valid
     * configuration name
     */
    saveButton: {
      component: Button,
      model: { text: 'Save' },
      style: { top: 7, left: '50%-14' },
    },

    /**
     * The cancel-button that closes the dialog without saving any state.
     */
    cancelButton: {
      component: Button,
      model: { text: 'Cancel' },
      style: { top: 7, left: '50%+2' },
    },
  })

  events = this.defineEvents({
    nameField: {
      'text-changed': (event: TextChangedEvent) => {
        if (!event.value || event.value.trim() === '') {
          this.components.saveButton.disable()
        } else {
          this.components.saveButton.enable()
        }
      },
    },
    saveButton: {
      pressed: () => {
        const { configTypeSelect, nameField } = this.components
        this.dispatch({
          type: 'create-config',
          details: {
            type: configTypeSelect.getSelectedItemId(),
            name: nameField.getText(),
          },
        })
        this.destroy()
      },
    },

    cancelButton: {
      pressed: () => {
        this.destroy()
      },
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

    const { saveButton } = this.components

    saveButton.disable()

    this.focus()
  }
}
