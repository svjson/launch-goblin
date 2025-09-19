import supportsColor from 'supports-color'

import { readTTYTitleString } from './tty'

/**
 * Terminal environment details
 */
export interface TTYEnv {
  colorMode: ColorMode
  TERM: string
  terminal: string
  shell: string
  tty: boolean
  nt: string | null
}

/**
 * Ccolor mode supported by a terminal environment.
 */
export type ColorMode = 'truecolor' | '256' | '16' | '8' | 'monochrome'

/**
 * Determine the current shell or command interpreter in use.
 *
 * @return {string} The path to the shell or command interpreter, or 'none' if
 *                  it cannot be determined.
 */
const determineTTY = () => {
  return process.env.SHELL || process.env.ComSpec || 'none'
}

/**
 * Determine the terminal emulator in use based on environment variables.
 *
 * @return {string} The name of the terminal emulator, or 'Unknown' if it
 *                  cannot be determined.
 */
const determineTerminal = (): string => {
  if (process.env.TERM_PROGRAM) {
    return `${process.env.TERM_PROGRAM} ${process.env.TERM_PROGRAM_VERSION || ''}`.trim()
  }
  if (process.env.TERMINATOR_UUID) return 'Terminator'
  if (process.env.WT_SESSION) return 'Windows Terminal'
  if (process.env.ConEmuANSI) return 'ConEmu'
  if (process.env.ANSICON) return 'ANSICON'
  return 'Unknown'
}

/**
 * Determine the color mode supported by the current terminal.
 *
 * @return {ColorMode} The color mode: 'truecolor', '256', '16', '8', or 'monochrome'.
 */
const determineColorMode = (): ColorMode => {
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

/**
 * Inspect the current execution environment and return details about TTY, terminal,
 * shell, and color support.
 *
 * @returns {Promise<TTYEnv>} An object containing environment details.
 *
 * @example
 * ```ts
 * const env = await inspectEnvironment()
 * // {
 * //   shell: '/bin/zsh',
 * //   tty: true,
 * //   colorMode: 'truecolor',
 * //   TERM: 'xterm-256color',
 * //   Terminal: 'Terminator',
 * //   nt: 'xterm'
 * // }
 * ```
 */
export const inspectEnvironment = async (): Promise<TTYEnv> => {
  return {
    colorMode: determineColorMode(),
    TERM: process.env.TERM ?? '',
    terminal: determineTerminal(),
    shell: determineTTY(),
    tty: process.stdout.isTTY,
    nt: await readTTYTitleString(),
  }
}
