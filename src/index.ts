#!/usr/bin/env node

import { spawn } from 'child_process'

import { launch, readProject } from './project'
import { initTui, MainController } from './tui'
import { destroy } from './tui/destroy'
import { FocusEvent, KeyMap } from './tui/controller'

const main = async () => {
  const model = await readProject()

  const screen = initTui()

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

  mainCtrl.focus()

  screen.on('keypress', (_ch, key) => {
    if (activeKeyMap[key.name]) {
      activeKeyMap[key.name].handler()
    }
  })

  screen.key(['q', 'C-c'], () => process.exit(0))

  screen.render()
}

main()
