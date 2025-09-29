import { ConfigType, ConfigurationModule } from '@src/config'
import { LaunchModule } from '@src/launch'
import { ApplicationState } from '@src/project'
import { ActionFacade } from '@src/tui'
import { ApplicationEnvironment } from '@src/tui/framework'

export const makeActionFacade = (
  env: ApplicationEnvironment,
  state: ApplicationState,
  configModule: ConfigurationModule,
  launchModule: LaunchModule
): ActionFacade => {
  return {
    launch: async () => {
      env.backend.dispose()
      await configModule.saveLatestLaunch(state)
      await launchModule.launchSession(env, state)
    },
    saveConfig: async (state: ApplicationState, type: ConfigType) => {
      if (type === 'shared') {
        await configModule.saveSharedConfig(state.project, state.config.shared)
      } else {
        await configModule.savePrivateConfig(
          state.project,
          state.config.private
        )
      }
    },
  }
}
