import { applyConfig, ContextConfig, readConfig } from '@src/config'
import { analyze } from './analyze'
import { identifyLaunchers } from '@src/launch'
import { LGOptions } from '@src/tui/goblin-app'
import { Project, ProjectParams } from './types'
import { ApplicationState } from './state'
import { actorFacetScope } from '@whimbrel/core'

export const makeProject = (params: ProjectParams): Project => {
  const root = params.ctx.getActor({ root: params.root })!
  return {
    ...params,
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
  launchAction: string,
  options: LGOptions
): Promise<ApplicationState> => {
  const project = makeProject(await analyze(process.cwd()))
  project.launchers = await identifyLaunchers(project, launchAction, options)
  const config: ContextConfig = await readConfig(project)
  applyConfig(config.global.lastConfig, project)
  return { project, config }
}
