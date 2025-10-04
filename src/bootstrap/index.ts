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
import { makeSystemModule } from '@src/system'
import { findExecutable } from '@src/system'
import { spawnDetachedProcess, spawnProxiedProcess } from '@src/launch/launch'
export { inspectEnvironment } from '@src/tui/framework'

/**
 * Bootstrap the application using run-time collaborators.
 *
 * This wires up the various modules, in some makeshift DI manner and
 * calls the internal bootsrapping function to use them to analyze the
 * project, read stored configs and initialize the TUI backend.
 *
 * @param targetAction - The target action to perform (ie, package.json
 *                       script name)
 * @param options - The command-line options provided by the user
 *
 * @return An object containing the application environment, state
 *         model, and action facade
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
    (signal: number) => process.exit(signal),
    () => os.homedir(),
    inspectEnvironment,
    findExecutable,
    spawnDetachedProcess,
    spawnProxiedProcess
  )
  const configModule = makeConfigurationFacade(systemModule, DiskFileSystem)
  const projectModule = makeProjectFacade(systemModule, analyze)

  return bootstrapInternal(
    targetAction,
    options,
    systemModule,
    configModule,
    projectModule,
    async () =>
      options.autoLaunch
        ? noBackend()
        : BlessedBackend.create(await inspectEnvironment())
  )
}
