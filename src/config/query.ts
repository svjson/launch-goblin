import equal from 'fast-deep-equal'
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
  return [config.local, config.global]
    .map((cfg) => {
      return cfg.launchConfigs[configName]
    })
    .find((cfg) => cfg)
}

export const launchConfigByContent = (
  configContent: LaunchConfig,
  config: ContextConfig
): { name: string; config: LaunchConfig } | undefined => {
  return [config.local, config.global]
    .flatMap((cfg) =>
      Object.entries(cfg.launchConfigs).map(([name, config]) => ({
        name,
        config,
      }))
    )
    .find((cfg) => equal(cfg.config, configContent))
}
