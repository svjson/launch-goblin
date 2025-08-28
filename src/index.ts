#!/usr/bin/env node

import { launch, readProject } from './project'
import { initTui, MainController } from './tui'
import { destroy } from './tui/destroy'
import { FocusEvent, KeyMap } from './tui/controller'
import { LogEvent } from './tui/controller'

const main = async () => {
  const model = await readProject()

  const screen = initTui()

  const log: string[] = []

  let activeKeyMap: KeyMap = {}

  const mainCtrl = new MainController({ screen, model })

  mainCtrl.on('dirty', () => {
    screen.render()
  })

  mainCtrl.on('launch', async () => {
    destroy(screen)
    const selected = model.components.filter((c) => c.selected)
    await launch(selected)
  })

  mainCtrl.on('focus', (event: FocusEvent) => {
    activeKeyMap = event.component.keyMap
  })

  mainCtrl.on('log', (event: LogEvent) => {
    log.push(event.message)
  })

  mainCtrl.focus()

  screen.on('keypress', (ch, key) => {
    if (activeKeyMap[key.full]) {
      activeKeyMap[key.full].handler(ch, key)
    }
  })

  screen.key(['q', 'C-c'], () => {
    destroy(screen)
    log.forEach((m) => console.log(m))
    process.exit(0)
  })

  screen.render()
}

main()
