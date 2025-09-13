import blessed from 'neo-blessed'
import { ApplicationState } from '@src/project'
import { MainController } from './main'
import { Action, Application } from './framework'
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
  actions = this.withActions({
    'create-config': this.bind(this.performCreateConfig),
    'delete-config': this.bind(this.deleteConfig),
  })

  constructor(screen: blessed.Widgets.Screen, model: ApplicationState) {
    super(screen, MainController, model)
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
