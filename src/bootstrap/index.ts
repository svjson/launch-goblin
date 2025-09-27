import { applyConfig, ContextConfig, readConfig } from '@src/config'
import { ApplicationState, Project, readProject } from '@src/project'
import { LaunchSession } from '@src/project/state'
import {
  ApplicationEnvironment,
  DefaultTheme,
  inspectEnvironment,
  noBackend,
} from '@src/tui/framework'
import { BlessedBackend } from '@src/tui/framework/blessed'
import { LGOptions } from '@src/tui/goblin-app'
export { inspectEnvironment } from '@src/tui/framework'

export const bootstrap = async (
  targetAction: string,
  options: LGOptions
): Promise<{
  env: ApplicationEnvironment
  model: ApplicationState
}> => {
  const project: Project = await readProject(targetAction, options)

  const config: ContextConfig = await readConfig(project)
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

  return { env, model }
}
