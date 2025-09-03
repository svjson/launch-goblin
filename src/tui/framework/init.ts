import blessed from 'neo-blessed'
import { hideCursor } from './tty'

export const initTui = () => {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'launch-goblin',
  })

  hideCursor(10)

  screen.program.hideCursor()
  screen.program.setMode('256')

  return screen
}
