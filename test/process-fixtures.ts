import { ttyEnv } from './tui/framework/fixtures'

import { LaunchedProcess, LaunchProcess } from '@src/launch'
import { ProcessEvent } from '@src/launch/types'
import { SystemModule } from '@src/system'
import { TTYEnv, ApplicationEnvironment } from '@src/tui/framework'

export class LaunchedDummyProcess implements LaunchedProcess {
  constructor(public command: LaunchProcess) {}

  finished: boolean = false

  callbacks: Record<ProcessEvent, (() => void)[]> = {
    exit: [],
  }
  killCalls: NodeJS.Signals[] = []

  kill(sig: NodeJS.Signals): void {
    this.killCalls.push(sig)
  }
  on(event: ProcessEvent, callback: () => void): void {
    this.callbacks[event].push(callback)
  }

  die() {
    this.finished = true
    this.callbacks['exit'].forEach((cb) => cb())
  }
}

export class TestSystemModule implements SystemModule {
  exitCalls: number[] = []

  execPaths: Record<string, string>

  constructor(
    { execPaths }: { execPaths: Record<string, string> } = { execPaths: {} }
  ) {
    this.execPaths = execPaths
  }

  exit(signal: number): void {
    this.exitCalls.push(signal)
  }
  async findExecutable(bin: string): Promise<string | undefined> {
    return this.execPaths[bin]
  }
  async inspectEnvironment(): Promise<TTYEnv> {
    return ttyEnv()
  }
  async spawnDetachedProcess(
    _env: ApplicationEnvironment,
    command: LaunchProcess
  ): Promise<LaunchedProcess> {
    return new LaunchedDummyProcess(command)
  }
  async spawnProxiedProcess(
    _env: ApplicationEnvironment,
    command: LaunchProcess
  ): Promise<LaunchedProcess> {
    return new LaunchedDummyProcess(command)
  }
  userdir(): string {
    return '/home/klasse'
  }
}
