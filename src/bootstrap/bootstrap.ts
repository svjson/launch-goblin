import { applyConfig, ConfigurationModule, ContextConfig } from '@src/config'
import { makeLaunchFacade } from '@src/launch'
import { ApplicationState, Project, ProjectModule } from '@src/project'
import { LaunchSession } from '@src/project/state'
import { ActionFacade, LGOptions } from '@src/tui'
import { SystemModule } from '@src/system'
import {
  ApplicationEnvironment,
  Backend,
  DefaultTheme,
} from '@src/tui/framework'
import { makeActionFacade } from './app'
import { BootstrapError } from './error'
import { makeProcessTracker } from '@src/launch/process-tracker'

/**
 * Bootstrap the application using the provided modules for IO and
 * inspecting the project context and launch options.
 */
export const bootstrap = async (
  targetAction: string,
  options: LGOptions,
  systemModule: SystemModule,
  configModule: ConfigurationModule,
  projectModule: ProjectModule,
  backendProvider: () => Promise<Backend>
): Promise<{
  env: ApplicationEnvironment
  model: ApplicationState
  facade: ActionFacade
}> => {
  /**
   * Read and analyze the project on disk at cwd.
   */
  const project: Project = await projectModule.readProject(
    targetAction,
    options
  )

  /**
   * If project/folder analysis yielded no viable launch strategies,
   * bail and exit.
   */
  if (project.launchers.length === 0) {
    throw new BootstrapError(
      `No launch strategy available for target action '${targetAction}'`
    )
  }

  /**
   * Read user-private and project/shared configurations
   */
  const config: ContextConfig = await configModule.readConfig(project)

  /**
   * Create the initial launch session/configuration state.
   */
  const session: LaunchSession = applyConfig(
    config.private.lastConfig,
    project,
    {
      target: 'dev',
      components: [],
    }
  )

  /**
   * Construct the root application state
   */
  const model: ApplicationState = {
    project,
    config,
    session,
    options,
  }

  const tty = await systemModule.inspectEnvironment()
  if (options.colorMode) {
    tty.colorMode = options.colorMode
  }
  const backend = await backendProvider()

  const env = { backend, tty, theme: DefaultTheme, log: [] }

  const processTracker = makeProcessTracker(systemModule)
  const launchModule = makeLaunchFacade(processTracker)
  const facade = makeActionFacade(env, model, configModule, launchModule)

  return { env, model, facade }
}
