import { ApplicationEnvironment } from '@src/tui/framework'
import { LaunchCommand, LaunchedProcess } from './types'
import { SystemModule } from '@src/system'

export interface ProcessTracker {
  getLaunchedProcesses: () => LaunchedProcess[]
  launch: (env: ApplicationEnvironment, cmd: LaunchCommand) => Promise<void>
}

const TERM_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']

export const makeProcessTracker = (
  systemModule: SystemModule
): ProcessTracker => {
  /**
   * Semaphore, tracking if a launch has been initiated from within processes.
   *
   * Used to prevent the application from launching twice due to borked handling of
   * stdin.
   */
  let launched: boolean = false
  const children: LaunchedProcess[] = []

  /**
   * Resolve an executable across platforms.
   *
   * On Windows this will pick up `.cmd`/`.exe` shims,
   * on Unix it will just find the binary.
   *
   * @param bin The binary to find
   * @returns The resolved path to the binary
   */
  const findExecutable = async (
    env: ApplicationEnvironment,
    bin: string
  ): Promise<string> => {
    const binPath = await systemModule.findExecutable(bin)
    if (!binPath) {
      throw new Error(`Could not find executable: ${bin}`)
    }

    if (env.tty.shell.endsWith('.exe')) {
      return (binPath.includes(' ') ? `"${binPath}"` : binPath)
        .replaceAll('\\ ', '/')
        .replaceAll('.CMD', '.cmd')
    }

    return binPath
  }

  const killChildProcesses = (sig: NodeJS.Signals) => {
    for (const child of children) {
      child.kill(sig)
    }
  }

  const launchProcess = async (
    env: ApplicationEnvironment,
    executable: string,
    args: string[]
  ) => {
    if (process.platform === 'win32') {
      return await systemModule.spawnDetachedProcess(env, {
        bin: executable,
        args,
      })
    } else {
      return await systemModule.spawnProxiedProcess(env, {
        bin: executable,
        args,
      })
    }
  }
  /**
   * Bind listeners to child process and dispose of Launch
   * Goblin after the launched child dies.
   */
  const bindSig = (child: LaunchedProcess) => {
    // always forward signals
    TERM_SIGNALS.forEach((sig) => {
      process.on(sig, () => {
        killChildProcesses(sig)
        process.exit(0)
      })
    })

    child.on('exit', () => {
      const idx = children.indexOf(child)
      if (idx !== -1) children.splice(idx, 1)

      if (child.command.critical) {
        killChildProcesses('SIGTERM')
      }

      if (children.length) {
        systemModule.exit(0)
      }
    })
  }

  return {
    getLaunchedProcesses(): LaunchedProcess[] {
      return children
    },

    /**
     * Launch a command as a child process, forwarding stdio and signals.
     *
     * Ensures only one launch occurs, by tracking state internally via
     * `launched`. If a launch has already occurred, this is a no-op.
     *
     * Registers handlers for `SIGINT` and `SIGTERM` to forward to the child process,
     * and exits the parent process when the child exits, making sure everything
     * gets cleaned up.
     *
     * @param cmd The command to launch
     * @returns void
     */
    async launch(env: ApplicationEnvironment, cmd: LaunchCommand) {
      if (launched) return
      launched = true

      for (const group of cmd.groups) {
        for (const proc of group.processes) {
          const { bin, args } = proc
          const executable = await findExecutable(env, bin)

          const launched = await launchProcess(env, executable, args)
          bindSig(launched)
          children.push(launched)

          if (group.mode === 'sequential') {
            await new Promise<void>((resolve) => {
              launched.on('exit', resolve)
            })
          }
        }
      }
    },
  }
}
