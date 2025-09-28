import { DiskFileSystem } from '@whimbrel/filesystem'

import {
  applyConfig,
  ContextConfig,
  LegacyConfigType,
  makeConfigurationFacade,
} from '@src/config'
import { LaunchModule, makeLaunchFacade } from '@src/launch'
import { ApplicationState, Project, readProject } from '@src/project'
import { LaunchSession } from '@src/project/state'
import {
  ApplicationEnvironment,
  DefaultTheme,
  inspectEnvironment,
  noBackend,
} from '@src/tui/framework'
import { BlessedBackend } from '@src/tui/framework/blessed'
import { ActionFacade } from '@src/tui'
import { LGOptions } from '@src/tui/goblin-app'
import { ConfigurationModule } from '@src/config/facade'
export { inspectEnvironment } from '@src/tui/framework'

export const bootstrap = async (
  targetAction: string,
  options: LGOptions
): Promise<{
  env: ApplicationEnvironment
  model: ApplicationState
  facade: ActionFacade
}> => {
  const configModule = makeConfigurationFacade(DiskFileSystem)

  const project: Project = await readProject(targetAction, options)

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
    console.error(
      `No launch strategy available for target action '${targetAction}'`
    )
    process.exit(1)
  }
  const tty = await inspectEnvironment()
  if (options.colorMode) {
    tty.colorMode = options.colorMode
  }
  const backend = options.autoLaunch ? noBackend() : BlessedBackend.create()

  const env = { backend, tty, theme: DefaultTheme, log: [] }

  const launchModule = makeLaunchFacade()
  const facade = makeApplicationFacade(env, model, configModule, launchModule)

  return { env, model, facade }
}

const makeApplicationFacade = (
  env: ApplicationEnvironment,
  state: ApplicationState,
  configModule: ConfigurationModule,
  launchModule: LaunchModule
): ActionFacade => {
  return {
    launch: async () => {
      env.backend.dispose()
      await configModule.saveLatestLaunch(state)
      await launchModule.launchSession(env, state)
    },
    saveConfig: async (state: ApplicationState, type: LegacyConfigType) => {
      if (type === 'local') {
        await configModule.saveLocalConfig(state.project, state.config.local)
      } else {
        await configModule.saveGlobalConfig(state.project, state.config.global)
      }
    },
  }
}
