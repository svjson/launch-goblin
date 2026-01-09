import { LGOptions } from '@src/tui'
import { Project, readProject } from './project'
import { ProjectParams } from './types'
import { SystemModule } from '@src/system'

/**
 * Module interface for reading the project structure.
 */
export interface ProjectModule {
  /**
   * Read and analyze the project on disk at cwd.
   *
   * @param options The command-line options provided by the user.
   *
   * @return The project model containing launchable components.
   */
  readProject: (options: LGOptions) => Promise<Project>
}

/**
 * Create a ProjectModule instance from `systemModule`, using `analyzeFunction`
 * to identify and analyze projects.
 *
 * @param systemModule The system module for file and system inspection.
 * @param analyzeFunction The function to analyze the project directory.
 */
export const makeProjectFacade = (
  systemModule: SystemModule,
  analyzeFunction: (dir: string) => Promise<ProjectParams>
): ProjectModule => ({
  async readProject(options) {
    return readProject(systemModule, analyzeFunction, options)
  },
})
