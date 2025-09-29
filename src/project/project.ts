import { identifyLaunchers, Launcher } from '@src/launch'
import { LGOptions } from '@src/tui/goblin-app'
import { ProjectComponent, ProjectParams } from './types'
import { actorFacetScope } from '@whimbrel/core'
import { SystemModule } from '@src/bootstrap/facade'

/**
 * Project model that describes the project on disk, its components,
 * launch strategies and provides convenience query functions
 */
export interface Project extends ProjectParams {
  /**
   * Return the launchable component with id `componentId` or undefined.
   *
   * @param componentId The component id.
   * @return The component or undefined if not found.
   */
  component(componentId: string): ProjectComponent | undefined

  /**
   * Query if a viable launch strategy exists for components with id
   * `componentId`
   *
   * @param componentId The component id.
   * @return True if launchable, false if not or the component is unknown..
   */
  isLaunchable(componentId: string): boolean
  /**
   * Get the launcher instance associated with the component with id
   * `componentId`
   */
  launcherOf(componentId: string): Launcher | undefined
  /**
   * Query if the root module includes a facet with id `facetId`.
   */
  hasRootFacet(facetId: string): boolean
  /**
   * Get the package manager name, e.g, 'pnpm'.
   */
  packageManager(): string | undefined
}

/**
 * Create a Project model from the given parameters.
 *
 * @param params The project parameters/data model.
 * @return A Project instance.
 */
export const makeProject = (params: ProjectParams): Project => {
  const root = params.ctx.getActor({ root: params.root })!
  return {
    ...params,
    component(componentId: string) {
      return this.components.find((c) => c.id === componentId)
    },
    isLaunchable(componentId: string) {
      return this.launchers.some((l) => l.components.includes(componentId))
    },
    launcherOf(componentId: string) {
      return this.launchers.find((l) => l.components.includes(componentId))
    },
    hasRootFacet(facetId: string) {
      return Boolean(actorFacetScope(root, facetId))
    },
    packageManager() {
      const pnpmScope = actorFacetScope(root, 'pnpm')
      if (pnpmScope?.roles.includes('pkg-manager')) return 'pnpm'
    },
  }
}

export const readProject = async (
  systemModule: SystemModule,
  analyze: (dir: string) => Promise<ProjectParams>,
  launchAction: string,
  options: LGOptions
): Promise<Project> => {
  const project = makeProject(await analyze(process.cwd()))
  project.launchers = await identifyLaunchers(
    systemModule,
    project,
    launchAction,
    options
  )
  return project
}
