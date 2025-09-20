import { spawn, ChildProcess } from 'child_process'

import which from 'which'

import { LaunchCommand } from './types'
import { ApplicationEnvironment } from '@src/tui/framework'

/**
 * Semaphore, tracking if a launch has been initiated from within processes.
 *
 * Used to prevent the application from launching twice due to borked handling of
 * stdin.
 */
let launched = false

/**
 * Resolve an executable across platforms.
 *
 * On Windows this will pick up `.cmd`/`.exe` shims,
 * on Unix it will just find the binary.
 *
 * @param bin The binary to find
 * @returns The resolved path to the binary
 */
export const findExecutable = async (
  env: ApplicationEnvironment,
  bin: string
): Promise<string> => {
  try {
    const binPath = await which(bin)

    if (env.tty.shell.endsWith('.exe')) {
      return (binPath.includes(' ') ? `"${binPath}"` : binPath)
        .replaceAll('\\ ', '/')
        .replaceAll('.CMD', '.cmd')
    }

    return binPath
  } catch (err) {
    throw new Error(`Could not find executable: ${bin}`)
  }
}

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
export const launch = async (
  env: ApplicationEnvironment,
  cmd: LaunchCommand
) => {
  if (launched) return
  launched = true

  const { bin, args } = cmd
  const executable = await findExecutable(env, bin)

  if (process.platform === 'win32') {
    await launchDetached(env, { bin: executable, args })
  } else {
    await launchProxied(env, { bin: executable, args })
  }
}

/**
 * Bind listeners to child process and dispose of Launch
 * Goblin after the launched child dies.
 */
const bindSig = (child: ChildProcess) => {
  process.on('SIGINT', () => {
    child.kill('SIGINT')
  })

  process.on('SIGTERM', () => {
    child.kill('SIGINT')
  })

  child.on('exit', () => {
    process.exit(0)
  })
}

/**
 * Launch as a detached child process in a new window.
 *
 * This is currently the only option on Windows without
 * node-pty.
 *
 * This might also be the only reasonable way to launch from within
 * embedded terminals in IDEs.
 *
 * @param env - ApplicationEnvironment
 * @param cmd - The command to launch
 */
const launchDetached = async (
  _env: ApplicationEnvironment,
  cmd: LaunchCommand
) => {
  const { bin, args } = cmd

  const child = spawn(bin, args, {
    shell: true,
    detached: true,
    windowsHide: false,
  })

  bindSig(child)
}

/**
 * Launch as child process and forward stdin/stdout from the
 * launcher process.
 *
 * @param env - ApplicationEnvironment
 * @param cmd - The command to launch
 */
const launchProxied = async (
  _env: ApplicationEnvironment,
  cmd: LaunchCommand
) => {
  const { bin, args } = cmd

  const child = spawn(bin, args, {
    stdio: 'inherit',
  })

  bindSig(child)
}
