export interface ComponentLaunchConfig {
  selected?: boolean
}

export interface LaunchConfig {
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
