import blessed from 'neo-blessed'

export const initTui = () => {
  const screen = blessed.screen({
    smartCSR: true,
    //    terminal: 'xterm-truecolor',
    title: 'launch-goblin',
  })

  screen.program.setMode('256')

  return screen
}
