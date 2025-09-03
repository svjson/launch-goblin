#!/usr/bin/env node

import { launch } from './launch'
import { readProject } from './project'
import { initTui, destroy, readTTYTitleString } from './tui/framework'
import { LaunchGoblinApp } from './tui'
import { LogEvent } from './tui/framework'
import { ApplicationState } from './project'
import { saveLatestLaunch } from './config'
import { setTTYTitleString } from './tui/framework/tty'

const main = async () => {
  const targetAction = 'dev'
  const model: ApplicationState = await readProject(targetAction)
  model.originalWindowTitleString = await readTTYTitleString()

  if (model.project.launchers.length === 0) {
    console.error(
      `No launch strategy available for target action '${targetAction}'`
    )
    process.exit(1)
  }

  const screen = initTui()

  const log: string[] = []

  const app = new LaunchGoblinApp(screen, model)

  app.mainCtrl.on('launch', async () => {
    destroy(screen)
    const selected = model.project.components.filter((c) => c.selected)
    await saveLatestLaunch(model)
    const cmd = model.project.launchers[0].launchCommand(selected)
    await launch(cmd)
  })

  app.mainCtrl.on('log', (event: LogEvent) => {
    log.push(event.message)
  })

  app.mainCtrl.focus()

  screen.key(['q', 'C-c'], () => {
    destroy(screen)
    log.forEach((m) => console.log(m))
    process.exit(0)
  })

  process.on('exit', () => {
    setTTYTitleString(model.originalWindowTitleString ?? '')
  })

  screen.render()
}

main()
