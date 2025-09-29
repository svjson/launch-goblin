/**
 * Enum type for LaunchConfig ownership.
 *
 * Private configurations belong to the local user and is saved in the home
 * directory of the system user.
 *
 * Shared configurations are saved in the project/repository root, where it
 * can be subject to version control and shared among project members.
 */
export type ConfigType = 'private' | 'shared'

export interface ComponentLaunchConfig {
  selected: boolean
  targets: string[]
}

export interface LaunchConfig {
  defaultTarget: string
  components: Record<string, ComponentLaunchConfig>
}

export interface LGConfig {
  launchConfigs: Record<string, LaunchConfig>
}

/**
 * Contains the shared configuration, stored locally in a project.
 */
export type SharedConfig = LGConfig

/**
 * Contains the private configuration, stored in the system users home dir
 */
export interface PrivateConfig extends LGConfig {
  lastConfig: LaunchConfig
}

/**
 * The full configuration state, joining both shared and private configurations
 */
export interface ContextConfig {
  shared: SharedConfig
  private: PrivateConfig
  activeConfigName?: string
}
