import { Project } from '@src/project'
import { identifyTurboLaunchOptions } from './turbo'
import { identifyPnpmLaunchOptions } from './pnpm'
import { Launcher } from './types'
import { LGOptions } from '@src/tui/goblin-app'
import { identifyDockerComposeLaunchOptions } from './docker-compose'
import { SystemModule } from '@src/system'

export const identifyLaunchers = async (
  systemModule: SystemModule,
  project: Project,
  launchAction: string,
  options: LGOptions
): Promise<Launcher[]> => {
  const launchers: Launcher[] = [
    ...(await identifyTurboLaunchOptions(project, launchAction, options)),
    ...(await identifyPnpmLaunchOptions(project, launchAction, options)),
    ...(await identifyDockerComposeLaunchOptions(systemModule, project)),
  ]

  return launchers
}
