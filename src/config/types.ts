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

/**
 * Enum type with original terminology for ConfigType.
 *
 * These names are dumb. Local refers to "local to the current directory",
 * but I keep reading it as "local to the system", in other words private.
 *
 * To be killed with fire.
 */
export type LegacyConfigType = 'global' | 'local'

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

export interface GlobalConfig extends LGConfig {
  lastConfig: LaunchConfig
}

export interface ContextConfig {
  local: LGConfig
  global: GlobalConfig
  activeConfigName?: string
}
