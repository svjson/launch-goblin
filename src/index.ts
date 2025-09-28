#!/usr/bin/env node

import { LaunchGoblinApp } from './tui'
import { LogEvent } from './tui/framework'
import { setTTYTitleString } from './tui/framework/tty'
import { Command } from 'commander'
import { LGOptions, makeLGOptions } from './tui/goblin-app'
import { bootstrap, inspectEnvironment } from './bootstrap'

/**
 * Launches the application with command-line options
 */
const main = async (options: LGOptions) => {
  const targetAction = 'dev'
  const { env, model, facade } = await bootstrap(targetAction, options)

  if (options.autoLaunch) {
    await facade.launch()
  } else {
    const app = new LaunchGoblinApp(env, model, facade)

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
}

/**
 * Create Commander CLI interpreter, parse and run.
 */
const program = new Command()

program
  .name('launch-goblin')
  .description('Launch Goblin project launcher')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--color-mode <colorMode>', 'Force color mode')

program.action(async (opts: LGOptions) => {
  await main({
    ...opts,
    autoLaunch: false,
  })
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
    console.log(`Terminal: ${env.terminal}`)
    console.log(`Session name: ${env.nt ?? ''}`)
    process.exit(0)
  })

program
  .command('last')
  .description(
    'Launch with the most recent launch configuration, bypassing the tui.'
  )
  .action(async () => {
    await main(
      makeLGOptions({
        verbose: false,
        autoLaunch: true,
      })
    )
  })

program.parse()
