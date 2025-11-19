import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { ApplicationEnvironment } from '@src/tui/framework'
import { SessionComponent } from '@src/project/state'
import { SystemModule } from '@src/system'

/**
 * Launcher for docker compose
 *
 * Supports launching individual services from the same docker compose file.
 */
export const dockerComposeLauncher = (
  _project: Project,
  _launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  const availableTargets = [...components[0].targets]

  const launcher: Launcher = {
    id: 'docker-compose',
    defaultTargets: [...components[0].targets],
    components: components.map((c) => c.id),
    features: {
      componentTargets: 'multi',
      launcherTargets: 'multi',
    },
    launchCommand: (
      _env: ApplicationEnvironment,
      components: SessionComponent[]
    ) => {
      return {
        groups: [
          {
            mode: 'sequential',
            processes: [
              {
                bin: 'docker',
                args: [
                  'compose',
                  'up',
                  '-d',
                  // Launch configurations may contain references to services
                  // that do not exist in the target project, as they may have been
                  // removed or only exist on a certain branch. So we need to filter
                  // out any component that wasn't known to the launcher when it was
                  // created.
                  ...components[0].state.targets.filter((t) =>
                    availableTargets.includes(t)
                  ),
                ],
              },
            ],
          },
        ],
      }
    },
  }
  return launcher
}

export const identifyDockerComposeLaunchOptions = async (
  systemModule: SystemModule,
  project: Project
): Promise<Launcher[]> => {
  const dcBin = await systemModule.findExecutable('docker')
  if (!dcBin) return []

  return project.components
    .filter((cmp) => cmp.type === 'docker-compose' && cmp.targets.length)
    .map((cmp) => dockerComposeLauncher(project, 'up', [cmp]))
}
