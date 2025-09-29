import { ApplicationState, Project } from '@src/project'
import {
  ContextConfig,
  PrivateConfig,
  LaunchConfig,
  LGConfig,
  SharedConfig,
} from './types'
import { FileSystem } from '@whimbrel/core'
import { SystemModule } from '@src/bootstrap/facade'
import path from 'node:path'
import { toLaunchConfigComponents } from './apply'

/**
 * Module interface for reading and writing configurations to/from
 * disk.
 */
export interface ConfigurationModule {
  readConfig(project: Project): Promise<ContextConfig>
  saveLatestLaunch(state: ApplicationState): Promise<void>
  savePrivateConfig(project: Project, config: PrivateConfig): Promise<void>
  saveSharedConfig(project: Project, config: LGConfig): Promise<void>
}

/**
 * Ensure that a de-serialized configuration is complete and required
 * fields not present in earlier versions are filled with default values.
 *
 * If `defaultTarget` is missing, it is set to 'dev'.
 * If any component is missing `targets`, it is set to an array
 * containing `defaultTarget`.
 *
 * @param lc - The launch configuration to ensure
 * @returns The resulting, correct, launch configuration
 */
const ensureLaunchConfigStructure = (lc: LaunchConfig) => {
  if (!lc.defaultTarget) lc.defaultTarget = 'dev'
  Object.values(lc.components).forEach((c) => {
    if (!c.targets) c.targets = [lc.defaultTarget]
  })
}

/**
 * Create a Facade object for reading and writing configuration files
 */
export const makeConfigurationFacade = (
  systemModule: SystemModule,
  fs: FileSystem
): ConfigurationModule => {
  /**
   * Return the path to the shared directory-local configuration file
   * for `project`.
   *
   * This file is intended to be checked into version control and
   * shared among all users of a project.
   *
   * The file is always named `.goblin` and is located in the root
   * of the project.
   *
   * @param project - The project for which to get the configuration file path
   * @returns The path to the shared configuration file
   */
  const sharedConfigPath = (project: Project) =>
    path.join(project.root, '.goblin')

  /**
   * Return the path to the private user configuration file for
   * `project`.
   *
   * This file is intended to be private to the user and not
   * checked into version control.
   *
   * The file is located in the user's home directory in
   * `.goblin/<project-id>`.
   *
   * @param project - The project for which to get the configuration file path
   * @returns The path to the private configuration file
   */
  const privateConfigPath = (project: Project) =>
    path.join(systemModule.userdir(), '.goblin', project.id)

  /**
   * Return an empty configuration object
   */
  const emptyConfig = (): LGConfig => ({
    launchConfigs: {},
  })

  /**
   * Ensure that the directory for `filePath` exists, creating it if necessary.
   *
   * If the directory already exists, no action is taken.
   * If the directory does not exist, it and any necessary parent
   * directories are created.
   *
   * @param filePath - The file path for which to ensure the directory exists
   * @returns The original file path
   */
  const ensurePath = async (filePath: string): Promise<string> => {
    if (await fs.exists(filePath)) return filePath
    if (await fs.exists(path.dirname(filePath))) return filePath
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    return filePath
  }

  /**
   * Read a configuration file from `cfgFile`.
   * If the file does not exist, an empty configuration is returned.
   *
   * If the file exists but is not valid JSON, an error is thrown.
   *
   * If the file exists but does not conform to the expected structure,
   * an error may be thrown or the structure may be corrected.
   *
   * @param cfgFile - The path to the configuration file
   * @returns The configuration file content.
   */
  const readConfigFile = async (cfgFile: string): Promise<LGConfig> => {
    if (await fs.exists(cfgFile)) {
      const cfg: LGConfig = await fs.readJson(cfgFile, 'utf8')
      Object.values(cfg.launchConfigs).forEach((lc) => {
        ensureLaunchConfigStructure(lc)
      })
      return cfg
    }
    return emptyConfig()
  }

  /**
   * Read private configuration file from `cfgFile`.
   * If the file does not exist, an empty configuration with a default
   * `lastConfig` is returned.
   *
   * If the file exists but is not valid JSON, an error is thrown.
   *
   * If the file exists but does not conform to the expected structure,
   * an error may be thrown or the structure may be corrected.
   *
   * The `lastConfig` property is ensured to exist and have a valid structure.
   *
   * If `lastConfig` is missing, it is created with a default target of 'dev'
   * and no components.
   */
  const readPrivateConfigFile = async (
    cfgFile: string
  ): Promise<PrivateConfig> => {
    const cfg = (await readConfigFile(cfgFile)) as PrivateConfig
    if (!cfg.lastConfig)
      cfg.lastConfig = { defaultTarget: 'dev', components: {} }
    ensureLaunchConfigStructure(cfg.lastConfig)
    return cfg
  }

  /**
   * Return an implementation of the public interface of ConfigurationModule.
   */
  return {
    /**
     * Read the configuration for `project`, returning both the private and
     * shared configurations.
     *
     * If either configuration file does not exist, it is treated as an
     * empty configuration.
     *
     * @param project - The project for which to read the configuration
     * @returns The combined configuration
     */
    async readConfig(project: Project): Promise<ContextConfig> {
      return {
        shared: await readConfigFile(sharedConfigPath(project)),
        private: await readPrivateConfigFile(privateConfigPath(project)),
      }
    },

    /**
     * Save the latest launch configuration from `model` into the
     * private configuration file for the project.
     *
     * The `lastConfig` property of the private configuration is
     * updated to reflect the current state of the launch session
     *
     * @param model - The application state containing the project and session
     * @returns A promise that resolves when the configuration has been saved
     */
    async saveLatestLaunch(model: ApplicationState) {
      model.config.private.lastConfig = {
        defaultTarget: 'dev',
        components: toLaunchConfigComponents(model.session.components),
      }
      await this.savePrivateConfig(model.project, model.config.private)
    },

    /**
     * Save the shared configuration for `project` to the shared configuration
     * file.
     *
     * The shared configuration file is intended to be checked into version
     * control and shared among all users of a project.
     *
     * @param project - The project for which to save the configuration
     * @param config - The configuration to save
     */
    async saveSharedConfig(
      project: Project,
      config: SharedConfig
    ): Promise<void> {
      await fs.writeJson(await ensurePath(sharedConfigPath(project)), config)
    },

    /**
     * Save the private configuration for `project` to the private configuration
     * file.
     *
     * The private configuration file is intended to be private to the user
     * and not checked into version control.
     *
     * @param project - The project for which to save the configuration
     * @param config - The configuration to save
     */
    async savePrivateConfig(
      project: Project,
      config: PrivateConfig
    ): Promise<void> {
      await fs.writeJson(await ensurePath(privateConfigPath(project)), config)
    },
  }
}
