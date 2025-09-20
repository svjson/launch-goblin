import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { actorFacetScope } from '@whimbrel/core'
import { LGOptions } from '@src/tui/goblin-app'
import { ApplicationEnvironment } from '@src/tui/framework'

export const pnpmLauncher = (
  project: Project,
  launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  return {
    id: 'pnpm',
    components: components.map((c) => c.id),
    launchCommand: (env: ApplicationEnvironment, components: ProjectComponent[]) => ({
      bin: 'pnpm',
      args: [
        '-r',
        '--parallel',
        '--stream',
        ...components.flatMap((c) => ['--filter', c.package]),
        'run',
        launchAction,
      ],
    }),
  }
}

export const identifyPnpmLaunchOptions = async (
  project: Project,
  launchAction: string,
  options: LGOptions
): Promise<Launcher[]> => {
  if (options.verbose) console.log('Evaluating pnpm...')
  const root = project.ctx.getActor({ root: project.root })
  const pnpmScope = actorFacetScope(root!, 'pnpm')
  if (pnpmScope) {
    if (pnpmScope?.roles.includes('pkg-manager')) {
      if (options.verbose) console.log(' - Is package manager for project')
      const targetComponents = project.components.filter((c) =>
        c.pkgJson.get(['scripts', launchAction])
      )
      if (targetComponents.length) {
        return [pnpmLauncher(project, launchAction, targetComponents)]
      }
      if (options.verbose) console.log(' x No packages provide target action')
    }
  } else {
    if (options.verbose) console.log(' x Not present')
  }
  return []
}
