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
  groups: LaunchGroup[]
}

export interface LaunchGroup {
  mode: 'parallel' | 'sequential'
  processes: LaunchProcess[]
}

export interface LaunchProcess {
  bin: string
  args: string[]
  critical?: boolean
}
