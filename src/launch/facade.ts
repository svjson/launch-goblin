import { ApplicationEnvironment } from '@src/tui/framework'
import { launchSession } from './session'
import { ApplicationState } from '@src/project'

export interface LaunchModule {
  launchSession(
    env: ApplicationEnvironment,
    state: ApplicationState
  ): Promise<void>
}

export const makeLaunchFacade = (): LaunchModule => {
  return {
    launchSession,
  }
}
