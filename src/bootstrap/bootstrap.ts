import { applyConfig, ConfigurationModule, ContextConfig } from '@src/config'
import { makeLaunchFacade } from '@src/launch'
import { ApplicationState, Project, ProjectModule } from '@src/project'
import { LaunchSession } from '@src/project/state'
import { ActionFacade, LGOptions } from '@src/tui'
import {
  ApplicationEnvironment,
  Backend,
  DefaultTheme,
} from '@src/tui/framework'
import { makeActionFacade } from './app'
import { SystemModule } from './facade'
import { BootstrapError } from './error'

export const bootstrap = async (
  targetAction: string,
  options: LGOptions,
  systemModule: SystemModule,
  configModule: ConfigurationModule,
  projectModule: ProjectModule,
  backendProvider: () => Backend
): Promise<{
  env: ApplicationEnvironment
  model: ApplicationState
  facade: ActionFacade
}> => {
  const project: Project = await projectModule.readProject(
    targetAction,
    options
  )

  const config: ContextConfig = await configModule.readConfig(project)
  const session: LaunchSession = applyConfig(
    config.global.lastConfig,
    project,
    {
      target: 'dev',
      components: [],
    }
  )

  const model: ApplicationState = {
    project,
    config,
    session,
    options,
  }

  if (model.project.launchers.length === 0) {
    throw new BootstrapError(
      `No launch strategy available for target action '${targetAction}'`
    )
  }
  const tty = await systemModule.inspectEnvironment()
  if (options.colorMode) {
    tty.colorMode = options.colorMode
  }
  const backend = backendProvider()

  const env = { backend, tty, theme: DefaultTheme, log: [] }

  const launchModule = makeLaunchFacade()
  const facade = makeActionFacade(env, model, configModule, launchModule)

  return { env, model, facade }
}
