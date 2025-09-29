import { LGOptions } from '@src/tui/goblin-app'
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
  options: LGOptions
}

/**
 * Describes the current state of launch options
 */
export interface LaunchSession {
  /**
   * The launch target, e.g, a package.json script
   */
  target: string
  /**
   * The components and their launch options.
   */
  components: SessionComponent[]
}

/**
 * The mutable representation of a launchable component and its current state
 * in the application.
 */
export interface SessionComponent<
  T extends ProjectComponent = ProjectComponent,
> {
  /**
   * Immutable shared reference to the project component, owned by Project.
   */
  readonly component: T
  /**
   * The currently configured launch options for the component.
   */
  state: ComponentLaunchConfig
}
