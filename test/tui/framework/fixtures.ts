import {
  ApplicationEnvironment,
  DefaultTheme,
  noBackend,
  TTYEnv,
} from '@src/tui/framework'

export const ttyEnv = () => {
  return {
    colorMode: 'truecolor',
    shell: '/bin/sh',
    TERM: '256-truecolor',
    tty: true,
    terminal: 'Terminator',
    nt: '',
  } satisfies TTYEnv
}

export const applicationEnvironment = (): ApplicationEnvironment => {
  return {
    backend: noBackend(),
    theme: DefaultTheme,
    tty: ttyEnv(),
    log: [],
  }
}
