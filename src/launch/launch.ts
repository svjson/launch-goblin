import { spawn, ChildProcess } from 'child_process'

import { LaunchedProcess, LaunchProcess, ProcessEvent } from './types'
import { ApplicationEnvironment } from '@src/tui/framework'

/**
 * Implementation of LaunchedProcess that wraps an actual ChildProcess
 */
class LaunchedChildProcess implements LaunchedProcess {
  constructor(
    public command: LaunchProcess,
    private child: ChildProcess
  ) {}

  on(event: ProcessEvent, callback: () => void) {
    this.child.on(event, callback)
  }

  kill(sig: NodeJS.Signals) {
    try {
      this.child.kill(sig)
    } catch {
      return
    }
  }
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
export const spawnDetachedProcess = async (
  _env: ApplicationEnvironment,
  cmd: LaunchProcess
): Promise<LaunchedProcess> => {
  const { bin, args } = cmd

  const child = spawn(bin, args, {
    shell: true,
    detached: true,
    windowsHide: false,
  })

  return new LaunchedChildProcess(cmd, child)
}

/**
 * Launch as child process and forward stdin/stdout from the
 * launcher process.
 *
 * @param env - ApplicationEnvironment
 * @param cmd - The command to launch
 */
export const spawnProxiedProcess = async (
  _env: ApplicationEnvironment,
  cmd: LaunchProcess
): Promise<LaunchedProcess> => {
  const { bin, args } = cmd

  const child = spawn(bin, args, {
    stdio: 'inherit',
  })

  return new LaunchedChildProcess(cmd, child)
}
