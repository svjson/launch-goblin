import { Command } from 'commander'
import { LGOptions, makeLGOptions } from '@src/tui'
import { makeDefaultFilter, makePassThroughFilter } from '@src/project'
import { ColorMode } from '@src/tui/framework'

/**
 * Type-safe interface for options compiled by Commander
 */
interface ProgramOptions {
  colorMode?: ColorMode
  verbose?: boolean
  termInfo?: boolean
  relaunch?: boolean
}

/**
 * Interface for mode implementations
 */
interface Modes {
  run: (opts: LGOptions) => Promise<void>
  termInfo: () => void
  onError: (error: string) => void
}

export const exclArgString = (thisArg: string, other: string) =>
  `${thisArg} cannot be used in combination with ${other}`

/**
 * Construct an error message indicating conflicting program arguments,
 * if any.
 *
 * @param args The parsed program arguments
 *
 * @return An error message if conflicting arguments are found, otherwise
 *         undefined
 */
const exclusiveArgError = (args: any): string | undefined => {
  const [thisArg, exclusive] = Object.entries({
    target: `A launch target (${args.target})`,
    termInfo: '--term-info',
    relaunch: '--relaunch',
  }).reduce((result, [key, expr]) => {
    if (args[key]) {
      return [...result, expr]
    }
    return result
  }, Array())

  if (exclusive) {
    return exclArgString(thisArg, exclusive)
  }
}

/**
 * Create the CLI program instance.
 *
 * @param modes The mode implementations
 *
 * @return The Commander program instance
 */
export const makeProgram = (modes: Modes): Command => {
  const program = new Command()

  program
    .name('launch-goblin')
    .description('Launch Goblin project launcher')
    .argument('[target]', 'Launch target (e.g, dev, start)')
    .option('--color-mode <colorMode>', 'Force color mode')
    .option('-v, --verbose', 'Enable verbose output')
    .option(
      '-i, --term-info',
      'Output detected terminal capabilities and exit.'
    )
    .option(
      '-r, --relaunch',
      'Bypass the launcher tui and launch the most recently used launch config.'
    )
    .action(async (target?: string, opts: ProgramOptions = {}) => {
      const argError = exclusiveArgError({ ...opts, target })
      if (argError) {
        return modes.onError(argError)
      }

      if (opts.termInfo) {
        return modes.termInfo()
      }

      await modes.run(
        makeLGOptions({
          verbose: opts.verbose ?? false,
          colorMode: opts.colorMode,
          launch: {
            autoLaunch: opts.relaunch ?? false,
            defaultTarget: target ?? 'dev',
            targetFilter: opts.relaunch
              ? makePassThroughFilter()
              : makeDefaultFilter(target ?? 'dev'),
          },
        })
      )
    })

  return program
}
