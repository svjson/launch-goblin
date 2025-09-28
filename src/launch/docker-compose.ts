import which from 'which'

import { Project, ProjectComponent } from '@src/project'
import { Launcher } from './types'
import { ApplicationEnvironment } from '@src/tui/framework'
import { SessionComponent } from '@src/project/state'

export const findExecutable = async (
  bin: string
): Promise<string | undefined> => {
  try {
    const binPath = await which(bin)
    return binPath
  } catch {
    return undefined
  }
}

export const dockerComposeLauncher = (
  _project: Project,
  _launchAction: string,
  components: ProjectComponent[]
): Launcher => {
  return {
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
                args: ['compose', 'up', '-d', ...components[0].state.targets],
              },
            ],
          },
        ],
      }
    },
  }
}

export const identifyDockerComposeLaunchOptions = async (
  project: Project
): Promise<Launcher[]> => {
  const dcBin = await findExecutable('docker')
  if (!dcBin) return []

  return project.components
    .filter((cmp) => cmp.type === 'docker-compose' && cmp.targets.length)
    .map((cmp) => dockerComposeLauncher(project, 'up', [cmp]))
}
