import blessed from 'neo-blessed'
import { TTYEnv } from '../environment'
import { setTTYTitleString } from '../tty'

export const initTui = (ttyEnv: TTYEnv) => {
  const screen = blessed.screen({
    smartCSR: true,
    //    terminal: 'xterm-truecolor',
    title: 'launch-goblin',
  })

  const restoreTitle = () => {
    setTTYTitleString(ttyEnv.nt ?? '')
  }

  screen.on('destroy', restoreTitle)
  process.on('exit', restoreTitle)

  screen.program.setMode('256')

  return screen
}
