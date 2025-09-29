import equal from 'fast-deep-equal'
import { ContextConfig, LaunchConfig } from './types'

/**
 * Return the total count of launch configurations, private and shared
 * contained in `config`.
 *
 * @param config The context configuration.
 * @return The total count of launch configurations.
 */
export const launchConfigCount = (config: ContextConfig) => {
  return (
    Object.keys(config.private.launchConfigs).length +
    Object.keys(config.shared.launchConfigs).length
  )
}

/**
 * Find a launch configuration by name in the given context configuration,
 * considering both private and shared configs.
 *
 * @param configName The name of the launch configuration.
 * @param config The context configuration.
 *
 * @return The launch configuration or undefined if not found.
 */
export const launchConfigByName = (
  configName: string,
  config: ContextConfig
): LaunchConfig | undefined => {
  return [config.shared, config.private]
    .map((cfg) => {
      return cfg.launchConfigs[configName]
    })
    .find((cfg) => cfg)
}

/**
 * Find a launch configuration by content in the given context configuration,
 * considering both private and shared configs.
 *
 * A configuration is considered to be a match if the configuration state
 * is identical to the argument configuration.
 *
 * @param configContent The content of the launch configuration.
 * @param config The context configuration.
 *
 * @return An object containing the name and configuration, or undefined if not
 *         found.
 */
export const launchConfigByContent = (
  configContent: LaunchConfig,
  config: ContextConfig
): { name: string; config: LaunchConfig } | undefined => {
  return [config.shared, config.private]
    .flatMap((cfg) =>
      Object.entries(cfg.launchConfigs).map(([name, config]) => ({
        name,
        config,
      }))
    )
    .find((cfg) => equal(cfg.config, configContent))
}
