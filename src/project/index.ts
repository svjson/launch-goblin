import { applyConfig, ContextConfig, readConfig } from '@src/config'
import { analyze } from './analyze'
import { Project } from './types'

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

export const readProject = async (): Promise<ApplicationState> => {
  const project = await analyze(process.cwd())
  const config: ContextConfig = await readConfig(project)
  applyConfig(config.global.lastConfig, project)
  return { project, config }
}
