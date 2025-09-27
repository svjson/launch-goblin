import { Project } from './project'
import { ProjectComponent } from './types'
import { ComponentLaunchConfig, ContextConfig } from '@src/config'

export interface ApplicationState {
  /**
   * The original window title string of the TTY that runs launch goblin.
   *
   * Most terminals and terminal emulators allow _setting_ the window title
   * string using ANSI escape codes, but few support reading it. Launch Goblin
   * will attempt to read it, but may fail - in which case this value will be
   * null.
   */
  originalWindowTitleString?: string | null | undefined
  project: Project
  config: ContextConfig
  session: LaunchSession
}

export interface SessionComponent {
  component: ProjectComponent
  state: ComponentLaunchConfig
}

export interface LaunchSession {
  target: string
  components: SessionComponent[]
}
