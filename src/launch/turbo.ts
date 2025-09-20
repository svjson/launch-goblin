import path from 'node:path'

import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { actorFacetScope } from '@whimbrel/core'
import { LGOptions } from '@src/tui/goblin-app'
import { ApplicationEnvironment } from '@src/tui/framework'

export const turboLauncher = (
  project: Project,
  launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  const cliRunner = actorFacetScope(
    project.ctx.getActor({ root: project.root })!,
    'pnpm'
  )
    ? 'npx'
    : 'npx'

  return {
    id: 'turbo',
    components: components.map((c) => c.id),
    launchCommand: (env: ApplicationEnvironment, components: ProjectComponent[]) => ({
      bin: cliRunner,
      args: [
        'turbo',
        'run',
        launchAction,
        ...components.flatMap((c) => ['--filter', c.package]),
      ],
    }),
  }
}

export const identifyTurboLaunchOptions = async (
  project: Project,
  launchAction: string,
  options: LGOptions
): Promise<Launcher[]> => {
  if (options.verbose) console.log('Evaluating turborepo...')
  const root = project.ctx.getActor({ root: project.root })
  const turboScope = actorFacetScope(root!, 'turborepo')

  if (turboScope) {
    if (options.verbose) console.log(' - turborepo is present')
    const turboJsonPath = path.join(root!.root, 'turbo.json')
    if (await project.ctx.disk.exists(turboJsonPath)) {
      if (options.verbose) console.log(' - turbo.json is present')
      const turboJson = await project.ctx.disk.readJson(turboJsonPath)

      if (turboJson.tasks?.[launchAction]) {
        if (options.verbose) console.log(` - task '${launchAction}' is defined`)
        const targetComponents = project.components.filter((c) =>
          c.pkgJson.get(['scripts', launchAction])
        )
        if (targetComponents.length) {
          return [turboLauncher(project, launchAction, targetComponents)]
        }
        if (options.verbose) console.log(' x No packages provide target action')
      }
    }
  } else {
    if (options.verbose) console.log(' x Not present')
  }

  return []
}
