#!/usr/bin/env node

import { spawn } from 'child_process'

import { launch, readProject } from './project'
import { initTui, MainController } from './tui'
import { destroy } from './tui/destroy'

const main = async () => {
  const screen = initTui()

  const model = await readProject()

  const mainCtrl = new MainController({ screen, model })

  mainCtrl.on('dirty', () => {
    screen.render()
  })

  mainCtrl.on('launch', async () => {
    destroy(screen)
    const selected = model.components.filter((c) => c.selected)
    await launch(selected)
  })

  screen.key(['q', 'C-c'], () => process.exit(0))

  screen.render()
}

main()
