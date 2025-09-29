import { LGOptions } from '@src/tui'
import { Project, readProject } from './project'
import { ProjectParams } from './types'
import { SystemModule } from '@src/bootstrap/facade'

export interface ProjectModule {
  readProject: (launchAction: string, options: LGOptions) => Promise<Project>
}

export const makeProjectFacade = (
  systemModule: SystemModule,
  analyzeFunction: (dir: string) => Promise<ProjectParams>
): ProjectModule => ({
  async readProject(launchAction, options) {
    return readProject(systemModule, analyzeFunction, launchAction, options)
  },
})
