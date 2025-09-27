import { SessionComponent } from '@src/project/state'
import { ApplicationEnvironment } from '@src/tui/framework'

export type LauncherId = 'turbo' | 'pnpm'

export type MakeLaunchCommand = (
  env: ApplicationEnvironment,
  components: SessionComponent[]
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
