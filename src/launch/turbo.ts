import path from 'node:path'

import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { actorFacetScope } from '@whimbrel/core'

export const turboLauncher = (
  project: Project,
  launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  return {
    id: 'turbo',
    components: components.map((c) => c.id),
    launchCommand: (components: ProjectComponent[]) => ({
      bin: 'npx',
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
  launchAction: string
): Promise<Launcher[]> => {
  console.log('Evaluating turborepo...')
  const root = project.ctx.getActor({ root: project.root })
  const turboScope = actorFacetScope(root!, 'turborepo')

  if (turboScope) {
    console.log(' - turborepo is present')
    const turboJsonPath = path.join(root!.root, 'turbo.json')
    if (await project.ctx.disk.exists(turboJsonPath)) {
      console.log(' - turbo.json is present')
      const turboJson = await project.ctx.disk.readJson(turboJsonPath)

      if (turboJson.tasks?.[launchAction]) {
        console.log(` - task '${launchAction}' is defined`)
        const targetComponents = project.components.filter((c) =>
          c.pkgJson.get(['scripts', launchAction])
        )
        if (targetComponents.length) {
          return [turboLauncher(project, launchAction, targetComponents)]
        }
        console.log(' x No packages provide target action')
      }
    }
  } else {
    console.log(' x Not present')
  }

  return []
}
