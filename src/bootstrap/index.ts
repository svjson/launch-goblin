import { ApplicationState, readProject } from '@src/project'
import { ApplicationEnvironment, noBackend } from '@src/tui/framework'
import { BlessedBackend } from '@src/tui/framework/blessed'
import { LGOptions } from '@src/tui/goblin-app'
import { inspectEnvironment } from '../tui/framework/environment'
export { inspectEnvironment } from '../tui/framework/environment'

export const bootstrap = async (
  targetAction: string,
  options: LGOptions
): Promise<{
  env: ApplicationEnvironment
  model: ApplicationState
}> => {
  const model: ApplicationState = await readProject(targetAction, options)

  if (model.project.launchers.length === 0) {
    console.error(
      `No launch strategy available for target action '${targetAction}'`
    )
    process.exit(1)
  }
  const tty = await inspectEnvironment()
  const backend = options.autoLaunch
    ? noBackend()
    : BlessedBackend.create()

  const env = { backend, tty, theme: {}, log: [] }

  return { env, model }
}
