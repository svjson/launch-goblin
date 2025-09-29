import { ConfigurationModule, LegacyConfigType } from '@src/config'
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
    saveConfig: async (state: ApplicationState, type: LegacyConfigType) => {
      if (type === 'local') {
        await configModule.saveSharedConfig(state.project, state.config.local)
      } else {
        await configModule.savePrivateConfig(state.project, state.config.global)
      }
    },
  }
}
