import { ApplicationState, Project } from '@src/project'
import {
  saveLatestLaunch,
  saveLocalConfig,
  saveGlobalConfig,
  readConfig,
} from './io'
import { ContextConfig, GlobalConfig, LGConfig } from './types'
import { FileSystem } from '@whimbrel/core'

export interface ConfigurationModule {
  readConfig(project: Project): Promise<ContextConfig>
  saveLatestLaunch(state: ApplicationState): Promise<void>
  saveLocalConfig(project: Project, config: LGConfig): Promise<void>
  saveGlobalConfig(project: Project, config: GlobalConfig): Promise<void>
}

export const makeConfigurationFacade = (
  fs: FileSystem
): ConfigurationModule => {
  return {
    async readConfig(project) {
      return readConfig(fs, project)
    },
    async saveLatestLaunch(state) {
      return saveLatestLaunch(fs, state)
    },
    saveLocalConfig(project, config) {
      return saveLocalConfig(fs, project, config)
    },
    saveGlobalConfig(project, config) {
      return saveGlobalConfig(fs, project, config)
    },
  }
}
