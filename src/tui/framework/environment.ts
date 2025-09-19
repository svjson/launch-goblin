import supportsColor from 'supports-color'

import { readTTYTitleString } from './tty'

export interface TTYEnv {
  colorMode: ColorMode
  TERM: string
  shell: string
  tty: boolean
  nt: string | null
}

export type ColorMode = 'truecolor' | '256' | '16' | '8' | 'monochrome'

const determineTTY = () => {
  return process.env.SHELL || process.env.ComSpec || 'none'
}

const determineColorMode = () => {
  const colorMode = supportsColor.stdout
  if (colorMode === false) {
    return 'monochrome'
  }

  switch (colorMode.level) {
    case 0:
      return 'monochrome'
    case 1:
      return '16'
    case 2:
      return '256'
    case 3:
      return 'truecolor'
  }
}

export const inspectEnvironment = async (): Promise<TTYEnv> => {
  return {
    colorMode: determineColorMode(),
    TERM: process.env.TERM ?? '',
    shell: determineTTY(),
    tty: process.stdout.isTTY,
    nt: await readTTYTitleString(),
  }
}
