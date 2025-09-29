import { identifyLaunchers, Launcher } from '@src/launch'
import { LGOptions } from '@src/tui/goblin-app'
import { ProjectComponent, ProjectParams } from './types'
import { actorFacetScope } from '@whimbrel/core'

export interface Project extends ProjectParams {
  component(componentId: string): ProjectComponent | undefined
  isLaunchable(componentId: string): boolean
  launcherOf(componetId: string): Launcher | undefined
  hasRootFacet(facetId: string): boolean
  packageManager(): string | undefined
  projectRoot(): string
}

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
    projectRoot() {
      return root!.root
    },
  }
}

export const readProject = async (
  analyze: (dir: string) => Promise<ProjectParams>,
  launchAction: string,
  options: LGOptions
): Promise<Project> => {
  const project = makeProject(await analyze(process.cwd()))
  project.launchers = await identifyLaunchers(project, launchAction, options)
  return project
}
