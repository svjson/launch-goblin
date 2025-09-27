import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { LGOptions } from '@src/tui/goblin-app'
import { ApplicationEnvironment } from '@src/tui/framework'
import { SessionComponent } from '@src/project/state'

export const pnpmLauncher = (
  _project: Project,
  launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  return {
    id: 'pnpm',
    components: components.map((c) => c.id),
    launchCommand: (
      _env: ApplicationEnvironment,
      components: SessionComponent[]
    ) => {
      const groups: Record<string, SessionComponent[]> = {}
      components.forEach((c) => {
        c.state.targets.forEach((t) => {
          ;(groups[t] ??= []).push(c)
        })
      })

      return {
        groups: [
          {
            mode: 'parallel',
            processes: Object.entries(groups).map(([action, cmps]) => ({
              bin: 'pnpm',
              args: [
                '-r',
                '--parallel',
                '--stream',
                ...cmps.flatMap((c) => ['--filter', c.component.package]),
                'run',
                action,
              ],
              critical: false,
            })),
          },
        ],
      }
    },
  }
}

export const identifyPnpmLaunchOptions = async (
  project: Project,
  launchAction: string,
  options: LGOptions
): Promise<Launcher[]> => {
  if (options.verbose) console.log('Evaluating pnpm...')
  if (project.packageManager() === 'pnpm') {
    if (options.verbose) console.log(' - Is package manager for project')
    const targetComponents = project.components
      .map((c) => ({
        ...c,
        targets: c.targets.filter(
          (t) => t === launchAction && t.startsWith(`${launchAction}:`)
        ),
      }))
      .filter((c) => c.pkgJson.get(['scripts', launchAction]))
    if (targetComponents.length) {
      return [pnpmLauncher(project, launchAction, targetComponents)]
    }
    if (options.verbose) console.log(' x No packages provide target action')
  } else {
    if (options.verbose) console.log(' x Not present')
  }
  return []
}
