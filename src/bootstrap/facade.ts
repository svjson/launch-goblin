import { TTYEnv } from '@src/tui/framework'

export interface SystemModule {
  userdir(): string
  inspectEnvironment(): Promise<TTYEnv>
  findExecutable(bin: string): Promise<string | undefined>
}

export const makeSystemModule = (
  userdirProvider: () => string,
  inspectEnvironment: () => Promise<TTYEnv>,
  findExecutable: (bin: string) => Promise<string | undefined>
): SystemModule => {
  return {
    userdir: userdirProvider,
    inspectEnvironment,
    findExecutable,
  }
}
