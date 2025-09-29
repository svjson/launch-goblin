import { LGOptions } from '@src/tui'
import { Project, readProject } from './project'
import { ProjectParams } from './types'

export interface ProjectModule {
  readProject: (launchAction: string, options: LGOptions) => Promise<Project>
}

export const makeProjectFacade = (
  analyzeFunction: (dir: string) => Promise<ProjectParams>
): ProjectModule => ({
  async readProject(launchAction, options) {
    return readProject(analyzeFunction, launchAction, options)
  },
})
