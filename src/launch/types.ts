import { ProjectComponent } from '@src/project'

export type LauncherId = 'turbo' | 'pnpm'

export type MakeLaunchCommand = (
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
