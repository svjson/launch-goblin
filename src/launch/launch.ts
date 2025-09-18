import { spawn } from 'child_process'

import which from 'which'

import { LaunchCommand } from './types'

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
export const findExecutable = async (bin: string): Promise<string> => {
  try {
    return await which(bin)
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
export const launch = async (cmd: LaunchCommand) => {
  if (launched) return
  launched = true

  const { bin, args } = cmd

  const executable = await findExecutable(bin)

  const child = spawn(executable, args, {
    stdio: 'inherit',
  })

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
