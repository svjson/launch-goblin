import blessed from 'neo-blessed'

export const destroy = (screen: blessed.Widgets.Screen) => {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }

  process.stdin.removeAllListeners('keypress')
  process.stdin.removeAllListeners('data')
  process.stdin.removeAllListeners('mouse')
  process.stdin.removeAllListeners()

  screen.removeAllListeners()

  screen.program.destroy()
  screen?.destroy()

  process.stdin.unref?.()
  process.stdout.unref?.()
  process.stderr.unref?.()

  process.stdin.setRawMode(false)
}
