#!/usr/bin/env node

import { launch } from './launch'
import { LaunchGoblinApp } from './tui'
import { LogEvent } from './tui/framework'
import { saveLatestLaunch } from './config'
import { setTTYTitleString } from './tui/framework/tty'
import { Command } from 'commander'
import { LGOptions } from './tui/goblin-app'
import { bootstrap, inspectEnvironment } from './bootstrap'

/**
 * Launches the application with command-line options
 */
const main = async (options: LGOptions) => {
  const targetAction = 'dev'
  const { env, model } = await bootstrap(targetAction, options)

  const app = new LaunchGoblinApp(env, model)

  app.mainCtrl.on('launch', async () => {
    env.backend.dispose()
    const selected = model.project.components.filter((c) => c.selected)
    await saveLatestLaunch(model)
    const cmd = model.project.launchers[0].launchCommand(selected)
    await launch(cmd)
  })

  app.mainCtrl.on('log', (event: LogEvent) => {
    env.log.push(event.message)
  })

  app.mainCtrl.focus()

  env.backend.onKeyPress(['q', 'C-c'], (_ch, _key) => {
    env.backend.dispose()
    env.log.forEach((m) => console.log(m))
    process.exit(0)
  })

  process.on('exit', () => {
    setTTYTitleString(model.originalWindowTitleString ?? '')
  })

  env.backend.render()
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

program
  .command('env')
  .description('Output execution environment details')
  .action(async () => {
    const env = await inspectEnvironment()
    console.log(`Shell: ${env.shell}`)
    console.log(`TTY: ${env.tty}`)
    console.log(`Color Mode: ${env.colorMode}`)
    console.log(`TERM: ${env.TERM}`)
    process.exit(0)
  })

program.parse()
