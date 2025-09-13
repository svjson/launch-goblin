import { Project } from '@src/project'
import { identifyTurboLaunchOptions } from './turbo'
import { identifyPnpmLaunchOptions } from './pnpm'
import { Launcher } from './types'
import { LGOptions } from '@src/tui/goblin-app'

export const identifyLaunchers = async (
  project: Project,
  launchAction: string,
  options: LGOptions
): Promise<Launcher[]> => {
  const launchers: Launcher[] = [
    ...(await identifyTurboLaunchOptions(project, launchAction, options)),
    ...(await identifyPnpmLaunchOptions(project, launchAction, options)),
  ]

  return launchers
}
