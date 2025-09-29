import os from 'node:os'

import { DiskFileSystem } from '@whimbrel/filesystem'

import { bootstrap as bootstrapInternal } from './bootstrap'

import { makeConfigurationFacade } from '@src/config'
import { ApplicationState, makeProjectFacade } from '@src/project'
import {
  ApplicationEnvironment,
  inspectEnvironment,
  noBackend,
} from '@src/tui/framework'
import { ActionFacade } from '@src/tui'
import { LGOptions } from '@src/tui/goblin-app'
import { analyze } from '@src/project/analyze'
import { BlessedBackend } from '@src/tui/framework/blessed'
import { makeSystemModule } from './facade'
import { findExecutable } from '@src/system'
export { inspectEnvironment } from '@src/tui/framework'

/**
 * Bootstrap the application using run-time collaborators
 *
 * @param targetAction The target action to perform (e.g., project path or URL)
 * @param options The command-line options provided by the user
 * @returns An object containing the application environment, state model, and action facade
 */
export const bootstrap = async (
  targetAction: string,
  options: LGOptions
): Promise<{
  env: ApplicationEnvironment
  model: ApplicationState
  facade: ActionFacade
}> => {
  const systemModule = makeSystemModule(
    () => os.homedir(),
    inspectEnvironment,
    findExecutable
  )
  const configModule = makeConfigurationFacade(systemModule, DiskFileSystem)
  const projectModule = makeProjectFacade(systemModule, analyze)

  return bootstrapInternal(
    targetAction,
    options,
    systemModule,
    configModule,
    projectModule,
    () => (options.autoLaunch ? noBackend() : BlessedBackend.create())
  )
}
