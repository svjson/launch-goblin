import { ApplicationState } from '@src/project'
import { MainController } from './main'
import {
  Action,
  Application,
  ApplicationEnvironment,
  ColorMode,
} from './framework'
import { saveLocalConfig, toLaunchConfigComponents } from '@src/config'
import { saveGlobalConfig } from '@src/config/io'

/**
 * Contains user options for running Launch Goblin.
 */
export interface LGOptions {
  /**
   * Instructs the application to enable all optional log output.
   */
  verbose: boolean

  /**
   * Overrides detected ColorMode and forces TUI color to use theme options
   * suitable for the selected mode.
   */
  colorMode?: ColorMode

  /**
   * Instructs the application to bypass the Launch Goblin TUI and
   * immediately launch a named configuration or the last launched
   * configuration.
   *
   * true - launch the most recently launched configuration immediately
   * false - run the Launch Goblin TUI normally
   * string - launch a named configuration immediately
   */
  autoLaunch: boolean | string
}

/**
 * The main Launch Goblin TUI Application abstraction, based on
 * Appliation from `tui/framework`.
 *
 * This class manages the TUI application and serves as the top-level
 * recipient and coordinator of UI events and actions.
 */
export class LaunchGoblinApp extends Application<
  ApplicationState,
  MainController
> {
  actions = this.defineActions({
    'create-config': this.performCreateConfig,
    'delete-config': this.deleteConfig,
    launch: this.launch,
  })

  constructor(
    env: ApplicationEnvironment,
    model: ApplicationState,
    private launchFunction: () => Promise<void>
  ) {
    super(env, MainController, model)
  }

  async launch() {
    await this.launchFunction()
  }

  async performCreateConfig(createAction: Action): Promise<void> {
    this.store.set(
      [
        'config',
        createAction.details.type,
        'launchConfigs',
        createAction.details.name,
      ],
      {
        components: toLaunchConfigComponents(this.model.project.components),
      }
    )

    if (createAction.details.type === 'local') {
      await saveLocalConfig(this.model.project, this.model.config.local)
    } else {
      await saveGlobalConfig(this.model.project, this.model.config.global)
    }
  }

  async deleteConfig(deleteAction: Action): Promise<void> {
    const { configId, configType } = deleteAction.details
    this.store.delete([
      'config',
      configType === 'shared' ? 'local' : 'global',
      'launchConfigs',
      configId,
    ])
    if (configType === 'shared') {
      await saveLocalConfig(this.model.project, this.model.config.local)
    } else {
      await saveGlobalConfig(this.model.project, this.model.config.global)
    }
  }
}
