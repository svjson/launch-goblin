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
  /**
   * The original window title string of the TTY that runs launch goblin.
   *
   * Most terminals and terminal emulators allow _setting_ the window title
   * string using ANSI escape codes, but few support reading it. Launch Goblin
   * will attempt to read it, but may fail - in which case this value will be
   * null.
   */
  originalWindowTitleString?: string | null | undefined
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
