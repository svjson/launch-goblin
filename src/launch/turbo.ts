import path from 'node:path'

import { NodePackage, Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { LGOptions } from '@src/tui/goblin-app'
import { ApplicationEnvironment } from '@src/tui/framework'
import { SessionComponent } from '@src/project/state'

export const turboLauncher = (
  project: Project,
  launchAction: string,
  components: ProjectComponent[]
): Launcher<NodePackage> => {
  const cliRunner = project.hasRootFacet('pnpm') ? 'pnpx' : 'npx'

  return {
    id: 'turbo',
    defaultTargets: [launchAction],
    components: components.map((c) => c.id),
    features: {
      componentTargets: 'single',
      launcherTargets: 'single',
    },
    launchCommand: (
      _env: ApplicationEnvironment,
      components: SessionComponent<NodePackage>[]
    ) => ({
      groups: [
        {
          mode: 'parallel',
          processes: [
            {
              bin: cliRunner,
              args: [
                'turbo',
                'run',
                launchAction,
                ...components.flatMap((c) => ['--filter', c.component.package]),
              ],
              critical: true,
            },
          ],
        },
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

  if (project.hasRootFacet('turborepo')) {
    if (options.verbose) console.log(' - turborepo is present')
    const turboJsonPath = path.join(project.projectRoot(), 'turbo.json')
    if (await project.ctx.disk.exists(turboJsonPath)) {
      if (options.verbose) console.log(' - turbo.json is present')
      const turboJson = await project.ctx.disk.readJson(turboJsonPath)

      if (turboJson.tasks?.[launchAction]) {
        if (options.verbose) console.log(` - task '${launchAction}' is defined`)
        const targetComponents = project.components.filter(
          (c) =>
            c.type === 'pkgjson-script' &&
            c.pkgJson.get(['scripts', launchAction])
        )
        if (targetComponents.length) {
          return [
            turboLauncher(project, launchAction, targetComponents),
          ] as Launcher[]
        }
        if (options.verbose) console.log(' x No packages provide target action')
      }
    }
  } else {
    if (options.verbose) console.log(' x Not present')
  }

  return []
}
