import { LaunchGoblinApp } from './tui'
import { LogEvent } from './tui/framework'
import { LGOptions } from './tui/goblin-app'
import { bootstrap, BootstrapError } from './bootstrap'
import { makeProgram, termInfo } from './cli'

/**
 * Launches the application with the command-line options contained in
 * `options`.
 *
 * If `options.launch.autoLaunch` is true, the application will immediately
 * launch the last used configuration, bypassing the TUI.
 *
 * If `options.launch.autoLaunch` is false, the TUI will be presented to the
 * user to select/shape a configuration to launch.
 *
 * @param options The command-line options
 */
const main = async (options: LGOptions): Promise<void> => {
  try {
    const { env, model, facade } = await bootstrap(options)

    if (options.launch.autoLaunch) {
      await facade.launch()
    } else {
      const app = new LaunchGoblinApp(env, model, facade)

      app.mainCtrl.on('log', (event: LogEvent) => {
        env.log.push(event.message)
      })

      env.backend.onKeyPress(['q', 'C-c'], () => {
        env.backend.dispose()
        env.log.forEach((m) => console.log(m))
        process.exit(0)
      })

      env.backend.render()
    }
  } catch (e) {
    if (e instanceof BootstrapError) {
      console.error(e.message)
      process.exit(-1)
    } else {
      throw e
    }
  }
}

/**
 * Create Commander CLI interpreter, parse and run.
 */
const program = makeProgram({
  run: main,
  termInfo,
  onError: (error: string) => {
    console.error(error)
    console.log('')
    process.exit(1)
  },
})
program.parse()
