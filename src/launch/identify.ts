import { Project } from '@src/project'
import { identifyTurboLaunchOptions } from './turbo'
import { identifyPnpmLaunchOptions } from './pnpm'
import { Launcher } from './types'

export const identifyLaunchers = async (
  project: Project,
  launchAction: string
): Promise<Launcher[]> => {
  const launchers: Launcher[] = [
    ...(await identifyTurboLaunchOptions(project, launchAction)),
    ...(await identifyPnpmLaunchOptions(project, launchAction)),
  ]

  return launchers
}
