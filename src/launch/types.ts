import { ProjectComponent } from '@src/project'
import { ApplicationEnvironment } from '@src/tui/framework'

export type LauncherId = 'turbo' | 'pnpm'

export type MakeLaunchCommand = (
  env: ApplicationEnvironment,
  components: ProjectComponent[]
) => LaunchCommand

export interface Launcher {
  id: LauncherId
  launchCommand: MakeLaunchCommand
  components: string[]
}

export interface LaunchCommand {
  bin: string
  args: string[]
}
