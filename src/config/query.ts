import { ContextConfig, LaunchConfig } from './types'

export const launchConfigCount = (config: ContextConfig) => {
  return (
    Object.keys(config.global.launchConfigs).length +
    Object.keys(config.local.launchConfigs).length
  )
}

export const launchConfigByName = (
  configName: string,
  config: ContextConfig
): LaunchConfig | undefined => {
  return [config.local, config.local]
    .map((cfg) => {
      return cfg.launchConfigs[configName]
    })
    .find((cfg) => cfg)
}
