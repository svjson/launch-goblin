import { Project } from '@src/project'
import { LGOptions } from '@src/tui/goblin-app'
import { SystemModule } from '@src/system'
import { identifyTurboLaunchOptions } from './turbo'
import { identifyPnpmLaunchOptions } from './pnpm'
import { identifyDockerComposeLaunchOptions } from './docker-compose'
import { identifyNpmLaunchOptions } from './npm'
import { Launcher } from './types'

export const identifyLaunchers = async (
  systemModule: SystemModule,
  project: Project,
  options: LGOptions
): Promise<Launcher[]> => {
  const launchers: Launcher[] = [
    ...(await identifyTurboLaunchOptions(project, options)),
    ...(await identifyNpmLaunchOptions(project, options)),
    ...(await identifyPnpmLaunchOptions(project, options)),
    ...(await identifyDockerComposeLaunchOptions(systemModule, project)),
  ]

  return launchers
}
