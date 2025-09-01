import { applyConfig, ContextConfig, readConfig } from '@src/config'
import { analyze } from './analyze'
import { Project } from './types'
import { identifyLaunchers } from '@src/launch'

export type {
  Project,
  BaseComponent,
  Package,
  NodePackage,
  ProjectComponent,
} from './types'

export interface ApplicationState {
  project: Project
  config: ContextConfig
}

export const readProject = async (
  launchAction: string
): Promise<ApplicationState> => {
  const project = await analyze(process.cwd())
  project.launchers = await identifyLaunchers(project, launchAction)
  const config: ContextConfig = await readConfig(project)
  applyConfig(config.global.lastConfig, project)
  return { project, config }
}
