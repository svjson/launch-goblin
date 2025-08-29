import blessed from 'neo-blessed'

export const initTui = () => {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'launch-goblin',
  })

  setTimeout(() => {
    screen.program.write('\x1b[?25l') // ANSI escape for "hide cursor"
  }, 10)

  screen.program.hideCursor()
  screen.program.setMode('256')

  return screen
}
