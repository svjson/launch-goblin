import { ApplicationState, Project } from '@src/project'
import { saveLatestLaunch, saveLocalConfig, saveGlobalConfig } from './io'
import { GlobalConfig, LGConfig } from './types'

export interface ConfigurationModule {
  saveLatestLaunch(state: ApplicationState): Promise<void>
  saveLocalConfig(project: Project, config: LGConfig): Promise<void>
  saveGlobalConfig(project: Project, config: GlobalConfig): Promise<void>
}

export const makeConfigurationFacade = (): ConfigurationModule => {
  return {
    saveLatestLaunch,
    saveLocalConfig,
    saveGlobalConfig,
  }
}
