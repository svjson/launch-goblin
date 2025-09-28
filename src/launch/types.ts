import { ProjectComponent } from '@src/project'
import { SessionComponent } from '@src/project/state'
import { ApplicationEnvironment } from '@src/tui/framework'

export type LauncherId = 'turbo' | 'pnpm' | 'docker-compose'

export type MakeLaunchCommand<C extends ProjectComponent = ProjectComponent> = (
  env: ApplicationEnvironment,
  components: SessionComponent<C>[]
) => LaunchCommand

export interface LauncherFeatures {
  componentTargets: 'single' | 'multi'
  launcherTargets: 'single' | 'multi'
}

export interface Launcher<C extends ProjectComponent = ProjectComponent> {
  id: LauncherId
  defaultTargets: string[]
  launchCommand: MakeLaunchCommand<C>
  components: string[]
  features: LauncherFeatures
}

export type LaunchMode = 'parallel' | 'sequential'

export interface LaunchCommand {
  groups: LaunchGroup[]
}

export interface LaunchGroup {
  mode: LaunchMode
  processes: LaunchProcess[]
}

export interface LaunchProcess {
  bin: string
  args: string[]
  critical?: boolean
}
