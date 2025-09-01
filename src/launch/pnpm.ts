import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { actorFacetScope } from '@whimbrel/core'

export const pnpmLauncher = (
  project: Project,
  launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  return {
    id: 'pnpm',
    components: components.map((c) => c.id),
    launchCommand: (components: ProjectComponent[]) => ({
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
  launchAction: string
): Promise<Launcher[]> => {
  console.log('Evaluating pnpm...')
  const root = project.ctx.getActor({ root: project.root })
  const pnpmScope = actorFacetScope(root!, 'pnpm')
  if (pnpmScope) {
    if (pnpmScope?.roles.includes('pkg-manager')) {
      console.log(' - Is package manager for project')
      const targetComponents = project.components.filter((c) =>
        c.pkgJson.get(['scripts', launchAction])
      )
      if (targetComponents.length) {
        return [pnpmLauncher(project, launchAction, targetComponents)]
      }
      console.log(' x No packages provide target action')
    }
  } else {
    console.log(' x Not present')
  }
  return []
}
