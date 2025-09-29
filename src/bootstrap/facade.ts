import { TTYEnv } from '@src/tui/framework'

export interface SystemModule {
  userdir(): string
  inspectEnvironment(): Promise<TTYEnv>
}

export const makeSystemModule = (
  userdirProvider: () => string,
  inspectEnvironment: () => Promise<TTYEnv>
): SystemModule => {
  return {
    userdir: userdirProvider,
    inspectEnvironment,
  }
}
