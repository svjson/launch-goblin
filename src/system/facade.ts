import { LaunchedProcess, LaunchProcess } from '@src/launch/types'
import { ApplicationEnvironment, TTYEnv } from '@src/tui/framework'

/**
 * Module interface for interacting with the host system
 */
export interface SystemModule {
  /**
   * Kill the launch goblin process
   *
   * Essentially a wrapper around `process.exit(signal)`, unless
   * substituted, decorated or replaced for testing purposes
   */
  exit(signal: number): void
  /**
   * Locate the executable `bin` on the host system.
   */
  findExecutable(bin: string): Promise<string | undefined>
  /**
   * Expect the terminal environment and host system to enumerate its
   * capabilities
   */
  inspectEnvironment(): Promise<TTYEnv>
  /**
   * Spawn a child process that is detached from the launch goblin
   * process.
   */
  spawnDetachedProcess(
    env: ApplicationEnvironment,
    command: LaunchProcess
  ): Promise<LaunchedProcess>
  /**
   * Spawn a child process and forward stdin and stdout to that process
   */
  spawnProxiedProcess(
    env: ApplicationEnvironment,
    command: LaunchProcess
  ): Promise<LaunchedProcess>
  /**
   * Return the home directory of the user running the process
   */
  userdir(): string
}

/**
 * Construct an instance of `SystemModule` using the argument functions
 */
export const makeSystemModule = (
  exit: (signal: number) => void,
  userdirProvider: () => string,
  inspectEnvironment: () => Promise<TTYEnv>,
  findExecutable: (bin: string) => Promise<string | undefined>,
  spawnDetachedProcess: (
    env: ApplicationEnvironment,
    command: LaunchProcess
  ) => Promise<LaunchedProcess>,
  spawnProxiedProcess: (
    env: ApplicationEnvironment,
    command: LaunchProcess
  ) => Promise<LaunchedProcess>
): SystemModule => {
  return {
    exit,
    findExecutable,
    inspectEnvironment,
    spawnDetachedProcess,
    spawnProxiedProcess,
    userdir: userdirProvider,
  }
}
