import blessed from 'neo-blessed'
import { ApplicationState } from '@src/project'
import { MainController } from './main'
import { Action, Application } from './framework'
import { saveLocalConfig, toLaunchConfigComponents } from '@src/config'

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
      ['config', 'local', 'launchConfigs', createAction.details.name],
      {
        components: toLaunchConfigComponents(this.model.project.components),
      }
    )
    await saveLocalConfig(this.model.project, this.model.config.local)
  }

  async deleteConfig(deleteAction: Action): Promise<void> {
    const { configId, configType } = deleteAction.details
    this.store.delete([
      'config',
      configType === 'shared' ? 'local' : 'global',
      'launchConfigs',
      configId,
    ])
    await saveLocalConfig(this.model.project, this.model.config.local)
  }
}
