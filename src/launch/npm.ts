import { NodePackage, Project } from '@src/project'
import { Launcher } from './types'
import { ApplicationEnvironment } from '@src/tui/framework'
import { SessionComponent } from '@src/project/state'
import { LGOptions } from '@src/tui'

/**
 * Creates an npm launcher for the given project and components.
 *
 * @param _project The project instance.
 * @param launchAction The default launch action.
 * @param components The components to include in the launcher.
 */
export const npmLauncher = (
  _project: Project,
  launchAction: string,
  components: NodePackage[]
): Launcher<NodePackage> => {
  return {
    id: 'npm',
    defaultTargets: [launchAction],
    components: components.map((c) => c.id),
    features: {
      componentTargets: 'single',
      launcherTargets: 'single',
    },
    launchCommand: (
      _env: ApplicationEnvironment,
      components: SessionComponent<NodePackage>[]
    ) => {
      const cmps = components.flatMap((c) =>
        c.state.targets.map((t) => ({
          cmp: c.component.package,
          action: t,
        }))
      )

      return {
        groups: [
          {
            mode: 'parallel',
            processes: cmps.map(({ cmp, action }) => ({
              bin: 'npm',
              args: ['run', action, '--workspace', cmp],
              critical: false,
            })),
          },
        ],
      }
    },
  }
}

/**
 * Identify npm launch options for the given project and options.
 *
 * @param project The project instance.
 * @param options The launch options.
 *
 * @return A promise that resolves to an array of Launchers.
 */
export const identifyNpmLaunchOptions = async (
  project: Project,
  options: LGOptions
): Promise<Launcher[]> => {
  if (options.verbose) console.log('Evaluating npm...')
  if (project.packageManager() !== 'pnpm') {
    if (options.verbose) console.log(' - Is package manager for project')
    const targetComponents: NodePackage[] =
      options.launch.targetFilter.targetComponents(
        project.components.filter((c) => c.type === 'pkgjson-script')
      )

    if (targetComponents.length) {
      return [
        npmLauncher(project, options.launch.defaultTarget, targetComponents),
      ] as Launcher[]
    }
    if (options.verbose) console.log(' x No packages provide target action')
  } else {
    if (options.verbose) console.log(' x Not applicable')
  }

  return []
}
