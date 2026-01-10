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
import { ConfigType, ContextConfig } from '@src/config'
import { launchConfigByName } from '@src/config/query'

/**
 * Dialog model for ConfigDialog
 */
type ConfigDialogModel = ModalDialogModel & {
  /**
   * Properties of the current config, if editing is based on
   * an existing configuration.
   */
  config?: {
    /**
     * The name of the configuration
     */
    name: string
    /**
     * The type of the configuration (private/shared)
     */
    type: ConfigType
  }
}

/**
 * Constructor parameters for ConfigDialog and sub-types
 */
type ConfigDialogOpts = {
  env: ComponentEnvironment
  store: Store<ApplicationState>
  title?: string
  model?: ConfigDialogModel
}

/**
 * Common TUI Component base for defining a modal dialog with options and controls
 * for saving or editing a launch configuration.
 */
export abstract class ConfigDialog extends ModalDialog<
  ConfigDialogModel,
  ApplicationState
> {
  events = this.defineEvents({
    nameField: {
      'text-changed': (event: TextChangedEvent) => {
        if (this.isValidConfigName(event.value)) {
          this.components.saveButton.enable()
        } else {
          this.components.saveButton.disable()
        }
      },
    },
    saveButton: {
      pressed: () => {
        const { configTypeSelect, nameField } = this.components
        this.submit(configTypeSelect.getSelectedItemId(), nameField.getText())
        this.destroy()
      },
    },

    cancelButton: {
      pressed: () => {
        this.destroy()
      },
    },
  })

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
      legend: {
        enter: 'Save Configuration',
      },
    },

    /**
     * The cancel-button that closes the dialog without saving any state.
     */
    cancelButton: {
      component: Button,
      model: { text: 'Cancel' },
      style: { top: 7, left: '50%+2' },
      legend: {
        enter: 'Cancel',
      },
    },
  })

  constructor({ env, store, model }: ConfigDialogOpts) {
    super({
      env,
      store,
      model: model ?? { title: 'Configuration' },
      options: { height: 11, width: 45 },
    })

    this.focus()
  }

  /**
   * Validates a configuration name.
   *
   * @param name The configuration name to validate
   *
   * @return True if the name is valid, false otherwise
   */
  isValidConfigName(name?: string): boolean {
    return Boolean(name && name.trim().length)
  }

  /**
   * Submit the dialog, and dispatch an action.
   *
   * Template method that must be implemented by the concrete sub-type.
   */
  abstract submit(name: string, type: string): void
}

/**
 * TUI Component defining a modal dialog with options and controls for
 * saving the current launch configuration state as a private or shared
 * configuration.
 */
export class SaveConfigDialog extends ConfigDialog {
  constructor(opts: ConfigDialogOpts) {
    super({
      ...opts,
      model: { title: ' Save Configuration ' },
    })

    const { saveButton } = this.components

    saveButton.disable()

    this.focus()
  }

  submit(type: string, name: string) {
    this.dispatch({
      type: 'create-config',
      details: { type, name },
    })
  }
}

/**
 * TUI Component defining a modal dialog with options and controls for
 * editing an existing launch configuration.
 */
export class EditConfigDialog extends ConfigDialog {
  constructor(opts: ConfigDialogOpts) {
    super({
      ...opts,
      model: { title: ' Edit Configuration ', ...opts.model },
    })

    const { name = '', type = '' } = this.model.config ?? {}

    this.components.nameField.setText(name)
    this.components.configTypeSelect.setSelectedItemId(type)
  }

  /**
   * Overrides and extends the default isValidConfigName function to also
   * check for name collisions.
   *
   * @param name The configuration name to validate
   *
   * @return True if the name is valid, false otherwise
   */
  isValidConfigName(name?: string) {
    if (!super.isValidConfigName(name)) return false
    if (name === this.model.config!.name) return true
    return launchConfigByName(name!, this.store.get<ContextConfig>('config'))
      ? false
      : true
  }

  /**
   * Submit the dialog, and dispatch an update-config action.
   *
   * @param type The type of configuration (private/shared)
   * @param name The name of the configuration
   */
  submit(type: string, name: string) {
    this.dispatch({
      type: 'update-config',
      details: { type, name, original: this.model.config },
    })
  }
}
