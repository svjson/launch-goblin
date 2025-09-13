#!/usr/bin/env node

import { launch } from './launch'
import { readProject } from './project'
import { readTTYTitleString } from './tui/framework'
import { LaunchGoblinApp } from './tui'
import { LogEvent } from './tui/framework'
import { ApplicationState } from './project'
import { saveLatestLaunch } from './config'
import { setTTYTitleString } from './tui/framework/tty'
import { Command } from 'commander'
import { LGOptions } from './tui/goblin-app'
import { BlessedBackend } from './tui/framework/blessed'

/**
 * Launches the application with command-line options
 */
const main = async (options: LGOptions) => {
  const targetAction = 'dev'
  const model: ApplicationState = await readProject(targetAction, options)
  model.originalWindowTitleString = await readTTYTitleString()

  if (model.project.launchers.length === 0) {
    console.error(
      `No launch strategy available for target action '${targetAction}'`
    )
    process.exit(1)
  }

  const backend = BlessedBackend.create()

  const log: string[] = []

  const app = new LaunchGoblinApp(backend, model)

  app.mainCtrl.on('launch', async () => {
    backend.dispose()
    const selected = model.project.components.filter((c) => c.selected)
    await saveLatestLaunch(model)
    const cmd = model.project.launchers[0].launchCommand(selected)
    await launch(cmd)
  })

  app.mainCtrl.on('log', (event: LogEvent) => {
    log.push(event.message)
  })

  app.mainCtrl.focus()

  backend.onKeyPress(['q', 'C-c'], (ch, key) => {
    console.log(ch, key)
    backend.dispose()
    log.forEach((m) => console.log(m))
    process.exit(0)
  })

  process.on('exit', () => {
    setTTYTitleString(model.originalWindowTitleString ?? '')
  })

  backend.render()
}

/**
 * Create Commander CLI interpreter, parse and run.
 */
const program = new Command()

program
  .name('launch-goblin')
  .description('Launch Goblin project launcher')
  .option('-v, --verbose', 'Enable verbose output')

program.action(async (opts: LGOptions) => {
  await main(opts)
})

program.parse()
